import React from 'react';
import { Menu } from 'lucide-react';
import mogAvatar from '../assets/mog.jpg';

export default function WalletHeader({ activeTab, onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0F0F10] border-b border-gray-800/10 sticky top-0 z-10">
      <button 
        onClick={onMenuClick}
        className="text-gray-400 hover:text-white p-2 rounded-lg active:scale-95 transition-transform flex items-center justify-center"
        aria-label="Menu"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <Menu className="w-6.5 h-6.5" />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#A78BFA]/30 flex items-center justify-center bg-[#1C1C1E]">
          <img 
            src={mogAvatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-bold text-lg text-white select-none tracking-tight">NFTs</span>
      </div>
      
      {/* Balancer placeholder for alignment */}
      <div className="w-10 h-10"></div>
    </header>
  );
}
