import React, { useState, useEffect } from 'react';

// Custom CSS inline-styles injected directly for simple standalone integration
const styles = `
  .dashboard-container {
    background-color: #0d1117;
    color: #c9d1d9;
    font-family: 'Courier New', Courier, monospace;
    padding: 20px;
    min-height: 100vh;
  }
  .header-panel {
    border-bottom: 2px solid #21262d;
    padding-bottom: 15px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title-h1 {
    color: #58a6ff;
    margin: 0;
    font-size: 24px;
    letter-spacing: 2px;
  }
  .hud-card {
    background-color: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
  }
  .hud-card-title {
    color: #8b949e;
    font-size: 14px;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 15px;
    border-bottom: 1px dashed #30363d;
    padding-bottom: 5px;
  }
  .workspace-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
  }
  .asset-row {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #21262d;
    transition: background 0.2s;
  }
  .asset-row:hover {
    background-color: #21262d;
  }
  .asset-row.selected {
    background-color: #1f293d;
    border-left: 4px solid #58a6ff;
  }
  .order-book-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  .book-side-title {
    text-align: center;
    font-weight: bold;
    padding: 4px;
    margin-bottom: 8px;
  }
  .title-ask { background-color: rgba(248, 81, 73, 0.15); color: #f85149; }
  .title-bid { background-color: rgba(56, 139, 253, 0.15); color: #38bdf8; }
  .book-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 3px 6px;
  }
  .book-row.ask { color: #f85149; }
  .book-row.bid { color: #56e39f; }
  .ledger-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 10px;
  }
  .ledger-table th {
    background-color: #21262d;
    color: #8b949e;
    text-align: left;
    padding: 8px;
  }
  .ledger-table td {
    padding: 8px;
    border-bottom: 1px solid #21262d;
  }
  .action-btn {
    background-color: #238636;
    color: #ffffff;
    border: 1px solid rgba(240, 246, 252, 0.1);
    border-radius: 6px;
    padding: 6px 12px;
    font-family: inherit;
    cursor: pointer;
    font-weight: bold;
  }
  .action-btn:hover { background-color: #2ea44f; }
  .action-btn.short { background-color: #da3633; }
  .action-btn.short:hover { background-color: #b62320; }
  .toast {
    position: fixed; bottom: 20px; right: 20px; padding: 14px 24px; border-radius: 4px; font-weight: bold; z-index: 1000;
  }
`;

