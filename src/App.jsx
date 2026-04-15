import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Gamepad2, Diamond, Music2, ArrowLeft, ChevronRight,
  CheckCircle2, History, Zap, Loader2, Trophy, ShoppingBag,
  Search, UserCircle2, Globe, Settings, PlusCircle, Database,
  UserPen, Trash2, AlertTriangle, XCircle, Users, MinusCircle,
  BarChart2, RefreshCw
} from 'lucide-react';

// ─── SERVICES ────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'pubg', name: 'PUBG UC', unit: 'UC',
    icon: <Gamepad2 className="w-8 h-8 text-orange-500" />,
    color: 'from-orange-500 to-yellow-600',
    fieldLabel: 'Player Username', placeholder: 'e.g. ShadowKiller99',
    packages: [
      { id: 'p1', amount: 60 }, { id: 'p2', amount: 325 },
      { id: 'p3', amount: 660 }, { id: 'p4', amount: 1800 }, { id: 'p5', amount: 3850 },
    ]
  },
  {
    id: 'freefire', name: 'Free Fire Diamonds', unit: 'Diamonds',
    icon: <Diamond className="w-8 h-8 text-cyan-400" />,
    color: 'from-cyan-500 to-blue-600',
    fieldLabel: 'Player ID', placeholder: 'e.g. 987654321',
    packages: [
      { id: 'f1', amount: 100 }, { id: 'f2', amount: 310 },
      { id: 'f3', amount: 520 }, { id: 'f4', amount: 1060 }, { id: 'f5', amount: 2180 },
    ]
  },
  {
    id: 'tiktok', name: 'TikTok Coins', unit: 'Coins',
    icon: <Music2 className="w-8 h-8 text-pink-500" />,
    color: 'from-pink-500 to-purple-600',
    fieldLabel: 'Username / Profile Link', placeholder: '@username or profile link',
    packages: [
      { id: 't1', amount: 70 }, { id: 't2', amount: 350 },
      { id: 't3', amount: 700 }, { id: 't4', amount: 1400 }, { id: 't5', amount: 3500 },
    ]
  }
];

// ─── UTILITY: Extract TikTok username from any URL format ─────────────────────
const extractTikTokUsername = (input) => {
  if (!input) return input;
  // Match https://www.tiktok.com/@username?...  or tiktok.com/@username
  const match = input.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/);
  if (match) return '@' + match[1];
  // Return as-is if not a URL
  return input;
};

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const supabase = createClient(
  'https://crqdrzxfrcijbhzsetpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycWRyenhmcmNpamJoenNldHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjg2NDgsImV4cCI6MjA5MTg0NDY0OH0.jyH9EM4Tq7_F3PUiZZvdTaR7aK_oCk6Y8IIAqgcnOQo'
);

// ─── DATA MAPPERS (Supabase snake_case ↔ app camelCase) ───────────────────────
const mapUser = (u) => !u ? null : {
  id: u.id, uid: u.uid, username: u.username || '',
  pubg: u.pubg || 0, freefire: u.freefire || 0, tiktok: u.tiktok || 0,
};
const mapOrder = (o) => !o ? null : {
  id: o.id, service: o.service, serviceId: o.service_id,
  amount: o.amount, unit: o.unit, playerId: o.player_id,
  username: o.username, date: o.date, newTotal: o.new_total,
};
const mapAudit = (a) => !a ? null : {
  id: a.id, action: a.action, targetId: a.target_id,
  service: a.service, delta: a.delta,
  before: a.before_val, after: a.after_val,
  count: a.count_val, newTotal: a.new_total,
  timestamp: a.timestamp,
};

