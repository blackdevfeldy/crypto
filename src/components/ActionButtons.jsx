import React from 'react';
import { ArrowDownLeft, CreditCard, Send } from 'lucide-react';

export default function ActionButtons({ onAction }) {
  const buttons = [
    { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { id: 'buy', label: 'Buy', icon: CreditCard },
    { id: 'send', label: 'Send', icon: Send },
  ];

  return (
    <div className="flex gap-3 px-4 py-4 w-full max-w-md mx-auto">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.id}
            onClick={() => onAction(btn.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 bg-[#A78BFA] text-[#0F0F10] font-bold rounded-2xl active:scale-[0.98] hover:bg-[#B59DFB] hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 text-sm md:text-base select-none"
            style={{ minHeight: '48px' }}
          >
            <Icon className="w-4 h-4 md:w-5 h-5 stroke-[2.5]" />
            <span>{btn.label}</span>
          </button>
        );
      })}
    </div>
  );
}
