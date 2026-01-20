
import React, { useState } from 'react';
import { DeviceType } from '../types';

interface LoginProps {
  onLogin: (u: string) => void;
  device: DeviceType;
}

const LoginView: React.FC<LoginProps> = ({ onLogin, device }) => {
  const [username, setUsername] = useState('');

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl rotate-12 flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-black rounded-lg"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic">JesseBlox</h1>
          <div className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
             {device}
          </div>
          <p className="text-gray-500 text-sm italic">Create, Play, and Discover Anything</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Username / Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={() => onLogin(username || 'GuestUser')}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-lg shadow-lg shadow-blue-500/20"
          >
            Log In to {device.split(' ')[0]}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <button className="text-gray-500 text-sm font-bold hover:text-white transition-colors uppercase tracking-widest">Sign Up</button>
          <button className="text-blue-500 font-bold hover:underline text-xs">Forgot password or username?</button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
