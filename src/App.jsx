import React, { useState, useEffect } from 'react';
import { useCryptoPrices } from './hooks/useCryptoPrices';
import WalletHeader from './components/WalletHeader';
import BalanceSummary from './components/BalanceSummary';
import ActionButtons from './components/ActionButtons';
import AssetList from './components/AssetList';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import initialPortfolio from './data/mockPortfolio.json';
import { ArrowLeftRight, Check, AlertCircle, ArrowUpRight, ArrowDownLeft, Wallet, Info } from 'lucide-react';
import mogAvatar from './assets/mog.jpg';

export default function App() {
  const { prices, loading, error, lastUpdated, isStale, refetch } = useCryptoPrices();
  const [activeTab, setActiveTab] = useState('wallet');
  
  // Persistent portfolio balances state
  // On force le rechargement depuis mockPortfolio.json si les IDs ont changé
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem('crypto_wallet_portfolio');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIds   = parsed.map(a => a.id).sort().join(',');
        const freshIds   = initialPortfolio.map(a => a.id).sort().join(',');
        if (savedIds === freshIds) return parsed;
      }
    } catch (e) {
      console.error("Failed to load portfolio from cache", e);
    }
    // Nouveau portefeuille — on efface l'ancien cache
    localStorage.removeItem('crypto_wallet_portfolio');
    localStorage.removeItem('crypto_prices_cache');
    return initialPortfolio;
  });

  // Save portfolio on change
  useEffect(() => {
    localStorage.setItem('crypto_wallet_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('deposit'); // 'deposit' | 'buy' | 'send' | 'asset'
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Swap State
  const [swapFrom, setSwapFrom] = useState('realio-network');
  const [swapTo, setSwapTo] = useState('solana');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Activity Log State
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('crypto_wallet_activities');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 1, type: 'receive', assetSymbol: 'RIO',  amount: 50,   time: 'Aujourd\'hui, 14:24', status: 'Completed' },
      { id: 2, type: 'send',    assetSymbol: 'SOL',  amount: 0.10, time: '8 Juil, 10:11',        status: 'Completed' },
      { id: 3, type: 'swap',    assetSymbol: 'XRP',  amount: 20,   toAssetSymbol: 'ETH', toAmount: 0.018, time: '5 Juil, 18:40', status: 'Completed' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('crypto_wallet_activities', JSON.stringify(activities));
  }, [activities]);

  const openModal = (type, asset = null) => {
    setModalType(type);
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  // Handle mock actions that mutate state to feel extremely real
  const handleModalAction = (type) => {
    if (type === 'deposit') {
      openModal('deposit');
    } else if (type === 'buy') {
      openModal('buy');
    } else if (type === 'send') {
      openModal('send');
    }
  };

  // Perform Swap with live calculation
  const executeSwap = () => {
    if (!swapAmount || isNaN(swapAmount) || Number(swapAmount) <= 0) {
      alert("Please enter a valid swap amount");
      return;
    }

    const fromAsset = portfolio.find(a => a.id === swapFrom);
    const toAsset = portfolio.find(a => a.id === swapTo);
    
    if (fromAsset.balance < Number(swapAmount)) {
      alert(`Insufficient ${fromAsset.symbol} balance!`);
      return;
    }

    const fromPrice = prices[swapFrom]?.usd || 0;
    const toPrice = prices[swapTo]?.usd || 0;
    
    if (fromPrice === 0 || toPrice === 0) {
      alert("Pricing data is unavailable. Try again in a moment.");
      return;
    }

    const valueUsd = Number(swapAmount) * fromPrice;
    const receiveAmount = valueUsd / toPrice;

    // Mutate state
    setPortfolio(prev => prev.map(asset => {
      if (asset.id === swapFrom) {
        return { ...asset, balance: asset.balance - Number(swapAmount) };
      }
      if (asset.id === swapTo) {
        return { ...asset, balance: asset.balance + receiveAmount };
      }
      return asset;
    }));

    // Add activity
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
    setActivities(prev => [
      {
        id: Date.now(),
        type: 'swap',
        assetSymbol: fromAsset.symbol,
        amount: Number(swapAmount),
        toAssetSymbol: toAsset.symbol,
        toAmount: receiveAmount,
        time: formattedTime,
        status: 'Completed'
      },
      ...prev
    ]);

    setSwapAmount('');
    setSwapSuccess(true);
    setTimeout(() => setSwapSuccess(false), 3000);
  };

  // Mock NFT Collection
  const nfts = [
    { id: 1, name: 'Mog Coin Champion', image: mogAvatar, collection: 'Moggers', price: '0.45 ETH' },
    { id: 2, name: 'Cryptopunk #9821', image: mogAvatar, collection: 'Punks', price: '45.2 SOL' },
    { id: 3, name: 'Bored Ape #422', image: mogAvatar, collection: 'BAYC', price: '12.8 ETH' },
    { id: 4, name: 'Solana Summer #88', image: mogAvatar, collection: 'SolSummer', price: '5.5 SOL' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0F0F10] text-[#F3F4F6] flex flex-col items-center justify-between font-sans">
      
      {/* Container simulating a sleek mobile viewport */}
      <div className="w-full max-w-md min-h-screen bg-[#0F0F10] shadow-2xl flex flex-col justify-between border-x border-gray-800/10 relative pb-16">
        
        {/* Header */}
        <WalletHeader activeTab={activeTab} onMenuClick={() => alert("Menu opens settings (Prototype mock)")} />

        {/* API Stale Banner */}
        {isStale && (
          <div className="mx-4 mt-2 px-3 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/10 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">Prices outdated. Displaying last cached data.</span>
            <button onClick={refetch} className="underline font-bold hover:text-white">Retry</button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-start">
          
          {/* TAB 1: Wallet List */}
          {activeTab === 'wallet' && (
            <div className="flex-1 flex flex-col">
              <BalanceSummary portfolio={portfolio} prices={prices} loading={loading} />
              
              <ActionButtons onAction={handleModalAction} />
              
              <AssetList 
                portfolio={portfolio} 
                prices={prices} 
                loading={loading} 
                onAssetClick={(asset) => openModal('asset', asset)} 
              />
            </div>
          )}

          {/* TAB 2: NFTs Mock Grid */}
          {activeTab === 'nfts' && (
            <div className="p-4 flex-1">
              <div className="mb-4 select-none">
                <h2 className="text-xl font-bold text-white font-heading">Digital Collectibles</h2>
                <p className="text-xs text-gray-400">Mock gallery of owned and favorite NFTs</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-[#1C1C1E] border border-gray-800/10 rounded-2xl overflow-hidden group hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer">
                    <div className="aspect-square relative overflow-hidden bg-black flex items-center justify-center">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white">
                        {nft.price}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">{nft.collection}</div>
                      <div className="text-xs font-bold text-white truncate mt-0.5">{nft.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Swap Interface */}
          {activeTab === 'swap' && (
            <div className="p-4 flex-1 flex flex-col max-w-sm mx-auto w-full">
              <div className="mb-4 select-none">
                <h2 className="text-xl font-bold text-white font-heading">Sleek Exchange</h2>
                <p className="text-xs text-gray-400">Swap assets instantly with live price ratios</p>
              </div>

              {swapSuccess && (
                <div className="mb-4 p-3 bg-[#3DDC84]/10 text-[#3DDC84] border border-[#3DDC84]/10 rounded-2xl flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Swap executed! Portfolio balances updated locally.</span>
                </div>
              )}

              {/* From Selector */}
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-gray-800/10 mb-2">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span className="font-bold">FROM</span>
                  <span>Balance: {portfolio.find(a => a.id === swapFrom)?.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <input 
                    type="number" 
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-black text-white focus:outline-none w-36 font-mono"
                  />
                  <select 
                    value={swapFrom} 
                    onChange={(e) => {
                      setSwapFrom(e.target.value);
                      if (e.target.value === swapTo) {
                        setSwapTo(swapFrom === 'solana' ? 'ethereum' : 'solana');
                      }
                    }}
                    className="bg-[#0F0F10] text-sm text-white font-bold px-3 py-1.5 rounded-xl border border-gray-800/30 focus:outline-none cursor-pointer"
                  >
                    {portfolio.map(a => <option key={a.id} value={a.id}>{a.symbol}</option>)}
                  </select>
                </div>
              </div>

              {/* Middle Icon Spacer */}
              <div className="flex justify-center -my-3.5 z-10">
                <button 
                  onClick={() => {
                    const temp = swapFrom;
                    setSwapFrom(swapTo);
                    setSwapTo(temp);
                  }}
                  className="bg-[#A78BFA] text-[#0F0F10] p-2.5 rounded-full border-4 border-[#0F0F10] active:scale-90 hover:scale-105 transition-transform"
                >
                  <ArrowLeftRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* To Selector */}
              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-gray-800/10 mt-2">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span className="font-bold">TO (ESTIMATED)</span>
                  <span>Balance: {portfolio.find(a => a.id === swapTo)?.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-black text-gray-400 font-mono">
                    {swapAmount && prices[swapFrom] && prices[swapTo] 
                      ? ((Number(swapAmount) * prices[swapFrom].usd) / prices[swapTo].usd).toFixed(4)
                      : '0.00'}
                  </div>
                  <select 
                    value={swapTo} 
                    onChange={(e) => {
                      setSwapTo(e.target.value);
                      if (e.target.value === swapFrom) {
                        setSwapFrom(swapTo === 'solana' ? 'ethereum' : 'solana');
                      }
                    }}
                    className="bg-[#0F0F10] text-sm text-white font-bold px-3 py-1.5 rounded-xl border border-gray-800/30 focus:outline-none cursor-pointer"
                  >
                    {portfolio.map(a => <option key={a.id} value={a.id}>{a.symbol}</option>)}
                  </select>
                </div>
              </div>

              {/* Price ratio note */}
              {prices[swapFrom] && prices[swapTo] && (
                <div className="mt-3 px-1 text-center text-xs text-gray-500">
                  Rate: 1 {portfolio.find(a => a.id === swapFrom)?.symbol} ≈ {(prices[swapFrom].usd / prices[swapTo].usd).toFixed(4)} {portfolio.find(a => a.id === swapTo)?.symbol}
                </div>
              )}

              <button 
                onClick={executeSwap}
                className="w-full py-4 bg-[#A78BFA] text-[#0F0F10] font-black rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/5 mt-auto mb-2"
              >
                Execute Swap
              </button>
            </div>
          )}

          {/* TAB 4: Activity Log */}
          {activeTab === 'activity' && (
            <div className="p-4 flex-1">
              <div className="mb-4 select-none">
                <h2 className="text-xl font-bold text-white font-heading">Activity Log</h2>
                <p className="text-xs text-gray-400">Record of transactions and exchanges</p>
              </div>

              <div className="flex flex-col gap-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-4 bg-[#1C1C1E] border border-gray-800/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        act.type === 'receive' 
                          ? 'bg-[#3DDC84]/15 text-[#3DDC84]' 
                          : act.type === 'send'
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-purple-500/15 text-[#A78BFA]'
                      }`}>
                        {act.type === 'receive' && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                        {act.type === 'send' && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                        {act.type === 'swap' && <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white capitalize">
                          {act.type === 'swap' ? `Swapped ${act.assetSymbol} → ${act.toAssetSymbol}` : `${act.type} ${act.assetSymbol}`}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{act.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold font-mono ${
                        act.type === 'receive' 
                          ? 'text-[#3DDC84]' 
                          : act.type === 'send'
                          ? 'text-red-500'
                          : 'text-[#A78BFA]'
                      }`}>
                        {act.type === 'receive' && `+${act.amount}`}
                        {act.type === 'send' && `-${act.amount}`}
                        {act.type === 'swap' && `${act.amount} ${act.assetSymbol}`}
                      </span>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{act.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Bottom Nav Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Floating Modal System */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          type={modalType} 
          data={selectedAsset}
          prices={prices}
        />

      </div>
    </div>
  );
}
