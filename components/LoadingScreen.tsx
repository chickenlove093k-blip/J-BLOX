
import React from 'react';
import { DeviceType } from '../types';

interface LoadingScreenProps {
  device?: DeviceType;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ device = DeviceType.DESKTOP }) => {
  const getDeviceIcon = () => {
    switch (device) {
      case DeviceType.VR: return 'fa-vr-cardboard';
      case DeviceType.XBOX: return 'fa-xbox';
      case DeviceType.SWITCH: return 'fa-gamepad';
      case DeviceType.MOBILE: return 'fa-mobile-screen';
      default: return 'fa-desktop';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000] flex flex-col items-center justify-center z-[100] gap-8">
      <div className="relative">
        <div className="w-24 h-24 bg-white rounded-2xl rotate-45 flex items-center justify-center animate-pulse shadow-2xl shadow-white/10">
          <div className="w-12 h-12 bg-black rounded-lg"></div>
        </div>
        <div className="absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          JesseBlox <span className="text-blue-500">{device === DeviceType.DESKTOP ? '' : device.split(' ')[0]}</span>
        </h1>
        <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
          <div className="h-full bg-blue-600 w-1/3 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
          <i className={`fas ${getDeviceIcon()}`}></i>
          Synthesizing {device} Experience...
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
