import React from 'react';
import { DollarSign, LayoutGrid, ArrowLeftRight, Zap } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  // Navigation tabs mapping directly to the mockup:
  // 1. Dollar sign inside a circle (Wallet)
  // 2. 4-square grid (NFTs/DApps)
  // 3. Dual horizontal/vertical arrows (Exchange/Swap)
  // 4. Lightning bolt (Activity/Actions)
  const navItems = [
    { id: 'wallet', label: 'Wallet', icon: DollarSign, isCircle: true },
    { id: 'nfts', label: 'NFTs', icon: LayoutGrid },
    { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
    { id: 'activity', label: 'Activity', icon: Zap },
  ];

  return (
    <nav className="bg-[#1C1C1E] border-t border-gray-800/10 w-full max-w-md mx-auto sticky bottom-0 z-10">
      <div className="flex justify-around items-stretch h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex-1 flex flex-col items-center justify-center relative group active:scale-95 transition-transform"
              style={{ minHeight: '44px' }}
              aria-label={item.label}
            >
              {/* Active Tab Accent Line on top of the tab item */}
              <div 
                className={`absolute top-0 left-6 right-6 h-[3px] rounded-full transition-all duration-300 ${
                  isActive ? 'bg-[#A78BFA]' : 'bg-transparent'
                }`}
              />
              
              {item.isCircle ? (
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-white text-white bg-white/10' 
                      : 'border-gray-500 text-gray-500 group-hover:border-gray-300 group-hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <Icon 
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive 
                      ? 'text-white scale-105' 
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`} 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
