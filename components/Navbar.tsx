
import React, { useState } from 'react';
import { UserProfile, DeviceType } from '../types';

interface NavbarProps {
  user: UserProfile;
  device: DeviceType;
  onRedeem: (code: string) => boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, device, onRedeem }) => {
  const [code, setCode] = useState('');
  const [showRedeem, setShowRedeem] = useState(false);

  const getDeviceIcon = () => {
    switch (device) {
      case DeviceType.VR: return 'fa-vr-cardboard';
      case DeviceType.XBOX: return 'fa-xbox';
      case DeviceType.SWITCH: return 'fa-gamepad';
      case DeviceType.MOBILE: return 'fa-mobile-screen';
      default: return 'fa-desktop';
    }
  };

  const handleRedeem = () => {
    if (onRedeem(code)) {
      setCode('');
      setShowRedeem(false);
    }
  };

  return (
    <header className="h-20 bg-[#111]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder={`Search JesseBlox ${device}...`}
            className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-8">
        <div className="hidden lg:flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">
          <i className={`fas ${getDeviceIcon()} text-blue-500`}></i>
          {device}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowRedeem(!showRedeem)}
            className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 font-bold text-sm shadow-lg shadow-yellow-500/5 hover:bg-yellow-500/20 transition-all"
          >
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-inner">J</div>
            {user.jBucks.toLocaleString()} <span className="text-[10px] opacity-70 ml-1">J-BUCKS</span>
          </button>
          
          {showRedeem && (
            <div className="absolute top-full right-0 mt-4 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Redeem Code</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="CODE"
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={handleRedeem}
                  className="bg-blue-600 px-3 py-1 rounded-lg font-black text-[10px] hover:bg-blue-700"
                >
                  REDEEM
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm leading-tight">{user.displayName}</p>
            <p className="text-xs text-gray-500 leading-tight">@{user.username}</p>
          </div>
          <img 
            src={user.avatarUrl} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-all object-cover shadow-lg"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
