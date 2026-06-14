import React, { useState, useEffect } from 'react';

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [marketData, setMarketData] = useState({
    BTC: { name: 'Bitcoin', currentPrice: 63646.00, priceChange24h: 1.17, aiSummary: 'Analyzing alpha metrics...' },
    ETH: { name: 'Ethereum', currentPrice: 3450.50, priceChange24h: -1.24, aiSummary: 'Aggregating order book depth across liquid chains...' },
    SOL: { name: 'Solana', currentPrice: 145.25, priceChange24h: 4.87, aiSummary: 'High throughput pipeline signaling break-out momentum...' }
  });
  const [isConnected, setIsConnected] = useState(false);

  // Advanced States: Portfolio, Input Order, Ledger History, and Simulated Order Book
  const [portfolio, setPortfolio] = useState({
    cashBalance: 100000.00,
    positions: { BTC: 0, ETH: 0, SOL: 0 },
    avgBuyPrice: { BTC: 0, ETH: 0, SOL: 0 }
  });
  const [tradeAmount, setTradeAmount] = useState('');
  const [ledger, setLedger] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [notification, setNotification] = useState(null);

  // Establish continuous data connection pipelines
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/crypto/stream');
    eventSource.onopen = () => setIsConnected(true);
    
    eventSource.onmessage = (e) => {
      try {
        const incoming = JSON.parse(e.data);
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
        simulateMarketFluctuations();
      }
    };
    
    eventSource.onerror = () => {
      setIsConnected(false);
      const interval = setInterval(simulateMarketFluctuations, 3000);
      return () => clearInterval(interval);
    };
    
    return () => eventSource.close();
  }, []);

  // Generate real-time Order Book matching selections
  useEffect(() => {
    const basePrice = marketData[selectedAsset].currentPrice;
    const generatedBids = [];
    const generatedAsks = [];
    
    for (let i = 1; i <= 5; i++) {
      generatedBids.push({
        price: basePrice * (1 - (i * 0.0005)),
        size: Math.random() * 4 + 0.1
      });
      generatedAsks.push({
        price: basePrice * (1 + (i * 0.0005)),
        size: Math.random() * 4 + 0.1
      });
    }
    setOrderBook({ bids: generatedBids, asks: generatedAsks.reverse() });
  }, [selectedAsset, marketData[selectedAsset].currentPrice]);

  const simulateMarketFluctuations = () => {
    setMarketData(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(ticker => {
        const shiftPct = (Math.random() - 0.5) * 0.001;
        copy[ticker].currentPrice = copy[ticker].currentPrice * (1 + shiftPct);
      });
      return copy;
    });
  };

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
        const newAvg = ((currentHeld * oldAvg) + totalCost) / newHeld;

        return {
          cashBalance: prev.cashBalance - totalCost,
          positions: { ...prev.positions, [selectedAsset]: newHeld },
          avgBuyPrice: { ...prev.avgBuyPrice, [selectedAsset]: newAvg }
        };
      });

      // Append transaction directly into local state ledger
      setLedger(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'BUY',
        asset: selectedAsset,
        amount,
        price: currentPrice,
        total: totalCost
      }, ...prev]);

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

      setLedger(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'SELL',
        asset: selectedAsset,
        amount,
        price: currentPrice,
        total: totalCost
      }, ...prev]);

      showToast(`Liquidated ${amount} ${selectedAsset}`, 'success');
    }
    setTradeAmount('');
  };

  const showToast = (msg, status) => {
    setNotification({ msg, status });
    setTimeout(() => setNotification(null), 3000);
  };

  const activeAsset = marketData[selectedAsset];
  const isPositive = activeAsset.priceChange24h >= 0;
  const heldUnits = portfolio.positions[selectedAsset];
  const avgCost = portfolio.avgBuyPrice[selectedAsset];
  const currentValuation = heldUnits * activeAsset.currentPrice;
  const initialCostBasis = heldUnits * avgCost;
  const currentAssetPnL = currentValuation - initialCostBasis;

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { min-height: 100vh; background-color: #070b19; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .hud-card { width: 100%; max-width: 1200px; background: #111a2e; border: 1px solid #1e293b; border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7); }
        .header-panel { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
        .title-h1 { font-size: 26px; font-weight: 900; background: linear-gradient(to right, #38bdf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        .workspace-grid { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
        @media (max-width: 900px) { .workspace-grid { grid-template-columns: 1fr; } }
        .asset-list { display: flex; flex-direction: column; gap: 10px; }
        .asset-row { padding: 14px 18px; border-radius: 14px; background: #16223f; border: 1px solid #223154; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .asset-row.active { border-color: #38bdf8; background: #1e2e5c; box-shadow: 0 0 15px rgba(56,189,248,0.15); }
        .main-desk { display: flex; flex-direction: column; gap: 20px; }
        .center-layout-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .center-layout-grid { grid-template-columns: 1fr; } }
        .panel-box { background: #0b1329; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; }
        .price-huge { font-size: 40px; font-weight: 900; font-family: monospace; color: #ffffff; margin: 10px 0; }
        .action-input { width: 100%; padding: 12px; background: #111a2e; border: 1px solid #223154; border-radius: 10px; color: white; font-family: monospace; margin-bottom: 12px; box-sizing: border-box; }
        .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .trade-btn { border: none; padding: 12px; font-weight: 800; border-radius: 10px; cursor: pointer; text-transform: uppercase; font-size: 12px; }
        .btn-buy { background: #10b981; color: #042f1a; }
        .btn-sell { background: #f43f5e; color: #4c0519; }
        .book-row { display: flex; justify-content: space-between; font-family: monospace; font-size: 12px; padding: 4px 0; }
        .ledger-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
        .ledger-table th { color: #475569; padding: 8px; border-bottom: 1px solid #1e293b; }
        .ledger-table td { padding: 8px; border-bottom: 1px solid #1e293b/40; }
        .toast { position: fixed; bottom: 20px; right: 20px; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}</style>

      {notification && (
        <div className="toast" style={{ backgroundColor: notification.status === 'success' ? '#10b981' : '#f43f5e', color: '#fff' }}>
          {notification.msg}
        </div>
      )}

      <div className="hud-card">
        {/* Workspace banner area */}
        <div className="header-panel">
          <div>
            <h1 className="title-h1">ALPHA QUANT WORKING HUB v1.1</h1>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Multi-Asset Algorithmic Order Management Terminal</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#475569', fontSize: '11px', display: 'block' }}>AVAILABLE CASH BALANCE</span>
              <strong style={{ color: '#38bdf8', fontSize: '15px', fontFamily: 'monospace' }}>${portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#070b19', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', border: '1px solid #1e293b' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f43f5e' }} />
              <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{isConnected ? 'LIVE PIPELINE' : 'SIM MONITOR'}</span>
            </div>
          </div>
        </div>

        <div className="workspace-grid">
          {/* Side watch-strip selection layout */}
          <div className="asset-list">
            {Object.keys(marketData).map(ticker => (
              <div key={ticker} className={`asset-row ${selectedAsset === ticker ? 'active' : ''}`} onClick={() => setSelectedAsset(ticker)}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#f1f5f9' }}>{ticker}/USD</strong>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{marketData[ticker].name}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>${marketData[ticker].currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: marketData[ticker].priceChange24h >= 0 ? '#10b981' : '#f43f5e' }}>
                    {marketData[ticker].priceChange24h >= 0 ? '+' : ''}{marketData[ticker].priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Central Workspace Desktop Panel Group */}
          <div className="main-desk">
            <div className="center-layout-grid">
              
              {/* Box 1: Core metric box + transaction trigger inputs */}
              <div className="panel-box flex flex-col justify-between">
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.5px' }}>PRIMARY PRICE QUOTE</span>
                  <div className="price-huge">${activeAsset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <input type="number" className="action-input" placeholder={`Allocation Size in ${selectedAsset}`} value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
                  <div className="btn-group">
                    <button className="trade-btn btn-buy" onClick={() => executeTrade('BUY')}>Buy {selectedAsset}</button>
                    <button className="trade-btn btn-sell" onClick={() => executeTrade('SELL')}>Sell {selectedAsset}</button>
                  </div>
                </div>
              </div>

              {/* Box 2: Live Fluid Liquidity Order Book component */}
              <div className="panel-box">
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', display: 'block', marginBottom: '8px' }}>REAL-TIME ORDER BOOK</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {orderBook.asks.map((ask, i) => (
                    <div key={`ask-${i}`} className="book-row" style={{ color: '#f43f5e' }}>
                      <span>${ask.price.toFixed(2)}</span>
                      <span>{ask.size.toFixed(4)}</span>
                    </div>
                  ))}
                  <div style={{ height: '1px', background: '#1e293b', margin: '6px 0' }} />
                  {orderBook.bids.map((bid, i) => (
                    <div key={`bid-${i}`} className="book-row" style={{ color: '#10b981' }}>
                      <span>${bid.price.toFixed(2)}</span>
                      <span>{bid.size.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Middle Module: Portfolio Position Inventory Status */}
            <div className="panel-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center', background: '#090e1a' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569' }}>POSITION BALANCES</span>
                <strong style={{ fontSize: '15px', color: '#cbd5e1', fontFamily: 'monospace' }}>{heldUnits.toFixed(4)} {selectedAsset}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569' }}>ENTRY COST BASIS</span>
                <strong style={{ fontSize: '15px', color: '#cbd5e1', fontFamily: 'monospace' }}>${avgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#475569' }}>UNREALIZED P&amp;L</span>
                <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: currentAssetPnL > 0 ? '#10b981' : currentAssetPnL < 0 ? '#f43f5e' : '#64748b' }}>
                  {currentAssetPnL > 0 ? '+' : ''}${currentAssetPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Base Module: Persistent Local Transaction Audit Ledger */}
            <div className="panel-box" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '10px' }}>ACCOUNT TRANSACTION HISTORY AUDIT LEDGER</span>
              {ledger.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No clearing operations logged in this working session.</div>
              ) : (
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>ACTION</th>
                      <th>ASSET</th>
                      <th>AMOUNT</th>
                      <th>EXECUTION PRICE</th>
                      <th>TOTAL VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{tx.timestamp}</td>
                        <td style={{ fontWeight: 'bold', color: tx.type === 'BUY' ? '#10b981' : '#f43f5e' }}>{tx.type}</td>
                        <td>{tx.asset}</td>
                        <td style={{ fontFamily: 'monospace' }}>{tx.amount}</td>
                        <td style={{ fontFamily: 'monospace' }}>${tx.price.toFixed(2)}</td>
                        <td style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>${tx.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}