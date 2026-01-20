
import React, { useState, useEffect } from 'react';
import { ViewType, UserProfile, GameExperience, DeviceType } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import DiscoverView from './components/DiscoverView';
import AvatarView from './components/AvatarView';
import StudioView from './components/StudioView';
import CatalogView from './components/CatalogView';
import LoginView from './components/LoginView';
import GameSession from './components/GameSession';
import LoadingScreen from './components/LoadingScreen';
import AiHubView from './components/AiHubView';

const VALID_CODES: Record<string, number> = {
  'JESSE': 50000,
  'BETA': 100000,
  'GEMINI': 250000,
  'VEO': 500000,
  'BANANA': 1000000,
  'ADMIN': 9999999,
  'MULTIVERSE': 5000000,
  'PRO': 10000000,
  'NOBRAINROT': 13371337,
  'OWNER': 1000000000
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [activeGame, setActiveGame] = useState<GameExperience | null>(null);
  const [device, setDevice] = useState<DeviceType>(DeviceType.DESKTOP);
  const [user, setUser] = useState<UserProfile>({
    username: '',
    displayName: '',
    avatarUrl: '',
    jBucks: 0,
    friendsCount: 0,
    isLoggedIn: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    let detectedDevice = DeviceType.DESKTOP;
    if (ua.includes('oculus') || ua.includes('quest')) detectedDevice = DeviceType.VR;
    else if (ua.includes('xbox')) detectedDevice = DeviceType.XBOX;
    else if (ua.includes('nintendo switch')) detectedDevice = DeviceType.SWITCH;
    else if (ua.includes('playstation')) detectedDevice = DeviceType.PLAYSTATION;
    else if (/android|iphone|ipad/i.test(ua)) detectedDevice = DeviceType.MOBILE;
    setDevice(detectedDevice);

    const savedUser = localStorage.getItem('jesseblox_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({ ...parsed, jBucks: parsed.jBucks || 1000000 });
    }
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username: string) => {
    const newUser = {
      username,
      displayName: username.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      jBucks: 1000000,
      friendsCount: 1337,
      isLoggedIn: true
    };
    setUser(newUser);
    localStorage.setItem('jesseblox_user', JSON.stringify(newUser));
  };

  const handleRedeemCode = (code: string) => {
    const upper = code.toUpperCase();
    if (VALID_CODES[upper]) {
      const amount = VALID_CODES[upper];
      const updatedUser = { ...user, jBucks: user.jBucks + amount };
      setUser(updatedUser);
      localStorage.setItem('jesseblox_user', JSON.stringify(updatedUser));
      alert(`🎉 SUCCESS! Redeemed Multiverse Code: +${amount.toLocaleString()} J-BUCKS!`);
      return true;
    }
    alert("❌ INVALID CODE. This code does not exist in the Multiverse.");
    return false;
  };

  const playInternalGame = (game: GameExperience) => {
    setActiveGame(game);
    setCurrentView(ViewType.PLAY);
  };

  if (loading) return <LoadingScreen device={device} />;
  if (!user.isLoggedIn) return <LoginView onLogin={handleLogin} device={device} />;

  const isFullScreen = currentView === ViewType.STUDIO || currentView === ViewType.PLAY;

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-blue-600/30 overflow-hidden font-sans">
      {!isFullScreen && (
        <Sidebar currentView={currentView} onViewChange={setCurrentView} device={device} />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {!isFullScreen && <Navbar user={user} device={device} onRedeem={handleRedeemCode} />}
        
        <main className={`flex-1 overflow-hidden ${!isFullScreen ? 'p-10 overflow-y-auto custom-scrollbar' : ''}`}>
          {currentView === ViewType.HOME && <HomeView user={user} onPlay={playInternalGame} />}
          {currentView === ViewType.DISCOVER && <DiscoverView onPlay={playInternalGame} />}
          {currentView === ViewType.CATALOG && <CatalogView />}
          {currentView === ViewType.AVATAR && <AvatarView />}
          {currentView === ViewType.AI_HUB && <AiHubView />}
          {currentView === ViewType.STUDIO && (
            <StudioView 
              onClose={() => setCurrentView(ViewType.HOME)} 
              onPlayTest={(game) => {
                setActiveGame(game);
                setCurrentView(ViewType.PLAY);
              }}
            />
          )}
          {currentView === ViewType.PLAY && activeGame && (
            <GameSession game={activeGame} device={device} onClose={() => {
              setCurrentView(ViewType.HOME);
              setActiveGame(null);
            }} />
          )}
          {currentView === ViewType.PROFILE && (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full group-hover:bg-blue-600/40 transition-all"></div>
                <img src={user.avatarUrl} className="w-48 h-48 rounded-full border-4 border-blue-500 relative z-10 shadow-2xl" />
              </div>
              <div className="text-center">
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">{user.displayName}</h1>
                <p className="text-blue-500 font-black uppercase tracking-widest text-xs mt-2">JesseBlox Legend since 2006</p>
              </div>
              <div className="flex gap-8 mt-10">
                 <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 min-w-[150px]">
                    <div className="text-3xl font-black text-yellow-500 italic">J</div>
                    <div className="text-xl font-bold mt-1">{user.jBucks.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">J-Bucks Balance</div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5 min-w-[150px]">
                    <div className="text-3xl font-black text-blue-500 italic"><i className="fas fa-users"></i></div>
                    <div className="text-xl font-bold mt-1">{user.friendsCount}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Global Contacts</div>
                 </div>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('jesseblox_user');
                  window.location.reload();
                }}
                className="mt-12 px-12 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/20 uppercase italic tracking-tighter"
              >
                DISCONNECT FROM MULTIVERSE
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