export default function App() {
  // 1. Multi-Asset State Tracking Engine
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [marketData, setMarketData] = useState({
    BTC: { name: 'Bitcoin', currentPrice: 63646.00, priceChange24h: 1.17, aiSummary: 'Analyzing alpha metrics...' },
    ETH: { name: 'Ethereum', currentPrice: 3450.50, priceChange24h: -1.24, aiSummary: 'Aggregating order book depth across liquid chains...' },
    SOL: { name: 'Solana', currentPrice: 145.25, priceChange24h: 4.87, aiSummary: 'High throughput pipeline signaling break-out momentum...' }
  });

  // 2. High-Frequency Order Book Liquidity Data Simulator
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });

  // 3. PERSISTENT AUDIT LEDGER STATE (UPGRADED FOR LOCALSTORAGE WALLET PERSISTENCE)
  const [ledger, setLedger] = useState(() => {
    const savedLedger = localStorage.getItem('alpha_quant_ledger');
    return savedLedger ? JSON.parse(savedLedger) : [];
  });

  // Global Notifications system
  const [notification, setNotification] = useState(null);

  // Sync Ledger State Updates back to browser localStorage automatically
  useEffect(() => {
    localStorage.setItem('alpha_quant_ledger', JSON.stringify(ledger));
  }, [ledger]);

  // Hook to simulate high frequency market order movements
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight spot price drift
      setMarketData(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(ticker => {
          const delta = (Math.random() - 0.495) * (copy[ticker].currentPrice * 0.0005);
          copy[ticker].currentPrice = parseFloat((copy[ticker].currentPrice + delta).toFixed(2));
        });
        return copy;
      });

      // Re-generate volatile depth tiers for the active order book canvas
      const midPrice = marketData[selectedAsset].currentPrice;
      const simulatedAsks = [];
      const simulatedBids = [];

      for (let i = 1; i <= 8; i++) {
        const askPrice = parseFloat((midPrice + (i * (midPrice * 0.00015))).toFixed(2));
        const askSize = parseFloat((Math.random() * 2.5 + 0.1).toFixed(4));
        simulatedAsks.unshift({ price: askPrice, size: askSize, total: parseFloat((askPrice * askSize).toFixed(2)) });

        const bidPrice = parseFloat((midPrice - (i * (midPrice * 0.00015))).toFixed(2));
        const bidSize = parseFloat((Math.random() * 2.5 + 0.1).toFixed(4));
        simulatedBids.push({ price: bidPrice, size: bidSize, total: parseFloat((bidPrice * bidSize).toFixed(2)) });
      }

      setOrderBook({ asks: simulatedAsks, bids: simulatedBids });
    }, 450);

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  // Order Routing Mechanism
  const executeMarketOrder = (side) => {
    const executionPrice = marketData[selectedAsset].currentPrice;
    const randomSize = parseFloat((Math.random() * 0.5 + 0.01).toFixed(4));
    
    const newRecord = {
      timestamp: new Date().toLocaleTimeString(),
      asset: selectedAsset,
      type: `MARKET_${side}`,
      price: executionPrice,
      size: randomSize,
      totalValue: parseFloat((executionPrice * randomSize).toFixed(2))
    };

    setLedger(prev => [newRecord, ...prev]);
    triggerNotification(`SUCCESS: Routed ${side} order for ${randomSize} ${selectedAsset} @ $${executionPrice}`, 'success');
  };

  const triggerNotification = (msg, status) => {
    setNotification({ msg, status });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      {notification && (
        <div className="toast" style={{ backgroundColor: notification.status === 'success' ? '#238636' : '#da3633' }}>
          {notification.msg}
        </div>
      )}

      <div className="hud-card">
        {/* Workspace banner area */}
        <div className="header-panel">
          <div>
            <h1 className="title-h1">ALPHA QUANT WORKING HUB v1.1</h1>
            <div style={{ color: '#6e7681', fontSize: '13px', marginTop: '4px' }}>Real-Time Algorithmic Operations Console</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#475569', fontSize: '11px', display: 'block' }}>COMMS RECEPTOR</span>
            <strong style={{ color: '#38bdf8', fontSize: '15px', fontFamily: 'monospace' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8', marginRight: '6px' }}></span>
              CONNECTED_STREAM
            </strong>
          </div>
        </div>
      </div>

      <div className="workspace-grid">
        {/* Left Side: Asset list watchlist layout */}
        <div className="hud-card">
          <h2 className="hud-card-title">Asset Tracker Watchlist</h2>
          <div className="asset-list">
            {Object.keys(marketData).map(ticker => (
              <div 
                key={ticker} 
                className={`asset-row ${selectedAsset === ticker ? 'selected' : ''}`}
                onClick={() => setSelectedAsset(ticker)}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#f1f5f9' }}>{ticker}</strong>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{marketData[ticker].name}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>${marketData[ticker].currentPrice.toLocaleString()}</div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: marketData[ticker].priceChange24h >= 0 ? '#34d399' : '#f87171' }}>
                    {marketData[ticker].priceChange24h >= 0 ? '+' : ''}{marketData[ticker].priceChange24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', background: '#0d1117', padding: '10px', borderRadius: '4px', border: '1px solid #21262d' }}>
            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', marginBottom: '4px' }}>Intelligence Feed</div>
            <p style={{ margin: 0, fontSize: '12px', color: '#58a6ff', lineHeight: '1.4' }}>{marketData[selectedAsset].aiSummary}</p>
          </div>
        </div>

        {/* Right Side: Active High-Frequency Analytics Grid */}
        <div>
          <div className="hud-card">
            <h2 className="hud-card-title">{selectedAsset} Real-Time Liquidity Order Book</h2>
            
            <div className="order-book-grid">
              <div>
                <div className="book-side-title title-ask">ORDER ASKS (SELL WALL)</div>
                {orderBook.asks.map((row, idx) => (
                  <div key={`ask-${idx}`} className="book-row ask">
                    <span>${row.price.toLocaleString()}</span>
                    <span>{row.size}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="book-side-title title-bid">ORDER BIDS (BUY LIQUIDITY)</div>
                {orderBook.bids.map((row, idx) => (
                  <div key={`bid-${idx}`} className="book-row bid">
                    <span>${row.price.toLocaleString()}</span>
                    <span>{row.size}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #30363d' }}>
              <button className="action-btn" onClick={() => executeMarketOrder('LONG')}>INSTANT MARKET LONG (BUY)</button>
              <button className="action-btn short" onClick={() => executeMarketOrder('SHORT')}>INSTANT MARKET SHORT (SELL)</button>
            </div>
          </div>

          {/* Session Ledger Logs Card */}
          <div className="hud-card">
            <div style={{ display: 'flex', justifyContent: 'bwtween', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="hud-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Persistent Session Auditing Ledger</h2>
              {ledger.length > 0 && (
                <button 
                  onClick={() => { setLedger([]); localStorage.removeItem('alpha_quant_ledger'); }} 
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}
                >
                  [CLEAR CACHE LOGS]
                </button>
              )}
            </div>
            {ledger.length === 0 ? (
              <div style={{ padding: '20px', textAlignment: 'center', textAlign: 'center', color: '#485563', fontSize: '13px' }}>
                No operations routed in this environment container session yet. Execute an instant order above to populate ledger channels.
              </div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Total Capitalization</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((tx, idx) => (
                    <tr key={idx}>
                      <td>{tx.timestamp}</td>
                      <td style={{ color: '#58a6ff', fontWeight: 'bold' }}>{tx.asset}</td>
                      <td style={{ color: tx.type.includes('LONG') ? '#34d399' : '#f87171' }}>{tx.type}</td>
                      <td>${tx.price.toLocaleString()}</td>
                      <td>{tx.size}</td>
                      <td>${tx.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}