// ─── API HELPERS (Supabase) ───────────────────────────────────────────────────
const api = {
  users: {
    getAll: async () => {
      const { data, error } = await supabase.from('users').select('*').order('id');
      if (error) throw error;
      return (data || []).map(mapUser);
    },
    getByUid: async (uid) => {
      const { data, error } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle();
      if (error) throw error;
      return mapUser(data);
    },
    create: async (user) => {
      const { data, error } = await supabase.from('users')
        .insert({ uid: user.uid, username: user.username || '', pubg: user.pubg || 0, freefire: user.freefire || 0, tiktok: user.tiktok || 0 })
        .select().single();
      if (error) throw error;
      return mapUser(data);
    },
    update: async (id, user) => {
      const { data, error } = await supabase.from('users')
        .update({ uid: user.uid, username: user.username, pubg: user.pubg || 0, freefire: user.freefire || 0, tiktok: user.tiktok || 0 })
        .eq('id', id).select().single();
      if (error) throw error;
      return mapUser(data);
    },
    delete: async (id) => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  },
  orders: {
    getAll: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapOrder);
    },
    create: async (order) => {
      const { data, error } = await supabase.from('orders')
        .insert({
          id: order.id, service: order.service, service_id: order.serviceId,
          amount: order.amount, unit: order.unit, player_id: order.playerId,
          username: order.username, date: order.date, new_total: order.newTotal,
        })
        .select().single();
      if (error) throw error;
      return mapOrder(data);
    },
  },
  stock: {
    getAll: async () => {
      const { data, error } = await supabase.from('stock').select('*');
      if (error) throw error;
      return data || [];
    },
    update: async (id, amount) => {
      const { data, error } = await supabase.from('stock').update({ amount }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
  },
  audit: {
    getAll: async () => {
      const { data, error } = await supabase.from('audit').select('*').order('id', { ascending: false }).limit(200);
      if (error) throw error;
      return (data || []).map(mapAudit);
    },
    create: async (entry) => {
      const row = {
        action: entry.action, target_id: entry.targetId,
        service: entry.service, delta: entry.delta,
        before_val: entry.before, after_val: entry.after,
        count_val: entry.count, new_total: entry.newTotal,
        timestamp: entry.timestamp,
      };
      Object.keys(row).forEach(k => row[k] === undefined && delete row[k]);
      const { data, error } = await supabase.from('audit').insert(row).select().single();
      if (error) throw error;
      return mapAudit(data);
    },
  },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
const App = () => {

  // ── View ──
  const [view, setView] = useState('home');

  // ── Purchase flow ──
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // ── Data from json-server ──
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  // ── Admin form ──
  const [adminPass, setAdminPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminTargetUsername, setAdminTargetUsername] = useState('');
  const [adminTargetService, setAdminTargetService] = useState('pubg');
  const [adminAmount, setAdminAmount] = useState('');
  const [adminOpMode, setAdminOpMode] = useState('add'); // add | subtract | set
  const [isAdminSaving, setIsAdminSaving] = useState(false);
  const [inventoryAmt, setInventoryAmt] = useState({ pubg: '', freefire: '', tiktok: '' });

  // ── Admin UI ──
  const [adminTab, setAdminTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState('id');
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // ── Toast ──
  const [toast, setToast] = useState(null);

  // ─── COMPUTED ─────────────────────────────────────────────────────────────
  // Convert stock array → { pubg: 50000, freefire: 50000, tiktok: 50000 }
  const stockMap = Object.fromEntries(stockItems.map(s => [s.id, s.amount]));

  // Resolved purchase amount (preset package OR custom input)
  const resolvedAmount = selectedPackage
    ? selectedPackage.amount
    : (parseInt(customAmount) || 0);

  // Filtered + sorted user list for admin panel
  const filteredUsers = users
    .filter(u => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return u.uid.toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (userSort === 'username') return (a.username || '').localeCompare(b.username || '');
      if (userSort === 'pubg')     return (b.pubg || 0) - (a.pubg || 0);
      if (userSort === 'freefire') return (b.freefire || 0) - (a.freefire || 0);
      if (userSort === 'tiktok')   return (b.tiktok || 0) - (a.tiktok || 0);
      return a.uid.localeCompare(b.uid);
    });

  // Dashboard stats
  const stats = {
    users:    users.length,
    uc:       users.reduce((s, u) => s + (u.pubg || 0), 0),
    diamonds: users.reduce((s, u) => s + (u.freefire || 0), 0),
    coins:    users.reduce((s, u) => s + (u.tiktok || 0), 0),
  };

  // Live balance preview in admin form
  const targetUser = users.find(u => u.uid === adminTargetId);
  const currentTargetBal = targetUser ? (targetUser[adminTargetService] || 0) : 0;
  const previewBal = adminAmount ? (() => {
    const n = parseInt(adminAmount) || 0;
    if (adminOpMode === 'add')      return currentTargetBal + n;
    if (adminOpMode === 'subtract') return Math.max(0, currentTargetBal - n);
    if (adminOpMode === 'set')      return n;
    return currentTargetBal;
  })() : null;

  // ─── LOAD DATA ────────────────────────────────────────────────────────────
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setDbLoading(true);
    setDbError(false);
    try {
      const [u, o, s, a] = await Promise.all([
        api.users.getAll(), api.orders.getAll(),
        api.stock.getAll(), api.audit.getAll(),
      ]);
      setUsers(u);
      setOrders(o.reverse()); // newest first
      setStockItems(s);
      setAuditLog(a.reverse()); // newest first
    } catch {
      setDbError(true);
    } finally {
      setDbLoading(false);
    }
  };

  // ─── TOAST ────────────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── AUDIT LOG ────────────────────────────────────────────────────────────
  const logAudit = async (entry) => {
    try {
      const saved = await api.audit.create({ ...entry, timestamp: new Date().toISOString() });
      setAuditLog(prev => [saved, ...prev].slice(0, 300));
    } catch { /* non-critical */ }
  };

  // ─── USER OPERATIONS ─────────────────────────────────────────────────────
  const getOrCreateUser = async (uid) => {
    const existing = await api.users.getByUid(uid);
    if (existing) return existing;
    return await api.users.create({ uid, username: '', pubg: 0, freefire: 0, tiktok: 0 });
  };

  // Core balance update — supports add / subtract / set modes
  const updateBalance = async (uid, service, amount, mode = 'add', username) => {
    const user = await getOrCreateUser(uid);
    const current = user[service] || 0;
    const n = parseInt(amount || 0);
    let newBal;
    if (mode === 'add')      newBal = current + n;
    else if (mode === 'subtract') newBal = Math.max(0, current - n);
    else if (mode === 'set')      newBal = Math.max(0, n);
    else                          newBal = current;

    const updated = {
      ...user,
      [service]: newBal,
      ...(username !== undefined ? { username } : {}),
    };
    const saved = await api.users.update(user.id, updated);
    setUsers(prev =>
      prev.some(u => u.uid === uid)
        ? prev.map(u => u.uid === uid ? saved : u)
        : [...prev, saved]
    );
    return saved;
  };

  const deleteUser = async (uid) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;
    await api.users.delete(user.id);
    setUsers(prev => prev.filter(u => u.uid !== uid));
    await logAudit({ action: 'DELETE_USER', targetId: uid });
    setConfirmDeleteId(null);
    setSelectedUserIds(prev => { const s = new Set(prev); s.delete(uid); return s; });
    showToast('warn', `User #${uid} deleted`);
  };

  const bulkDelete = async () => {
    const uids = [...selectedUserIds];
    const ids = users.filter(u => uids.includes(u.uid)).map(u => u.id);
    await Promise.all(ids.map(id => api.users.delete(id)));
    setUsers(prev => prev.filter(u => !uids.includes(u.uid)));
    await logAudit({ action: 'BULK_DELETE', count: uids.length });
    setSelectedUserIds(new Set());
    showToast('warn', `${uids.length} users deleted`);
  };

  const saveEditingUser = async () => {
    if (!editingUser) return;
    const saved = await api.users.update(editingUser.id, editingUser);
    setUsers(prev => prev.map(u => u.id === editingUser.id ? saved : u));
    await logAudit({ action: 'EDIT_PROFILE', targetId: editingUser.uid });
    setEditingUser(null);
    showToast('success', `Profile saved for #${editingUser.uid}`);
  };

  const toggleSelect = (uid) => {
    setSelectedUserIds(prev => {
      const s = new Set(prev);
      s.has(uid) ? s.delete(uid) : s.add(uid);
      return s;
    });
  };

  const toggleSelectAll = () => {
    setSelectedUserIds(
      selectedUserIds.size === filteredUsers.length
        ? new Set()
        : new Set(filteredUsers.map(u => u.uid))
    );
  };

  // ─── PURCHASE FLOW ────────────────────────────────────────────────────────
  const handleStartPurchase = (service) => {
    setSelectedService(service);
    setSelectedPackage(null);
    setCustomAmount('');
    setPlayerId('');
    setAccountData(null);
    setView('selection');
    window.scrollTo(0, 0);
  };

  const handleVerifyAccount = async () => {
    if (!playerId) return;
    setIsVerifying(true);

    // ── Fix: auto-extract TikTok username from pasted URLs ──
    const cleanId = selectedService.id === 'tiktok'
      ? extractTikTokUsername(playerId.trim())
      : playerId.trim();
    if (cleanId !== playerId) setPlayerId(cleanId);

    // Check our DB first
    const dbUser = await api.users.getByUid(cleanId);
    const existingBal = dbUser ? (dbUser[selectedService.id] || 0) : 0;
    const existingName = dbUser?.username || null;

    // ── PUBG: real API lookup ──
    // Dev: uses Vite proxy (/pubg-api → api.pubg.com)
    // Prod: uses Vercel serverless function (/api/pubg)
    const fetchPubgShard = (shard, name) => {
      if (import.meta.env.DEV) {
        return fetch(
          `/pubg-api/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(name)}`,
          { headers: { 'Accept': 'application/vnd.api+json' } }
        );
      }
      return fetch(`/api/pubg?shard=${shard}&playerName=${encodeURIComponent(name)}`);
    };

    if (selectedService.id === 'pubg') {
      try {
        const shards = ['steam', 'kakao', 'psn', 'xbox'];
        let found = null;
        for (const shard of shards) {
          const res = await fetchPubgShard(shard, cleanId);
          if (res.ok) {
            const json = await res.json();
            if (json.data?.length > 0) { found = { player: json.data[0], shard }; break; }
          }
        }
        if (found) {
          const realName = found.player.attributes?.name || cleanId;
          if (!existingName) await updateBalance(cleanId, 'pubg', 0, 'add', realName);
          setAccountData({
            username: realName, accountId: found.player.id,
            region: found.shard.toUpperCase(), currentBalance: existingBal,
            avatarColor: 'bg-gradient-to-br from-orange-500 to-yellow-500',
            isRealProfile: true,
          });
        } else {
          setAccountData({ notFound: true });
        }
      } catch {
        setAccountData({
          username: existingName || `Player_${cleanId.slice(-4)}`,
          region: 'Global', currentBalance: existingBal,
          avatarColor: 'bg-gradient-to-br from-orange-500 to-yellow-500',
          isRealProfile: !!existingName,
        });
      }
      setIsVerifying(false);
      return;
    }

    // ── Free Fire & TikTok: mock with DB lookup ──
    setTimeout(() => {
      setAccountData({
        username: existingName || (cleanId.startsWith('@') ? cleanId : `Player_${cleanId.slice(-4)}`),
        region: 'Global', currentBalance: existingBal,
        avatarColor: selectedService.id === 'freefire'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
          : 'bg-gradient-to-br from-pink-500 to-purple-600',
        isRealProfile: !!existingName,
      });
      setIsVerifying(false);
    }, 1000);
  };

  const handleConfirmPurchase = async () => {
    if (!resolvedAmount || !playerId || !accountData || accountData.notFound) return;
    const stock = stockMap[selectedService.id] || 0;
    if (stock < resolvedAmount) {
      showToast('error', `Insufficient stock! Only ${stock} ${selectedService.unit} left.`);
      return;
    }
    setView('processing');
    try {
      const updatedUser = await updateBalance(playerId, selectedService.id, resolvedAmount, 'add');
      // Deduct stock
      const newStock = stock - resolvedAmount;
      const updatedStock = await api.stock.update(selectedService.id, newStock);
      setStockItems(prev => prev.map(s => s.id === selectedService.id ? updatedStock : s));

      const order = {
        id: 'PS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        service: selectedService.name, serviceId: selectedService.id,
        amount: resolvedAmount, unit: selectedService.unit,
        playerId: playerId, username: accountData.username,
        date: new Date().toLocaleString(),
        newTotal: updatedUser[selectedService.id],
      };
      const saved = await api.orders.create(order);
      setOrders(prev => [saved, ...prev].slice(0, 100));
      setCurrentOrder(order);
      setView('confirmed');
    } catch (err) {
      showToast('error', 'Transaction failed. Please try again.');
      setView('selection');
    }
  };

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  const handleAdminLogin = () => {
    if (adminPass === 'admin123') { setView('adminDashboard'); setAdminLoginError(''); }
    else setAdminLoginError('Invalid password');
  };

  const handleAdminUpdate = async () => {
    if (!adminTargetId || !adminAmount) return;
    setIsAdminSaving(true);
    try {
      const before = users.find(u => u.uid === adminTargetId)?.[adminTargetService] || 0;
      const updated = await updateBalance(
        adminTargetId, adminTargetService,
        adminAmount, adminOpMode,
        adminTargetUsername || undefined
      );
      const after = updated[adminTargetService] || 0;
      const unit = SERVICES.find(s => s.id === adminTargetService)?.unit;
      await logAudit({
        action: `BALANCE_${adminOpMode.toUpperCase()}`,
        targetId: adminTargetId, service: adminTargetService,
        delta: parseInt(adminAmount), before, after,
      });
      showToast('success', `Updated: ${before} → ${after} ${unit}`);
      setAdminAmount('');
      setAdminTargetUsername('');
    } finally {
      setIsAdminSaving(false);
    }
  };

  const handleStockUpdate = async (serviceId, amount, mode) => {
    if (!amount) return;
    const current = stockMap[serviceId] || 0;
    const n = parseInt(amount);
    const newAmt = mode === 'add' ? current + n : Math.max(0, current - n);
    const updated = await api.stock.update(serviceId, newAmt);
    setStockItems(prev => prev.map(s => s.id === serviceId ? updated : s));
    await logAudit({ action: `STOCK_${mode.toUpperCase()}`, service: serviceId, delta: n, newTotal: newAmt });
    showToast('success', `Stock → ${newAmt.toLocaleString()}`);
  };

  const reset = () => {
    setView('home');
    setSelectedService(null); setSelectedPackage(null);
    setCustomAmount(''); setPlayerId('');
    setAccountData(null); setCurrentOrder(null);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : toast.type === 'error'  ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" />
           : toast.type === 'error' ? <XCircle className="w-4 h-4" />
           : <AlertTriangle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#13131a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <UserPen className="w-5 h-5 text-cyan-400" /> Edit User
              <span className="ml-auto text-xs text-gray-500 font-mono">#{editingUser.uid}</span>
            </h3>
            <div className="mb-4">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Username</label>
              <input type="text" value={editingUser.username || ''}
                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                className="w-full bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-xl p-3 outline-none text-sm" />
            </div>
            <div className="mb-6 space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Balances (direct override)</label>
              {SERVICES.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-24 text-gray-400">{s.unit}</span>
                  <input type="number" min="0" value={editingUser[s.id] || 0}
                    onChange={e => setEditingUser({ ...editingUser, [s.id]: parseInt(e.target.value) || 0 })}
                    className="flex-1 bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-xl p-2.5 outline-none text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black uppercase text-xs text-gray-400">
                Cancel
              </button>
              <button onClick={saveEditingUser}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-xl font-black uppercase text-xs shadow-lg shadow-cyan-500/20">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#13131a] border border-red-500/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-5 border border-red-500/20">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-xl font-black mb-2 text-red-400">Delete User?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Permanently remove <span className="text-white font-mono">#{confirmDeleteId}</span> and all their balance data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black uppercase text-xs">
                Cancel
              </button>
              <button onClick={() => deleteUser(confirmDeleteId)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-red-500/20">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 uppercase">
              Pro Seller's
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* DB status dot */}
            <div
              className={`w-2 h-2 rounded-full ${dbError ? 'bg-red-500 animate-pulse' : dbLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
              title={dbError ? 'DB Error — is json-server running?' : dbLoading ? 'Connecting…' : 'DB Connected'}
            />
            <button onClick={() => setView('history')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-cyan-400">
              <History className="w-6 h-6" />
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            <button onClick={() => setView('adminLogin')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all">
              <Settings className="w-3.5 h-3.5 text-cyan-400" /><span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative z-10">

        {/* ════ HOME ════ */}
        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="text-center py-10 md:py-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
                <Trophy className="w-3 h-3" /> Professional Gaming Services
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
                Top Tier Credits from <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Pro Seller's.
                </span>
              </h1>
              <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed px-4">
                The premier destination for instant in-game currency delivery. Fast, secure, and professional top-ups.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-16 max-w-5xl mx-auto text-left">
                {SERVICES.map(service => (
                  <button key={service.id} onClick={() => handleStartPurchase(service)}
                    className="group relative bg-[#13131a] border border-white/5 p-6 md:p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:shadow-[0_0_40px_-15px_rgba(34,211,238,0.4)] overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                    <div className="relative z-10">
                      <div className="bg-[#1a1a25] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{service.name}</h3>
                      <p className="text-gray-500 text-[10px] mb-6 uppercase font-bold tracking-tighter">Instant Delivery Channel</p>
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                        Start Top Up <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ════ SELECTION ════ */}
        {view === 'selection' && selectedService && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setView('home')}
              className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-xs font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Exit Secure Portal
            </button>
            <div className="bg-[#13131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className={`h-2 bg-gradient-to-r ${selectedService.color}`} />
              <div className="p-5 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 md:p-4 rounded-2xl">{selectedService.icon}</div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black">{selectedService.name}</h2>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Professional Verification & Deposit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</div>
                    <div className={`text-lg font-black ${(stockMap[selectedService.id] || 0) < 100 ? 'text-yellow-400' : 'text-white'}`}>
                      {(stockMap[selectedService.id] || 0).toLocaleString()}
                      <span className="text-cyan-400 text-[10px] ml-1">{selectedService.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">
                    Step 1: Enter {selectedService.fieldLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={playerId}
                      onChange={e => {
                        const val = selectedService.id === 'tiktok'
                          ? extractTikTokUsername(e.target.value)
                          : e.target.value;
                        setPlayerId(val);
                        setAccountData(null);
                      }}
                      disabled={isVerifying}
                      placeholder={selectedService.placeholder}
                      className="flex-1 bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-2xl p-4 outline-none transition-all text-base disabled:opacity-50 font-mono" />
                    <button onClick={handleVerifyAccount} disabled={!playerId || isVerifying}
                      className="px-6 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 whitespace-nowrap text-xs">
                      {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      Verify
                    </button>
                  </div>

                  {accountData && (
                    <div className="mt-5 animate-in slide-in-from-top-2 duration-300">
                      {accountData.notFound ? (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4">
                          <UserCircle2 className="w-8 h-8 text-red-400 flex-shrink-0" />
                          <div>
                            <p className="font-black text-red-400 text-sm">Player Not Found</p>
                            <p className="text-xs text-gray-500 mt-1">
                              No PUBG account for <span className="text-white font-mono">"{playerId}"</span>. Check the username and try again.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${accountData.avatarColor} flex items-center justify-center text-white flex-shrink-0`}>
                            <UserCircle2 className="w-8 h-8" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                              <h4 className="text-lg font-black text-white">{accountData.username}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${accountData.isRealProfile ? 'bg-green-500 text-black' : 'bg-cyan-500 text-black'}`}>
                                {accountData.isRealProfile ? '✓ Verified' : 'Active'}
                              </span>
                            </div>
                            <div className="flex justify-center sm:justify-start gap-3 text-xs font-bold text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1 uppercase"><Globe className="w-3 h-3 text-blue-400" /> {accountData.region}</span>
                              {accountData.accountId && <span className="font-mono text-gray-600">{accountData.accountId.slice(0, 16)}…</span>}
                            </div>
                          </div>
                          <div className="text-center sm:text-right">
                            <div className="text-[10px] font-black text-gray-500 uppercase">Balance</div>
                            <div className="text-xl font-black text-cyan-400">{accountData.currentBalance} {selectedService.unit}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div className={`transition-all duration-500 ${accountData && !accountData.notFound ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Step 2: Select or Enter Amount</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {selectedService.packages.map(pkg => (
                      <button key={pkg.id}
                        onClick={() => { setSelectedPackage(pkg); setCustomAmount(''); }}
                        className={`relative p-4 rounded-2xl border transition-all ${selectedPackage?.id === pkg.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                        <div className="font-black text-xl text-white mb-1">{pkg.amount}</div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase">{selectedService.unit}</div>
                        {selectedPackage?.id === pkg.id && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-cyan-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="mb-5">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Or enter custom amount</label>
                    <input type="number" min="1" placeholder={`Any amount of ${selectedService.unit}`}
                      value={customAmount}
                      onChange={e => { setCustomAmount(e.target.value); setSelectedPackage(null); }}
                      className="w-full bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-2xl p-4 outline-none transition-all text-lg font-mono" />
                  </div>

                  {/* Live order summary */}
                  {accountData && resolvedAmount > 0 && (
                    <div className="mb-5 bg-[#1a1a25] border border-white/10 rounded-2xl p-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Summary</div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Current Balance</span>
                        <span className="font-black text-white">{accountData.currentBalance} <span className="text-cyan-400">{selectedService.unit}</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Adding</span>
                        <span className="font-black text-green-400">+{resolvedAmount} {selectedService.unit}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                        <span className="text-sm font-black text-white uppercase">New Total</span>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-xl">
                          <span className="text-2xl font-black text-cyan-400">
                            {accountData.currentBalance + resolvedAmount} <span className="text-sm">{selectedService.unit}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button disabled={!resolvedAmount || !accountData} onClick={handleConfirmPurchase}
                    className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${!resolvedAmount || !accountData
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl hover:shadow-cyan-500/20 text-white hover:scale-[1.01]'}`}>
                    <PlusCircle className="w-6 h-6" /> Complete Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ PROCESSING ════ */}
        {view === 'processing' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full animate-pulse" />
              <Loader2 className="w-20 h-20 text-cyan-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-3xl font-black mb-4">Transacting with Pro Seller's Gateway</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Processing Secure Database Update...</p>
          </div>
        )}

        {/* ════ CONFIRMED ════ */}
        {view === 'confirmed' && currentOrder && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500 text-center">
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-10 shadow-2xl">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-4xl font-black mb-2">Delivery Success!</h2>
              <p className="text-gray-400 mb-10 text-sm">Credits delivered by <span className="text-cyan-400 font-bold">Pro Seller's Official</span>.</p>
              <div className="bg-[#1a1a25] rounded-2xl p-6 text-left border border-white/5 space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Product</span>
                  <span className="text-xs font-bold text-white uppercase">{currentOrder.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Player</span>
                  <span className="text-xs font-bold text-cyan-400">{currentOrder.username} ({currentOrder.playerId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Delivered</span>
                  <span className="text-xl font-black text-cyan-400">+{currentOrder.amount} {currentOrder.unit}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-4 items-center">
                  <span className="text-xs font-black text-white uppercase">Updated Balance</span>
                  <div className="bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20">
                    <span className="text-2xl font-black text-white">{currentOrder.newTotal} {currentOrder.unit}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={reset} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs text-gray-400">New Order</button>
                <button onClick={() => setView('history')} className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-cyan-500/20">View Records</button>
              </div>
            </div>
          </div>
        )}

        {/* ════ ADMIN LOGIN ════ */}
        {view === 'adminLogin' && (
          <div className="max-w-sm mx-auto animate-in zoom-in-95 duration-500">
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl text-cyan-400"><Settings className="w-8 h-8" /></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Admin Portal</h2>
              </div>
              <div className="space-y-5">
                <input type="password" value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-2xl p-4 outline-none text-center tracking-[10px]" />
                {adminLoginError && <p className="text-xs text-red-500 font-bold text-center">{adminLoginError}</p>}
                <button onClick={handleAdminLogin}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm hover:bg-cyan-400 transition-all">
                  Authenticate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ ADMIN DASHBOARD ════ */}
        {view === 'adminDashboard' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Database className="w-8 h-8 text-cyan-400" /> Global Management
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={loadAll} title="Refresh data"
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-400 hover:text-cyan-400">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setView('home')}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-xs uppercase transition-all">
                  Exit Dashboard
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users',    value: stats.users,              sub: 'registered',   color: 'text-white' },
                { label: 'Total UC',       value: stats.uc.toLocaleString(), sub: 'distributed', color: 'text-orange-400' },
                { label: 'Total Diamonds', value: stats.diamonds.toLocaleString(), sub: 'distributed', color: 'text-cyan-400' },
                { label: 'Total Coins',    value: stats.coins.toLocaleString(),    sub: 'distributed', color: 'text-pink-400' },
              ].map(card => (
                <div key={card.label} className="bg-[#13131a] border border-white/5 rounded-2xl p-5">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{card.label}</div>
                  <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                  <div className="text-[10px] text-gray-600 mt-1 uppercase">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6 w-full sm:w-fit overflow-x-auto">
              {[
                { id: 'users',     label: `Users (${users.length})`, Icon: Users },
                { id: 'inventory', label: 'Inventory',               Icon: ShoppingBag },
                { id: 'audit',     label: 'Audit Log',               Icon: History },
              ].map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setAdminTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${adminTab === id ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* ─── USERS TAB ─── */}
            {adminTab === 'users' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Adjust Balance Form */}
                <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6">
                  <h3 className="text-base font-black mb-5 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" /> Adjust Balance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Player ID</label>
                      <input type="text" placeholder="e.g. 512345 or @username" value={adminTargetId}
                        onChange={e => setAdminTargetId(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-cyan-400 font-mono text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Username (optional)</label>
                      <input type="text" placeholder="e.g. ProGamer99" value={adminTargetUsername}
                        onChange={e => setAdminTargetUsername(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Currency</label>
                      <select value={adminTargetService} onChange={e => setAdminTargetService(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-xs appearance-none">
                        <option value="pubg">PUBG UC</option>
                        <option value="freefire">Free Fire Diamonds</option>
                        <option value="tiktok">TikTok Coins</option>
                      </select>
                    </div>

                    {/* Operation Mode Toggle */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Operation</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { mode: 'add',      label: '+ Add',    active: 'text-green-400 border-green-500/40 bg-green-500/10' },
                          { mode: 'subtract', label: '− Deduct', active: 'text-red-400 border-red-500/40 bg-red-500/10' },
                          { mode: 'set',      label: '= Set',    active: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
                        ].map(({ mode, label, active }) => (
                          <button key={mode} onClick={() => setAdminOpMode(mode)}
                            className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${adminOpMode === mode ? active : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Amount</label>
                      <input type="number" min="0" placeholder="0" value={adminAmount}
                        onChange={e => setAdminAmount(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-sm" />
                    </div>

                    {/* Live balance preview */}
                    {adminTargetId && adminAmount && (
                      <div className="bg-[#0a0a0f] rounded-xl p-3 text-xs space-y-1.5 border border-white/5">
                        <div className="flex justify-between text-gray-500">
                          <span>Current</span>
                          <span className="font-mono">{currentTargetBal.toLocaleString()}</span>
                        </div>
                        <div className={`flex justify-between font-black ${adminOpMode === 'add' ? 'text-green-400' : adminOpMode === 'subtract' ? 'text-red-400' : 'text-yellow-400'}`}>
                          <span>
                            {adminOpMode === 'add' ? `+${adminAmount}` : adminOpMode === 'subtract' ? `−${adminAmount}` : `= ${adminAmount}`}
                          </span>
                          <span>→ {previewBal?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <button onClick={handleAdminUpdate} disabled={!adminTargetId || !adminAmount || isAdminSaving}
                      className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 flex items-center justify-center gap-2">
                      {isAdminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                      Apply Update
                    </button>
                  </div>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 bg-[#13131a] border border-white/10 rounded-3xl p-6">
                  <h3 className="text-base font-black mb-4 flex items-center gap-2 text-purple-400">
                    <Users className="w-4 h-4" /> Registered Users
                  </h3>

                  {/* Search + Sort */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input type="text" placeholder="Search by ID or username…" value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a25] border border-white/10 rounded-xl focus:border-cyan-500 outline-none text-sm" />
                      {userSearch && (
                        <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
                      )}
                    </div>
                    <select value={userSort} onChange={e => setUserSort(e.target.value)}
                      className="bg-[#1a1a25] border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-cyan-500 appearance-none">
                      <option value="id">Sort: ID</option>
                      <option value="username">Sort: Name</option>
                      <option value="pubg">UC ↓</option>
                      <option value="freefire">Diamonds ↓</option>
                      <option value="tiktok">Coins ↓</option>
                    </select>
                  </div>

                  {/* Bulk action bar */}
                  {selectedUserIds.size > 0 && (
                    <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
                      <span className="text-xs font-black text-yellow-400">{selectedUserIds.size} selected</span>
                      <button onClick={bulkDelete}
                        className="ml-auto px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-black uppercase">
                        Delete Selected
                      </button>
                      <button onClick={() => setSelectedUserIds(new Set())}
                        className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-black uppercase">
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Select all */}
                  {filteredUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-2 mb-2">
                      <input type="checkbox"
                        checked={selectedUserIds.size > 0 && selectedUserIds.size === filteredUsers.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded accent-cyan-500" />
                      <span className="text-[10px] text-gray-500 font-black uppercase">Select All ({filteredUsers.length})</span>
                    </div>
                  )}

                  {/* Cards */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {dbLoading ? (
                      <div className="text-center py-10"><Loader2 className="w-6 h-6 text-cyan-500 animate-spin mx-auto" /></div>
                    ) : dbError ? (
                      <div className="text-center py-10 text-red-400 text-sm">
                        <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Cannot reach database. Run <span className="font-mono bg-white/5 px-1 rounded">npm run dev</span>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-10">
                        <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-600 italic text-sm">{userSearch ? 'No users match' : 'No users yet'}</p>
                        {userSearch && <button onClick={() => setUserSearch('')} className="text-cyan-400 text-xs mt-2 font-bold">Clear search</button>}
                      </div>
                    ) : (
                      filteredUsers.map(user => (
                        <div key={user.uid} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 group hover:border-white/10 transition-all">
                          <input type="checkbox" checked={selectedUserIds.has(user.uid)} onChange={() => toggleSelect(user.uid)}
                            className="w-3.5 h-3.5 rounded accent-cyan-500 flex-shrink-0" />
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                            {(user.username || user.uid).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm truncate">
                              {user.username || <span className="text-gray-500 italic text-xs">Unassigned</span>}
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono">#{user.uid}</div>
                          </div>
                          <div className="hidden sm:flex gap-3 mr-1">
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] text-orange-500 font-black uppercase">UC</span>
                              <span className="text-xs font-black">{(user.pubg || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] text-cyan-500 font-black uppercase">DIA</span>
                              <span className="text-xs font-black">{(user.freefire || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] text-pink-500 font-black uppercase">COINS</span>
                              <span className="text-xs font-black">{(user.tiktok || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingUser({ ...user })} title="Edit profile"
                              className="p-1.5 bg-white/5 hover:bg-cyan-500/20 rounded-lg text-gray-400 hover:text-cyan-400 transition-all">
                              <UserPen className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setAdminTargetId(user.uid); setAdminTargetUsername(user.username || ''); }}
                              title="Quick adjust balance"
                              className="p-1.5 bg-white/5 hover:bg-yellow-500/20 rounded-lg text-gray-400 hover:text-yellow-400 transition-all">
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setConfirmDeleteId(user.uid)} title="Delete user"
                              className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── INVENTORY TAB ─── */}
            {adminTab === 'inventory' && (
              <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" /> Global Inventory Stock
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {SERVICES.map(s => {
                    const amt = stockMap[s.id] || 0;
                    const isLow = amt > 0 && amt < 100;
                    return (
                      <div key={s.id} className={`bg-white/5 border ${isLow ? 'border-yellow-500/30' : 'border-white/5'} p-5 rounded-2xl`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-gray-400 uppercase">{s.name}</span>
                          <div className={`w-2 h-2 rounded-full ${amt === 0 ? 'bg-red-500' : isLow ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                        </div>
                        <div className={`text-2xl font-black mb-1 ${isLow ? 'text-yellow-400' : 'text-white'}`}>
                          {amt.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-cyan-400 uppercase mb-4">
                          {s.unit} {isLow && '⚠ Low Stock'}
                        </div>
                        <div className="flex gap-2">
                          <input type="number" placeholder="amount"
                            value={inventoryAmt[s.id]}
                            onChange={e => setInventoryAmt({ ...inventoryAmt, [s.id]: e.target.value })}
                            className="flex-1 bg-[#1a1a25] border border-white/10 rounded-lg p-2 outline-none focus:border-cyan-500 text-xs" />
                          <button
                            onClick={() => { handleStockUpdate(s.id, inventoryAmt[s.id], 'add'); setInventoryAmt({ ...inventoryAmt, [s.id]: '' }); }}
                            title="Add stock"
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/20 transition-colors">
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { handleStockUpdate(s.id, inventoryAmt[s.id], 'subtract'); setInventoryAmt({ ...inventoryAmt, [s.id]: '' }); }}
                            title="Deduct stock"
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors">
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── AUDIT TAB ─── */}
            {adminTab === 'audit' && (
              <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" /> Admin Activity Log
                  </h3>
                  <span className="text-[10px] text-gray-500 font-black uppercase">{auditLog.length} entries</span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {auditLog.length === 0 ? (
                    <p className="text-gray-600 text-center py-10 italic text-sm">No admin actions recorded yet.</p>
                  ) : (
                    auditLog.map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl text-xs hover:bg-white/5 transition-all">
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] whitespace-nowrap ${
                          entry.action?.includes('DELETE') ? 'bg-red-500/20 text-red-400'
                          : entry.action?.includes('EDIT')  ? 'bg-yellow-500/20 text-yellow-400'
                          : entry.action?.includes('STOCK') ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-green-500/20 text-green-400'
                        }`}>{entry.action}</span>
                        <span className="text-gray-300 font-mono flex-1 truncate">
                          {entry.targetId && `#${entry.targetId}`}
                          {entry.service && ` · ${entry.service}`}
                          {entry.before !== undefined && ` · ${entry.before} → ${entry.after}`}
                          {entry.count && ` · ${entry.count} users`}
                          {entry.newTotal !== undefined && ` · total: ${entry.newTotal}`}
                        </span>
                        <span className="text-gray-600 whitespace-nowrap text-[9px]">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {view === 'history' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-left-4 duration-500">
            <button onClick={() => setView('home')}
              className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors uppercase text-xs font-black tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Return
            </button>
            <h2 className="text-4xl font-black mb-8 flex items-center gap-4">
              <History className="w-10 h-10 text-cyan-400" /> Transaction Records
            </h2>
            {orders.length === 0 ? (
              <div className="bg-[#13131a] border border-white/5 rounded-3xl p-20 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">No Records Available</h3>
                <button onClick={() => setView('home')}
                  className="px-8 py-3 bg-cyan-500 text-white rounded-full font-bold hover:bg-cyan-600 transition-colors uppercase text-xs mt-4">
                  Order Credits
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-[#13131a] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-500/10 p-3 rounded-xl text-cyan-400 font-black uppercase text-xs">
                        {order.unit === 'UC' ? 'UC' : order.unit === 'Diamonds' ? 'DIA' : 'TIK'}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{order.service}</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
                          {order.playerId} ({order.username}) · {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase font-black">Delivered</div>
                        <div className="text-2xl font-black text-cyan-400">+{order.amount}</div>
                      </div>
                      <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/20">
                        Verified
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 bg-[#0a0a0f] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-cyan-400 fill-current" />
            <span className="text-xl font-black tracking-tighter text-white uppercase">Pro Seller's</span>
          </div>
          <p className="text-gray-600 text-[10px] uppercase tracking-[5px] font-black">
            © 2024 Pro Seller's Global Services. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
