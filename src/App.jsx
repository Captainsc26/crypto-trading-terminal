import React, { useState, useEffect } from 'react';

export default function App() {
  // 1. Multi-Asset State Tracking Engine
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [marketData, setMarketData] = useState({
    BTC: { name: 'Bitcoin', currentPrice: 63599.00, priceChange24h: 0.82, aiSummary: 'Loading alpha metrics...' },
    ETH: { name: 'Ethereum', currentPrice: 3450.50, priceChange24h: -1.24, aiSummary: 'Aggregating order book depth across liquid chains...' },
    SOL: { name: 'Solana', currentPrice: 145.25, priceChange24h: 4.87, aiSummary: 'High throughput pipeline signaling break-out momentum...' }
  });
  const [isConnected, setIsConnected] = useState(false);

  // 2. Mock Portfolio / Execution Engine State
  const [portfolio, setPortfolio] = useState({
    cashBalance: 100000.00, // Starting Mock Fund ($100k USD)
    positions: { BTC: 0, ETH: 0, SOL: 0 },
    avgBuyPrice: { BTC: 0, ETH: 0, SOL: 0 }
  });
  const [tradeAmount, setTradeAmount] = useState('');
  const [notification, setNotification] = useState(null);

  // 3. Simulated SSE Data Pipeline Fallback 
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/crypto/stream');
    eventSource.onopen = () => setIsConnected(true);
    
    eventSource.onmessage = (e) => {
      try {
        const incoming = JSON.parse(e.data);
        // Map data dynamically based on incoming asset ticker names
        const ticker = incoming.symbol || 'BTC'; 
        setMarketData(prev => ({
          ...prev,
          [ticker]: {
            name: incoming.name || prev[ticker].name,
            currentPrice: incoming.currentPrice,
            priceChange24h: incoming.priceChange24h,
            aiSummary: incoming.aiSummary || prev[ticker].aiSummary
          }
        }));
      } catch (err) {
        // Fallback live price simulator if your local Spring Boot backend isn't broadcasting multiple tickers yet
        simulateMarketFluctuations();
      }
    };
    
    eventSource.onerror = () => {
      setIsConnected(false);
      // Run fallback loop when backend drops out so your UI remains fully interactive
      const interval = setInterval(simulateMarketFluctuations, 3000);
      return () => clearInterval(interval);
    };
    
    return () => eventSource.close();
  }, []);

  // Helper macro-simulator for testing UI components fluidly
  const simulateMarketFluctuations = () => {
    setMarketData(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(ticker => {
        const shiftPct = (Math.random() - 0.5) * 0.002; // Minor variation bounds
        copy[ticker].currentPrice = copy[ticker].currentPrice * (1 + shiftPct);
      });
      return copy;
    });
  };

  // 4. Algorithmic Trading Execution Desk Functions
  const executeTrade = (type) => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Invalid allocation size input.', 'error');
      return;
    }

    const currentPrice = marketData[selectedAsset].currentPrice;
    const totalCost = amount * currentPrice;

    if (type === 'BUY') {
      if (totalCost > portfolio.cashBalance) {
        showToast('Insufficient fiat capital balance.', 'error');
        return;
      }
      
      setPortfolio(prev => {
        const currentHeld = prev.positions[selectedAsset];
        const oldAvg = prev.avgBuyPrice[selectedAsset];
        const newHeld = currentHeld + amount;
        // Calculate new weighted moving average purchase cost
        const newAvg = ((currentHeld * oldAvg) + totalCost) / newHeld;

        return {
          cashBalance: prev.cashBalance - totalCost,
          positions: { ...prev.positions, [selectedAsset]: newHeld },
          avgBuyPrice: { ...prev.avgBuyPrice, [selectedAsset]: newAvg }
        };
      });
      showToast(`Successfully purchased ${amount} ${selectedAsset}`, 'success');
    } else if (type === 'SELL') {
      if (amount > portfolio.positions[selectedAsset]) {
        showToast('Position liquidation size exceeds balance limits.', 'error');
        return;
      }

      setPortfolio(prev => ({
        cashBalance: prev.cashBalance + totalCost,
        positions: { ...prev.positions, [selectedAsset]: prev.positions[selectedAsset] - amount },
        avgBuyPrice: prev.positions[selectedAsset] - amount === 0 
          ? { ...prev.avgBuyPrice, [selectedAsset]: 0 } 
          : prev.avgBuyPrice
      }));
      showToast(`Liquidated ${amount} ${selectedAsset}`, 'success');
    }
    setTradeAmount('');
  };

  const showToast = (msg, status) => {
    setNotification({ msg, status });
    setTimeout(() => setNotification(null), 4000);
  };

  // Math variables for computations
  const activeAsset = marketData[selectedAsset];
  const isPositive = activeAsset.priceChange24h >= 0;
  
  // Real-time Valuation Computations
  const heldUnits = portfolio.positions[selectedAsset];
  const avgCost = portfolio.avgBuyPrice[selectedAsset];
  const currentValuation = heldUnits * activeAsset.currentPrice;
  const initialCostBasis = heldUnits * avgCost;
  const currentAssetPnL = currentValuation - initialCostBasis;

  return (
    <div className="dashboard-container">
      {/* Component Core Stylesheet Overlay */}
      <style>{`
        .dashboard-container { min-height: 100vh; background-color: #070b19; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .hud-card { width: 100%; max-width: 1100px; background: #111a2e; border: 1px solid #1e293b; border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7); }
        .header-panel { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
        .title-h1 { font-size: 26px; font-weight: 900; background: linear-gradient(to right, #38bdf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        
        /* Layout Segmentation systems */
        .workspace-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
        @media (max-width: 900px) { .workspace-grid { grid-template-columns: 1fr; } }
        
        /* Watchlist styles */
        .asset-list { display: flex; flex-col; gap: 10px; flex-direction: column; }
        .asset-row { padding: 14px 18px; border-radius: 14px; background: #16223f; border: 1px solid #223154; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease; }
        .asset-row:hover { border-color: #3b82f6; background: #1a294d; }
        .asset-row.active { border-color: #38bdf8; background: #1e2e5c; box-shadow: 0 0 15px rgba(56,189,248,0.15); }
        
        /* Main Workspace Panels */
        .main-desk { display: flex; flex-direction: column; gap: 20px; }
        .stats-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }
        
        .panel-box { background: #0b1329; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; position: relative; }
        .price-huge { font-size: 44px; font-weight: 900; font-family: monospace; color: #ffffff; margin: 10px 0; }
        
        /* Trading inputs styles */
        .action-input { width: 100%; padding: 10px 14px; background: #111a2e; border: 1px solid #223154; border-radius: 10px; color: white; font-family: monospace; box-sizing: border-box; font-size: 14px; margin-bottom: 12px; }
        .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .trade-btn { border: none; padding: 12px; font-weight: 800; border-radius: 10px; cursor: pointer; text-transform: uppercase; font-size: 12px; tracking-wide: 0.5px; transition: opacity 0.2s; }
        .trade-btn:hover { opacity: 0.9; }
        .btn-buy { background: #10b981; color: #042f1a; }
        .btn-sell { background: #f43f5e; color: #4c0519; }
        
        /* Toast notification banners */
        .toast { position: fixed; bottom: 20px; right: 20px; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; z-index: 100; animation: slideIn 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {notification && (
        <div className="toast" style={{ 
          backgroundColor: notification.status === 'success' ? '#10b981' : '#f43f5e',
          color: notification.status === 'success' ? '#042f1a' : '#ffffff'
        }}>
          {notification.msg}
        </div>
      )}

      <div className="hud-card">
        {/* Workspace HUD Banner Header */}
        <div className="header-panel">
          <div>
            <h1 className="title-h1">ALPHA QUANT WORKING HUB</h1>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
              Multi-Asset Algorithmic Order Management Terminal
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right', fontSize: '12px' }}>
              <span style={{ color: '#475569', display: 'block' }}>MOCK CAPITAL DEPLOYED</span>
              <strong style={{ color: '#38bdf8', fontSize: '14px', fontFamily: 'monospace' }}>
                ${portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div style={{ width: '1px', height: '30px', background: '#1e293b' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#070b19', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', border: '1px solid #1e293b' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f43f5e' }} />
              <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{isConnected ? 'LIVE PIPELINE' : 'SIM MONITOR'}</span>
            </div>
          </div>
        </div>

        {/* Workspace Layout Content Split */}
        <div className="workspace-grid">
          
          {/* LEFT STRIP Panel: Asset Selection Watchlist */}
          <div className="asset-list">
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.5px', marginBottom: '4px' }}>WATCHLIST SELECTION</div>
            {Object.keys(marketData).map(ticker => {
              const item = marketData[ticker];
              return (
                <div 
                  key={ticker} 
                  className={`asset-row ${selectedAsset === ticker ? 'active' : ''}`}
                  onClick={() => setSelectedAsset(ticker)}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#f1f5f9' }}>{ticker}/USD</strong>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                      ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: item.priceChange24h >= 0 ? '#10b981' : '#f43f5e' }}>
                      {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT VIEW Panel: Core Metric Desk & Execution Center */}
          <div className="main-desk">
            <div className="stats-grid">
              
              {/* Box 1: Dynamic Primary Pricing Metric */}
              <div className="panel-box">
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '1px' }}>PRIMARY QUOTE FEED</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#f8fafc' }}>{activeAsset.name} Ticker</h2>
                <div className="price-huge">${activeAsset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                  backgroundColor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                  color: isPositive ? '#10b981' : '#f43f5e'
                }}>
                  {isPositive ? '▲ ' : '▼ '}{activeAsset.priceChange24h.toFixed(2)}% Over 24 hours
                </span>
              </div>

              {/* Box 2: Automated Execution Center Desk */}
              <div className="panel-box" style={{ background: '#0e172c', borderColor: '#233359' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>ORDER EXECUTION MATRIX</span>
                <input 
                  type="number" 
                  step="any"
                  className="action-input" 
                  placeholder={`Amount in ${selectedAsset} (e.g. 0.25)`}
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                />
                <div className="btn-group">
                  <button className="trade-btn btn-buy" onClick={() => executeTrade('BUY')}>Buy {selectedAsset}</button>
                  <button className="trade-btn btn-sell" onClick={() => executeTrade('SELL')}>Sell {selectedAsset}</button>
                </div>
              </div>
            </div>

            {/* Middle Section Panel: Portfolio Active Inventory Details */}
            <div className="panel-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center', background: '#090e1a' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569', fontWeight: '700' }}>POSITION UNITS HELD</span>
                <strong style={{ fontSize: '16px', color: '#cbd5e1', fontFamily: 'monospace' }}>{heldUnits.toFixed(4)} {selectedAsset}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569', fontWeight: '700' }}>AVG ENTRY VALUATION</span>
                <strong style={{ fontSize: '16px', color: '#cbd5e1', fontFamily: 'monospace' }}>${avgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569', fontWeight: '700' }}>UNREALIZED P&amp;L (USD)</span>
                <strong style={{ 
                  fontSize: '16px', fontFamily: 'monospace',
                  color: currentAssetPnL > 0 ? '#10b981' : currentAssetPnL < 0 ? '#f43f5e' : '#64748b'
                }}>
                  {currentAssetPnL > 0 ? '+' : ''}${currentAssetPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Bottom Console Panel Area: Generative AI Node Directive Feed */}
            <div className="panel-box" style={{ background: '#030712', padding: '0', overflow: 'hidden' }}>
              <div style={{ background: '#0b1329', padding: '12px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', borderBottom: '1px solid #1e293b', letterSpacing: '0.5px' }}>
                DEREGULATED INFERENCE NODE ARCHITECTURE DIRECTIVE FEED
              </div>
              <div style={{ padding: '20px', fontStyle: 'italic', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                "{activeAsset.aiSummary}"
              </div>
              <div style={{ background: '#02040a', padding: '8px 20px', fontSize: '10px', color: '#334155', fontFamily: 'monospace', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'between' }}>
                <span>NODE_ID: INTEL_GROQ_LLAMA_3.3_70B</span>
                <span style={{ marginLeft: 'auto', color: '#38bdf8' }}>STATUS // STEADY_STATE_OK</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}