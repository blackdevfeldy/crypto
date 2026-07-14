import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, Shield } from 'lucide-react';

export default function Modal({ isOpen, onClose, type, data, prices }) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [buyFiat, setBuyFiat] = useState('100');
  const [chartTimeframe, setChartTimeframe] = useState('24h');

  // Reset local state when modal changes
  useEffect(() => {
    setCopied(false);
    setAmount('');
    setAddress('');
    setBuyFiat('100');
  }, [isOpen, type, data]);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: Generates beautiful mock charts
  const getChartData = (assetId, timeframe) => {
    const seedMap = { 'realio-network': 3, 'solana': 1, 'ripple': 7, 'ethereum': 5 };
    const seed = seedMap[assetId] ?? 2;
    const size = timeframe === '7d' ? 40 : 20;
    const points = [];
    let val = 100;
    for (let i = 0; i < size; i++) {
      const modifier = Math.sin(i * 0.8 + seed) * 12 + Math.cos(i * 0.4 - seed) * 8;
      val = Math.max(30, val + modifier);
      points.push(val);
    }
    return points;
  };

  // SVG Chart Renderer
  const renderSvgChart = (assetId) => {
    const points = getChartData(assetId, chartTimeframe);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    const width = 360;
    const height = 140;
    const padding = 10;
    
    const svgCoords = points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    const pathD = `M ${svgCoords[0].x} ${svgCoords[0].y} ` + 
      svgCoords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
    
    const areaD = `${pathD} L ${svgCoords[svgCoords.length - 1].x} ${height} L ${svgCoords[0].x} ${height} Z`;

    const isChartUp = points[points.length - 1] >= points[0];
    const strokeColor = isChartUp ? '#3DDC84' : '#EF4444';
    const gradStart = isChartUp ? 'rgba(61, 220, 132, 0.25)' : 'rgba(239, 68, 68, 0.25)';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible select-none">
        <defs>
          <linearGradient id={`grad-${assetId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradStart} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${assetId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0F0F10]/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Sheet / Dialog Body */}
      <div className="relative w-full max-w-md bg-[#1C1C1E] border-t sm:border border-gray-800/40 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col z-10 animate-slide-up">
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center py-3 sm:hidden">
          <div className="w-12 h-1 bg-gray-700/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-800/10">
          <h2 className="text-xl font-bold text-white font-heading">
            {type === 'deposit' && 'Receive Assets'}
            {type === 'buy' && 'Buy Crypto'}
            {type === 'send' && 'Send Assets'}
            {type === 'asset' && data?.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-800/30 text-gray-400 hover:text-white active:scale-95 transition-transform"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
          {/* DEPOSIT MODAL */}
          {type === 'deposit' && (
            <div className="flex flex-col items-center text-center py-2">
              <div className="p-3 bg-purple-500/10 text-[#A78BFA] rounded-2xl mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                Scan this address QR Code or copy it to transfer funds into your prototype account.
              </p>
              
              {/* QR Code SVG */}
              <div className="bg-white p-4 rounded-2xl mb-6 shadow-lg shadow-purple-500/5">
                <svg className="w-36 h-36" viewBox="0 0 100 100">
                  {/* Outer Frame */}
                  <path d="M10,10 h20 M10,10 v20 M90,10 h-20 M90,10 v20 M10,90 h20 M10,90 v-20 M90,90 h-20 M90,90 v-20" stroke="#8247E5" strokeWidth="4" fill="none" />
                  {/* QR blocks */}
                  <rect x="20" y="20" width="20" height="20" fill="#000" />
                  <rect x="25" y="25" width="10" height="10" fill="#FFF" />
                  <rect x="60" y="20" width="20" height="20" fill="#000" />
                  <rect x="65" y="25" width="10" height="10" fill="#FFF" />
                  <rect x="20" y="60" width="20" height="20" fill="#000" />
                  <rect x="25" y="65" width="10" height="10" fill="#FFF" />
                  <rect x="45" y="45" width="10" height="10" fill="#000" />
                  <rect x="45" y="25" width="10" height="10" fill="#000" />
                  <rect x="25" y="45" width="10" height="10" fill="#000" />
                  <rect x="65" y="45" width="15" height="15" fill="#000" />
                  <rect x="45" y="65" width="15" height="15" fill="#000" />
                </svg>
              </div>

              {/* Wallet Address copy */}
              <div className="w-full flex items-center justify-between gap-3 p-3 bg-[#0F0F10] rounded-xl border border-gray-800/30 mb-6 font-mono text-xs text-gray-300">
                <span className="truncate select-all">0x8a9C...92Fc382D9E74A53b216f</span>
                <button
                  onClick={() => handleCopy('0x8a9C429392Fc382D9E74A53b216f5c88b901cd7a')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA] text-[#0F0F10] font-bold active:scale-95 transition-transform"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5" />
                <span>Compatible with SOL, ETH and Polygon assets</span>
              </div>
            </div>
          )}

          {/* BUY MODAL */}
          {type === 'buy' && (
            <div className="flex flex-col gap-4 py-2">
              <div className="bg-[#0F0F10] p-4 rounded-2xl flex flex-col gap-2 border border-gray-800/10">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount to spend</span>
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">$</span>
                    <input 
                      type="number" 
                      value={buyFiat} 
                      onChange={(e) => setBuyFiat(e.target.value)}
                      className="bg-transparent text-2xl font-black text-white focus:outline-none w-32 border-b border-transparent focus:border-purple-500/20 font-mono"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#A78BFA] bg-purple-500/10 px-3 py-1 rounded-full">USD</span>
                </div>
              </div>

              <div className="bg-[#0F0F10] p-4 rounded-2xl flex flex-col gap-2 border border-gray-800/10">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Asset to receive</span>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">Solana</span>
                    <span className="text-xs text-gray-400 font-mono">
                      ≈ {((Number(buyFiat) || 0) / (prices?.solana?.usd || 1)).toFixed(3)} SOL
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1C1C1E] px-3 py-1 rounded-full border border-gray-800/30">
                    <span className="text-sm font-bold text-white">SOL</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 px-1 py-1">
                <span>Fee (Prototype Mock)</span>
                <span>$0.00 (Free Demo)</span>
              </div>

              <button 
                onClick={() => {
                  alert("Prototype Demo: Purchase simulation completed successfully! No actual transaction occurred.");
                  onClose();
                }}
                className="w-full py-3.5 bg-[#A78BFA] text-[#0F0F10] font-black rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/5 mt-2"
              >
                Proceed to Checkout
              </button>
            </div>
          )}

          {/* SEND MODAL */}
          {type === 'send' && (
            <div className="flex flex-col gap-4 py-2">
              <div className="bg-[#0F0F10] p-4 rounded-2xl flex flex-col gap-2 border border-gray-800/10">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recipient Address</span>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-full border-b border-transparent focus:border-purple-500/20 font-mono py-1"
                  placeholder="Paste ENS name or 0x address..."
                />
              </div>

              <div className="bg-[#0F0F10] p-4 rounded-2xl flex flex-col gap-2 border border-gray-800/10">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount to send</span>
                  <span className="text-xs text-gray-400 font-semibold">Available: 50 SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-xl font-bold text-white focus:outline-none w-32 border-b border-transparent focus:border-purple-500/20 font-mono"
                    placeholder="0.0"
                  />
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setAmount('50')}
                      className="text-xs font-bold text-[#A78BFA] bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded"
                    >
                      MAX
                    </button>
                    <span className="text-sm font-bold text-white">SOL</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!address || !amount) {
                    alert("Please provide both recipient address and amount.");
                    return;
                  }
                  alert(`Prototype Demo: Mock Send initiated.\nAmount: ${amount} SOL\nDestination: ${address}\n\nNo real assets were moved.`);
                  onClose();
                }}
                className="w-full py-3.5 bg-[#A78BFA] text-[#0F0F10] font-black rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/5 mt-2"
              >
                Send Assets
              </button>
            </div>
          )}

          {/* ASSET DETAILS MODAL */}
          {type === 'asset' && data && (
            <div className="flex flex-col py-1">
              {/* Asset Header stats */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                    }).format(data.balance * (prices[data.id]?.usd || 0))}
                  </div>
                  <div className="text-sm font-semibold text-gray-400">
                    {data.balance} {data.symbol} &bull; <span className="font-mono">${(prices[data.id]?.usd || 0).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${
                    (prices[data.id]?.usd_24h_change || 0) >= 0 
                      ? 'text-[#3DDC84] bg-[#3DDC84]/10' 
                      : 'text-red-500 bg-red-500/10'
                  }`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${(prices[data.id]?.usd_24h_change || 0) < 0 && 'rotate-180'}`} />
                    <span>{(prices[data.id]?.usd_24h_change || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="bg-[#0F0F10] p-4 rounded-3xl border border-gray-800/10 mb-6">
                {/* Timeframe picker */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Chart</span>
                  <div className="flex gap-1 bg-[#1C1C1E] p-0.5 rounded-lg border border-gray-800/30">
                    {['24h', '7d'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                          chartTimeframe === tf 
                            ? 'bg-[#A78BFA] text-[#0F0F10]' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tf.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                {renderSvgChart(data.id)}
              </div>

              {/* Transactions Title */}
              <div className="mb-3 px-1 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction History</span>
                <span className="text-[10px] font-semibold text-gray-500">PROTOTYPE MOCK</span>
              </div>

              {/* Transaction list */}
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto mb-4">
                <div className="flex items-center justify-between p-3 bg-[#0F0F10] rounded-2xl border border-gray-800/10 hover:bg-[#0f0f10]/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#3DDC84]/10 text-[#3DDC84]">
                      <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Received</span>
                      <span className="text-[10px] text-gray-500">Today, 14:24</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-[#3DDC84] font-mono">+1.25 {data.symbol}</span>
                    <span className="text-[10px] text-gray-500">Completed</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0F0F10] rounded-2xl border border-gray-800/10 hover:bg-[#0f0f10]/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-[#A78BFA]">
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Sent</span>
                      <span className="text-[10px] text-gray-500">July 8, 10:11</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white font-mono">-0.40 {data.symbol}</span>
                    <span className="text-[10px] text-gray-500">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
