import React from 'react';
import solanaLogo   from '../assets/Solana_logo.png';
import ethereumLogo from '../assets/ethereum-logo.png';
import xrpLogo      from '../assets/xrp-logo.png';
import rioLogo      from '../assets/rio-logo.svg';
import coreLogo     from '../assets/core.png';
import manyuLogo    from '../assets/manyu-logo.jpg';

const logoMap = {
  'solana':          solanaLogo,
  'ethereum':        ethereumLogo,
  'ripple':          xrpLogo,
  'realio-network':  rioLogo,
  'coredaoorg':      coreLogo,
  'manyu-2':         manyuLogo,
};

export default function AssetCard({ asset, priceData, onClick }) {
  const currentPrice      = priceData ? priceData.usd : 0;
  const change24hPercent  = priceData ? priceData.usd_24h_change : 0;

  const assetValue     = asset.balance * currentPrice;
  const assetChangeUsd = assetValue * (change24hPercent / 100);

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(assetValue);

  const isPositive = assetChangeUsd >= 0;
  const sign = isPositive ? '+' : '';
  const formattedChangeUsd = `${sign}${new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(assetChangeUsd)}`;

  // Affichage du solde : nombre de décimales adapté à la quantité
  const displayBalance = asset.balance < 1
    ? asset.balance.toFixed(4)
    : asset.balance < 100
    ? asset.balance.toFixed(3)
    : asset.balance.toFixed(2);

  const logoSrc = logoMap[asset.id];

  return (
    <div
      onClick={() => onClick(asset)}
      className="flex items-center justify-between p-4 bg-[#1C1C1E] hover:bg-[#252528] active:scale-[0.99] transition-all duration-200 rounded-2xl cursor-pointer select-none group border border-gray-800/10 hover:border-purple-500/10 mb-3"
    >
      {/* Gauche : icône + nom + solde */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#0F0F10] border border-gray-800/40 p-1 group-hover:scale-105 transition-transform duration-200">
          {logoSrc ? (
            <img src={logoSrc} alt={`${asset.name} logo`} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-900/30 text-[#A78BFA] font-bold text-base rounded-full">
              {asset.symbol[0]}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {/* Affiche le pair (RIO/USDT) s'il existe, sinon le nom */}
          <span className="font-bold text-white tracking-tight group-hover:text-[#A78BFA] transition-colors duration-200">
            {asset.pair || asset.name}
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {displayBalance} {asset.symbol}
          </span>
        </div>
      </div>

      {/* Droite : valeur + variation 24h */}
      <div className="flex flex-col items-end">
        <span className="font-bold text-white tracking-tight font-mono text-sm sm:text-base">
          {formattedValue}
        </span>
        <span className={`text-xs font-bold font-mono ${isPositive ? 'text-[#3DDC84]' : 'text-red-500'}`}>
          {formattedChangeUsd}
        </span>
      </div>
    </div>
  );
}
