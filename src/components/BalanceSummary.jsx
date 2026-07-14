import React from 'react';

export default function BalanceSummary({ portfolio, prices, loading }) {
  // Calculate values
  let totalValue = 0;
  let totalChangeUsd = 0;

  portfolio.forEach(asset => {
    const priceData = prices[asset.id];
    const currentPrice = priceData ? priceData.usd : 0;
    const change24hPercent = priceData ? priceData.usd_24h_change : 0;
    
    const assetValue = asset.balance * currentPrice;
    const assetChangeUsd = assetValue * (change24hPercent / 100);

    totalValue += assetValue;
    totalChangeUsd += assetChangeUsd;
  });

  const totalChangePercent = totalValue > 0 ? (totalChangeUsd / totalValue) * 100 : 0;

  // Format values
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalValue);

  const isPositive = totalChangeUsd >= 0;
  const sign = isPositive ? '+' : '';
  const formattedChangeUsd = `${sign}${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalChangeUsd)}`;
  
  const formattedChangePercent = `${sign}${totalChangePercent.toFixed(2)}%`;

  if (loading && totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-800 rounded-lg mb-3"></div>
        <div className="h-6 w-32 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center select-none">
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 font-mono">
        {formattedValue}
      </h1>
      
      <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold">
        <span className={isPositive ? 'text-[#3DDC84]' : 'text-red-500'}>
          {formattedChangeUsd}
        </span>
        <span 
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isPositive 
              ? 'bg-[#3DDC84]/15 text-[#3DDC84]' 
              : 'bg-red-500/15 text-red-500'
          }`}
        >
          {formattedChangePercent}
        </span>
      </div>
    </div>
  );
}
