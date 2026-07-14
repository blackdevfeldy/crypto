import React from 'react';
import AssetCard from './AssetCard';

export default function AssetList({ portfolio, prices, loading, onAssetClick }) {
  return (
    <div className="flex-1 px-4 py-2 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3 select-none px-1">
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Jetons</span>
        {loading && (
          <span className="text-xs text-[#A78BFA] font-semibold animate-pulse">
            Raffraîchissement...
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {portfolio.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-[#1C1C1E] rounded-2xl border border-gray-800/10">
            No assets in portfolio
          </div>
        ) : (
          portfolio.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              priceData={prices[asset.id]} 
              onClick={onAssetClick} 
            />
          ))
        )}
      </div>
    </div>
  );
}
