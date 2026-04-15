import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Diamond, 
  Music2, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  History, 
  User, 
  ShieldCheck, 
  Zap,
  Loader2,
  Trophy,
  ShoppingBag,
  Search,
  UserCircle2,
  Globe,
  Star,
  RefreshCw,
  Settings,
  PlusCircle,
  Database,
  UserPen
} from 'lucide-react';

// --- MOCK SERVICES DATA ---
const SERVICES = [
  {
    id: 'pubg',
    name: 'PUBG UC',
    unit: 'UC',
    icon: <Gamepad2 className="w-8 h-8 text-orange-500" />,
    color: 'from-orange-500 to-yellow-600',
    fieldLabel: 'Player ID',
    placeholder: 'e.g. 5123456789',
    packages: [
      { id: 'p1', amount: 60 },
      { id: 'p2', amount: 325 },
      { id: 'p3', amount: 660 },
      { id: 'p4', amount: 1800 },
      { id: 'p5', amount: 3850 },
    ]
  },
  {
    id: 'freefire',
    name: 'Free Fire Diamonds',
    unit: 'Diamonds',
    icon: <Diamond className="w-8 h-8 text-cyan-400" />,
    color: 'from-cyan-500 to-blue-600',
    fieldLabel: 'Player ID',
    placeholder: 'e.g. 987654321',
    packages: [
      { id: 'f1', amount: 100 },
      { id: 'f2', amount: 310 },
      { id: 'f3', amount: 520 },
      { id: 'f4', amount: 1060 },
      { id: 'f5', amount: 2180 },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok Coins',
    unit: 'Coins',
    icon: <Music2 className="w-8 h-8 text-pink-500" />,
    color: 'from-pink-500 to-purple-600',
    fieldLabel: 'Username / Profile Link',
    placeholder: '@username or profile link',
    packages: [
      { id: 't1', amount: 70 },
      { id: 't2', amount: 350 },
      { id: 't3', amount: 700 },
      { id: 't4', amount: 1400 },
      { id: 't5', amount: 3500 },
    ]
  }
];

const App = () => {
  const [view, setView] = useState('home'); // home, selection, processing, confirmed, history, adminLogin, adminDashboard
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Mock Database for User Data (Balances + Profiles)
  const [userDatabase, setUserDatabase] = useState({}); // { 'id': { balances: {pubg: 0}, username: 'Name' } }
  
  // Admin State & Global Inventory
  const [globalStock, setGlobalStock] = useState({ pubg: 0, freefire: 0, tiktok: 0 });
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminAddAmount, setAdminAddAmount] = useState('');
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminTargetUsername, setAdminTargetUsername] = useState('');
  const [adminTargetService, setAdminTargetService] = useState('pubg');
  const [inventoryUpdateAmount, setInventoryUpdateAmount] = useState({ pubg: '', freefire: '', tiktok: '' });

  // Load state from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('nexus_order_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedDatabase = localStorage.getItem('nexus_user_balances');
    if (savedDatabase) setUserDatabase(JSON.parse(savedDatabase));

    const savedInventory = localStorage.getItem('nexus_global_inventory');
    if (savedInventory) setGlobalStock(JSON.parse(savedInventory));
  }, []);

  const updateGlobalStock = (serviceKey, amount) => {
    setGlobalStock(prev => {
      const updated = { ...prev, [serviceKey]: (prev[serviceKey] || 0) + parseInt(amount || 0) };
      localStorage.setItem('nexus_global_inventory', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUserData = (id, serviceKey, amount, customUsername) => {
    const currentDb = { ...userDatabase };
    if (!currentDb[id]) {
      currentDb[id] = { balances: { pubg: 0, freefire: 0, tiktok: 0 }, username: '' };
    }
    
    // Update balance if amount provided
    if (amount !== undefined) {
      currentDb[id].balances[serviceKey] = (currentDb[id].balances[serviceKey] || 0) + parseInt(amount || 0);
    }
    
    // Update username if provided
    if (customUsername) {
      currentDb[id].username = customUsername;
    }
    
    setUserDatabase(currentDb);
    localStorage.setItem('nexus_user_balances', JSON.stringify(currentDb));
    return currentDb[id];
  };

  const saveToHistory = (order) => {
    const updated = [order, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('nexus_order_history', JSON.stringify(updated));
  };

  const handleStartPurchase = (service) => {
    setSelectedService(service);
    setSelectedPackage(null);
    setCustomAmount('');
    setPlayerId('');
    setAccountData(null);
    setView('selection');
    window.scrollTo(0, 0);
  };

  const handleVerifyAccount = () => {
    if (!playerId) return;
    setIsVerifying(true);
    
    // Simulate API delay
    setTimeout(() => {
      const existingUser = userDatabase[playerId];
      const existingBalance = existingUser?.balances[selectedService.id] || 0;
      const existingName = existingUser?.username;

      setAccountData({
        username: existingName || (playerId.includes('@') ? playerId : `Shadow_${playerId.slice(-3)}`),
        level: Math.floor(Math.random() * 80) + 10,
        region: 'Global',
        avatarColor: 'bg-gradient-to-br from-cyan-500 to-purple-500',
        currentBalance: existingBalance,
        isRealProfile: !!existingName
      });
      setIsVerifying(false);
    }, 1200);
  };

  const resolvedAmount = selectedPackage ? selectedPackage.amount : (parseInt(customAmount) || 0);

  const handleConfirmPurchase = () => {
    if (!resolvedAmount || !playerId || !accountData) return;
    
    // Check stock before proceeding
    if (globalStock[selectedService.id] < resolvedAmount) {
      alert(`Insufficient Global Stock! Only ${globalStock[selectedService.id]} ${selectedService.unit} left.`);
      return;
    }

    setView('processing');

    setTimeout(() => {
      const updatedUser = updateUserData(playerId, selectedService.id, resolvedAmount);
      
      // Deduct from Global Inventory
      updateGlobalStock(selectedService.id, -resolvedAmount);

      const order = {
        id: 'PS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        service: selectedService.name,
        serviceId: selectedService.id,
        amount: resolvedAmount,
        unit: selectedService.unit,
        playerId: playerId,
        username: accountData.username,
        date: new Date().toLocaleString(),
        newTotal: updatedUser.balances[selectedService.id]
      };
      setCurrentOrder(order);
      saveToHistory(order);
      setView('confirmed');
    }, 2000);
  };

  const handleAdminLogin = () => {
    if (adminPass === 'admin123') {
      setView('adminDashboard');
      setAdminError('');
    } else {
      setAdminError('Invalid Admin Password');
    }
  };

  const handleAdminUpdate = () => {
    if (!adminTargetId) return;
    updateUserData(adminTargetId, adminTargetService, adminAddAmount, adminTargetUsername);
    setAdminAddAmount('');
    setAdminTargetUsername('');
    const btn = document.getElementById('admin-btn');
    if (btn) btn.innerText = 'Database Updated!';
    setTimeout(() => { if (btn) btn.innerText = 'Apply Update'; }, 2000);
  };

  const reset = () => {
    setView('home');
    setSelectedService(null);
    setSelectedPackage(null);
    setCustomAmount('');
    setPlayerId('');
    setAccountData(null);
    setCurrentOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-['Inter'] selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 uppercase font-['Outfit']">
              Pro Seller's
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setView('history')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-cyan-400">
              <History className="w-6 h-6" />
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-1 md:mx-2" />
            <button onClick={() => setView('adminLogin')} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative z-10">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="text-center py-10 md:py-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
                <Trophy className="w-3 h-3" /> Professional Gaming Services
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] font-['Outfit']">
                Top Tier Credits from <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Pro Seller's.
                </span>
              </h1>
              <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed px-4">
                The premier destination for instant in-game currency delivery. Trust Pro Seller's for fast, secure, and professional top-ups for your gaming needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-16 max-w-5xl mx-auto text-left">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleStartPurchase(service)}
                    className="group relative bg-[#13131a] border border-white/5 p-6 md:p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:shadow-[0_0_40px_-15px_rgba(34,211,238,0.4)] overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                    <div className="relative z-10">
                      <div className="bg-[#1a1a25] w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors font-['Outfit']">{service.name}</h3>
                      <p className="text-gray-500 text-[10px] md:text-xs mb-6 uppercase font-bold tracking-tighter">Instant Delivery Channel</p>
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs md:text-sm uppercase tracking-wider">
                        Start Top Up <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: SELECTION */}
        {view === 'selection' && selectedService && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-[10px] md:text-sm font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Exit Secure Portal
            </button>

            <div className="bg-[#13131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className={`h-2 bg-gradient-to-r ${selectedService.color}`} />
              <div className="p-5 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 md:p-4 rounded-2xl">{selectedService.icon}</div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black font-['Outfit']">{selectedService.name}</h2>
                      <p className="text-gray-500 text-[10px] md:text-sm uppercase font-bold tracking-tighter">Professional Verification & Deposit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock Available</div>
                    <div className="text-lg md:text-xl font-black text-white">{globalStock[selectedService.id].toLocaleString()} <span className="text-cyan-400 text-[10px]">{selectedService.unit}</span></div>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">
                    Step 1: Enter {selectedService.fieldLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text"
                      value={playerId}
                      onChange={(e) => {
                        setPlayerId(e.target.value);
                        setAccountData(null);
                      }}
                      disabled={isVerifying}
                      placeholder={selectedService.placeholder}
                      className="flex-1 bg-[#1a1a25] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl p-4 outline-none transition-all text-base md:text-lg disabled:opacity-50 font-mono"
                    />
                    <button 
                      onClick={handleVerifyAccount}
                      disabled={!playerId || isVerifying}
                      className="px-8 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 whitespace-nowrap text-xs"
                    >
                      {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      Verify Profile
                    </button>
                  </div>

                  {accountData && (
                    <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl ${accountData.avatarColor} flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 flex-shrink-0`}>
                          <UserCircle2 className="w-10 h-10" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <h4 className="text-lg md:text-xl font-black text-white font-['Outfit']">{accountData.username}</h4>
                            <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded font-black uppercase">
                              {accountData.isRealProfile ? 'Verified Pro' : 'Active Account'}
                            </span>
                          </div>
                          <div className="flex justify-center sm:justify-start gap-4 text-[10px] md:text-xs font-bold text-gray-500">
                            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-500" /> Lv. {accountData.level}</span>
                            <span className="flex items-center gap-1 uppercase"><Globe className="w-3.5 h-3.5 text-blue-400" /> {accountData.region}</span>
                          </div>
                        </div>
                        <div className="text-center sm:text-right border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 w-full sm:w-auto">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Current Balance</div>
                            <div className="text-xl md:text-2xl font-black text-cyan-400">{accountData.currentBalance} {selectedService.unit}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-500 ${accountData ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Step 2: Select or Enter Amount</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {selectedService.packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => { setSelectedPackage(pkg); setCustomAmount(''); }}
                        className={`relative p-4 md:p-5 rounded-2xl border transition-all ${
                          selectedPackage?.id === pkg.id
                          ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_-10px_rgba(34,211,238,0.3)]'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="font-black text-xl md:text-2xl text-white mb-1">{pkg.amount}</div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{selectedService.unit}</div>
                        {selectedPackage?.id === pkg.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount input */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Or enter custom amount</label>
                    <input
                      type="number"
                      min="1"
                      placeholder={`Any amount of ${selectedService.unit}`}
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedPackage(null); }}
                      className="w-full bg-[#1a1a25] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl p-4 outline-none transition-all text-lg font-mono"
                    />
                  </div>

                  {/* Live order summary */}
                  {accountData && resolvedAmount > 0 && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-300 bg-[#1a1a25] border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Order Summary</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Current Balance</span>
                        <span className="font-black text-white">{accountData.currentBalance} <span className="text-cyan-400">{selectedService.unit}</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Adding</span>
                        <span className="font-black text-green-400">+{resolvedAmount} <span className="text-green-400/70">{selectedService.unit}</span></span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                        <span className="text-sm font-black text-white uppercase tracking-wider">New Total</span>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-xl">
                          <span className="text-2xl font-black text-cyan-400">{accountData.currentBalance + resolvedAmount} <span className="text-base">{selectedService.unit}</span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!resolvedAmount || !accountData}
                    onClick={handleConfirmPurchase}
                    className={`w-full py-5 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 transition-all ${
                      !resolvedAmount || !accountData
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl hover:shadow-cyan-500/20 text-white hover:scale-[1.01]'
                    }`}
                  >
                    <PlusCircle className="w-6 h-6" />
                    Complete Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROCESSING */}
        {view === 'processing' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full animate-pulse" />
              <Loader2 className="w-20 h-20 text-cyan-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter">Transacting with Pro Seller's Gateway</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Processing Secure Database Update...</p>
          </div>
        )}

        {/* VIEW: CONFIRMED */}
        {view === 'confirmed' && currentOrder && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500 text-center">
            <div className="bg-[#13131a] border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-4xl font-black mb-2 text-white">Delivery Success!</h2>
              <p className="text-gray-400 mb-10 text-sm">Credits delivered by <span className="text-cyan-400 font-bold">Pro Seller's Official</span>.</p>

              <div className="bg-[#1a1a25] rounded-2xl p-6 text-left border border-white/5 space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Product</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{currentOrder.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Delivered Quantity</span>
                  <span className="text-xl font-black text-cyan-400">+{currentOrder.amount} {currentOrder.unit}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-4 items-center">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Updated Balance</span>
                  <div className="bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20">
                    <span className="text-2xl font-black text-white">{currentOrder.newTotal} {currentOrder.unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={reset} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs transition-all text-gray-400 hover:text-white">New Order</button>
                <button onClick={() => setView('history')} className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black uppercase text-xs transition-all shadow-lg shadow-cyan-500/20">View Records</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ADMIN LOGIN */}
        {view === 'adminLogin' && (
          <div className="max-md mx-auto animate-in zoom-in-95 duration-500">
             <div className="bg-[#13131a] border border-white/10 rounded-3xl p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl text-cyan-400"><Settings className="w-8 h-8" /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Internal Dashboard</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[4px] mb-3 ml-1 text-center">Authorization Key</label>
                    <input 
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1a1a25] border border-white/10 focus:border-cyan-500 rounded-2xl p-4 outline-none text-center tracking-[10px]"
                    />
                    {adminError && <p className="mt-2 text-xs text-red-500 font-bold text-center">{adminError}</p>}
                    <p className="mt-4 text-[10px] text-gray-600 font-bold text-center italic">Pass: admin123</p>
                  </div>
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm hover:bg-cyan-400 transition-all"
                  >
                    Authenticate
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {view === 'adminDashboard' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4 font-['Outfit']">
                <Database className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
                Global Management
              </h2>
              <button onClick={() => setView('home')} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-[10px] uppercase transition-all">Exit Dashboard</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Inventory Management */}
              <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 md:p-8 lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg md:text-xl font-black flex items-center gap-2 font-['Outfit']">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" /> Global Inventory Stock
                  </h3>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Live Updates Enabled</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {SERVICES.map(s => (
                    <div key={s.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">{s.name}</span>
                        <div className={`w-2 h-2 rounded-full ${globalStock[s.id] > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="text-2xl font-black text-white mb-4">
                        {globalStock[s.id].toLocaleString()} <span className="text-[10px] text-cyan-400 uppercase">{s.unit}</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          placeholder="+ refill"
                          value={inventoryUpdateAmount[s.id]}
                          onChange={(e) => setInventoryUpdateAmount({...inventoryUpdateAmount, [s.id]: e.target.value})}
                          className="flex-1 bg-[#1a1a25] border border-white/10 rounded-lg p-2 outline-none focus:border-cyan-500 text-xs text-white"
                        />
                        <button 
                          onClick={() => {
                            updateGlobalStock(s.id, inventoryUpdateAmount[s.id]);
                            setInventoryUpdateAmount({...inventoryUpdateAmount, [s.id]: ''});
                          }}
                          className="p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-600 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-2 font-['Outfit']">
                  <PlusCircle className="w-5 h-5 text-green-400" /> Adjust Balances
                </h3>
                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Target Player ID / Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. 512345"
                      value={adminTargetId}
                      onChange={(e) => setAdminTargetId(e.target.value)}
                      className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-cyan-400 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Assign Profile Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. ProGamer_99"
                      value={adminTargetUsername}
                      onChange={(e) => setAdminTargetUsername(e.target.value)}
                      className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Currency</label>
                      <select 
                        value={adminTargetService}
                        onChange={(e) => setAdminTargetService(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 appearance-none text-[10px]"
                      >
                        <option value="pubg">PUBG UC</option>
                        <option value="freefire">Free Fire Diamonds</option>
                        <option value="tiktok">TikTok Coins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Add Amount</label>
                      <input 
                        type="number"
                        placeholder="0"
                        value={adminAddAmount}
                        onChange={(e) => setAdminAddAmount(e.target.value)}
                        className="w-full bg-[#1a1a25] border border-white/10 rounded-xl p-3 outline-none focus:border-cyan-500 text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    id="admin-btn"
                    onClick={handleAdminUpdate}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 mt-4 text-xs"
                  >
                    Apply Update
                  </button>
                </div>
              </div>

              <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-2 text-purple-400 font-['Outfit']">
                   <UserCircle2 className="w-5 h-5" /> Registered Pros
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.keys(userDatabase).length === 0 ? (
                    <p className="text-gray-600 text-center py-10 italic text-sm">Waiting for client activity...</p>
                  ) : (
                    Object.entries(userDatabase).map(([id, data]) => (
                      <div key={id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex-1">
                          <div className="font-bold text-white text-xs md:text-sm flex items-center gap-2">
                            {data.username || 'Unassigned'} 
                            <span className="text-[10px] text-gray-600 font-mono">#{id}</span>
                          </div>
                          <div className="flex gap-4 mt-2">
                             <div className="flex flex-col">
                                <span className="text-[8px] text-orange-500 font-black uppercase">UC</span>
                                <span className="text-[10px] md:text-xs font-black">{data.balances.pubg || 0}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] text-cyan-500 font-black uppercase">DIA</span>
                                <span className="text-[10px] md:text-xs font-black">{data.balances.freefire || 0}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] text-pink-500 font-black uppercase">COINS</span>
                                <span className="text-[10px] md:text-xs font-black">{data.balances.tiktok || 0}</span>
                             </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setAdminTargetId(id); setAdminTargetUsername(data.username); }}
                          className="p-2 opacity-100 md:opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {view === 'history' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-left-4 duration-500">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors uppercase text-[10px] font-black tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </button>
            <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-4 font-['Outfit']">
              <History className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" /> Transaction Records
            </h2>

            {history.length === 0 ? (
              <div className="bg-[#13131a] border border-white/5 rounded-3xl py-16 md:py-24 text-center px-6">
                <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">No Records Available</h3>
                <p className="text-gray-500 text-sm mb-8">Start your first top-up to see activities here.</p>
                <button onClick={() => setView('home')} className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full font-black hover:bg-cyan-500/20 transition-all uppercase text-[10px] tracking-widest">Order Credits Now</button>
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {history.map((order) => (
                  <div key={order.id} className="bg-[#13131a] border border-white/5 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-500/10 w-12 h-12 flex items-center justify-center rounded-xl text-cyan-400 font-black uppercase text-[10px]">{order.serviceId === 'pubg' ? 'UC' : order.serviceId === 'freefire' ? 'DIA' : 'TIK'}</div>
                      <div>
                        <h4 className="font-bold text-base md:text-lg">{order.service}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Account: {order.username} • {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                       <div className="text-left md:text-right">
                         <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Delivered</div>
                         <div className="text-xl font-black text-cyan-400">+{order.amount}</div>
                       </div>
                       <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">Verified</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 bg-[#0a0a0f] py-12 relative z-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-cyan-400 fill-current" />
            <span className="text-xl font-black tracking-tighter text-white uppercase font-['Outfit']">Pro Seller's</span>
          </div>
          <p className="text-gray-600 text-[8px] md:text-[10px] uppercase tracking-[2px] md:tracking-[5px] font-black mb-4">
            Professional Gaming Infrastructure • Official Certified Shop
          </p>
          <p className="text-gray-800 text-[8px] uppercase tracking-widest font-bold">
            © 2024 Pro Seller's Global Services. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
