
import React from 'react';
import { ViewType, DeviceType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  device: DeviceType;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, device }) => {
  const navItems = [
    { id: ViewType.HOME, icon: 'fa-home', label: 'Home' },
    { id: ViewType.DISCOVER, icon: 'fa-compass', label: 'Discover' },
    { id: ViewType.CATALOG, icon: 'fa-shopping-bag', label: 'Catalog' },
    { id: ViewType.AVATAR, icon: 'fa-user-astronaut', label: 'Avatar' },
    { id: ViewType.AI_HUB, icon: 'fa-sparkles', label: 'JesseAI' },
    { id: ViewType.STUDIO, icon: 'fa-hammer', label: 'Create' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center md:items-stretch transition-all">
      <div className="p-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
          <div className="w-6 h-6 bg-black rounded-sm rotate-12"></div>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="font-extrabold text-2xl tracking-tighter uppercase leading-none">JESSEBLOX</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} text-lg w-6 flex justify-center`}></i>
            <span className="hidden md:block font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
