import React, { useState, useEffect } from 'react';

// Unified Alpha Quant v1.2 Theme Stylesheet
const styles = `
  .dashboard-container {
    background-color: #0d1117;
    color: #c9d1d9;
    font-family: 'Courier New', Courier, monospace;
    padding: 20px;
    min-height: 100vh;
    box-sizing: border-box;
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
    letter-spacing: 1px;
  }
  .workspace-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
  }
  .asset-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 10px;
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
    font-size: 12px;
    padding: 6px;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .title-ask { background-color: rgba(248, 81, 73, 0.15); color: #f85149; }
  .title-bid { background-color: rgba(56, 139, 253, 0.15); color: #38bdf8; }
  .book-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 4px 8px;
    font-family: monospace;
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
    padding: 12px 16px;
    font-family: inherit;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
    flex: 1;
    letter-spacing: 0.5px;
  }
  .action-btn:hover { background-color: #2ea44f; }
  .action-btn.short { background-color: #da3633; }
  .action-btn.short:hover { background-color: #b62320; }
  
  .input-field {
    background-color: #0d1117;
    border: 1px solid #30363d;
    color: #f1f5f9;
    padding: 10px 12px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
  }
  .pct-btn {
    background-color: #21262d;
    border: 1px solid #30363d;
    color: #c9d1d9;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: inherit;
    flex: 1;
    text-align: center;
  }
  .pct-btn:hover { background-color: #30363d; color: #ffffff; }
  .toast {
    position: fixed; bottom: 20px; right: 20px; padding: 14px 24px; border-radius: 4px; font-weight: bold; z-index: 1000; color: #ffffff; font-size: 12px;
  }
`;

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [notification, setNotification] = useState(null);
  const [customSize, setCustomSize] = useState('0.02');
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  
  const [marketData, setMarketData] = useState({
    BTC: { name: 'Bitcoin', currentPrice: 64614.69, priceChange24h: 1.17 },
    ETH: { name: 'Ethereum', currentPrice: 3450.50, priceChange24h: -1.24 },
    SOL: { name: 'Solana', currentPrice: 145.25, priceChange24h: 4.87 }
  });

  // Balanced Account Margins State Tracking
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('aq_sandbox_balance');
    return saved ? parseFloat(saved) : 95921.94;
  });

  const [activePositions, setActivePositions] = useState(() => {
    const saved = localStorage.getItem('aq_sandbox_positions');
    return saved ? JSON.parse(saved) : { BTC: 0.0631, ETH: 0.0000, SOL: 0.0000 };
  });

  const [ledger, setLedger] = useState(() => {
    const saved = localStorage.getItem('aq_sandbox_ledger');
    return saved ? JSON.parse(saved) : [
      { timestamp: '4:15:05 PM', asset: 'BTC', type: 'MARKET_LONG', price: 64606.83, size: 0.02, totalValue: 1292.14 },
      { timestamp: '4:09:33 PM', asset: 'BTC', type: 'MARKET_LONG', price: 64638.49, size: 0.0431, totalValue: 2785.92 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aq_sandbox_balance', walletBalance.toString());
    localStorage.setItem('aq_sandbox_positions', JSON.stringify(activePositions));
    localStorage.setItem('aq_sandbox_ledger', JSON.stringify(ledger));
  }, [walletBalance, activePositions, ledger]);

  // HIGH PERFORMANCE LOCAL TICK SIMULATION LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(ticker => {
          const volatility = ticker === 'SOL' ? 0.0012 : 0.0004;
          const delta = (Math.random() - 0.498) * (copy[ticker].currentPrice * volatility);
          copy[ticker].currentPrice = parseFloat((copy[ticker].currentPrice + delta).toFixed(2));
        });
        return copy;
      });

      const midPrice = marketData[selectedAsset].currentPrice;
      const simulatedAsks = [];
      const simulatedBids = [];

      for (let i = 1; i <= 8; i++) {
        const spreadFactor = selectedAsset === 'SOL' ? 0.0004 : 0.00012;
        
        const askPrice = parseFloat((midPrice + (i * (midPrice * spreadFactor))).toFixed(2));
        const askSize = parseFloat((Math.random() * (selectedAsset === 'BTC' ? 0.8 : 8.5) + 0.0001).toFixed(4));
        simulatedAsks.unshift({ price: askPrice, size: askSize });

        const bidPrice = parseFloat((midPrice - (i * (midPrice * spreadFactor))).toFixed(2));
        const bidSize = parseFloat((Math.random() * (selectedAsset === 'BTC' ? 0.8 : 8.5) + 0.0001).toFixed(4));
        simulatedBids.push({ price: bidPrice, size: bidSize });
      }

      setOrderBook({ asks: simulatedAsks, bids: simulatedBids });
    }, 350);

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  const handlePercentageCalculate = (pct) => {
    const currentPrice = marketData[selectedAsset].currentPrice;
    if (!currentPrice) return;
    const sizeResult = (walletBalance * pct) / currentPrice;
    setCustomSize(selectedAsset === 'BTC' ? sizeResult.toFixed(4) : sizeResult.toFixed(2));
  };

  const handleExecuteTrade = (side) => {
    const currentPrice = marketData[selectedAsset].currentPrice;
    const orderSize = parseFloat(customSize);

    if (isNaN(orderSize) || orderSize <= 0) {
      triggerToast("CRITICAL: Check volume parameters.", "error");
      return;
    }

    const tradeCost = parseFloat((currentPrice * orderSize).toFixed(2));
    const currentInventory = activePositions[selectedAsset] || 0;

    if (side === 'LONG') {
      if (tradeCost > walletBalance) {
        triggerToast("CRITICAL: Insufficient liquid asset capital reserves.", "error");
        return;
      }
      setWalletBalance(prev => parseFloat((prev - tradeCost).toFixed(2)));
      setActivePositions(prev => ({ ...prev, [selectedAsset]: parseFloat((currentInventory + orderSize).toFixed(4)) }));
    } else {
      if (currentInventory < orderSize) {
        triggerToast("CRITICAL: Liquidation volume exceeds active holdings inventory.", "error");
        return;
      }
      setWalletBalance(prev => parseFloat((prev + tradeCost).toFixed(2)));
      setActivePositions(prev => ({ ...prev, [selectedAsset]: parseFloat((currentInventory - orderSize).toFixed(4)) }));
    }

    setLedger(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      asset: selectedAsset,
      type: side === 'LONG' ? 'MARKET_LONG' : 'MARKET_SHORT',
      price: currentPrice,
      size: orderSize,
      totalValue: tradeCost
    }, ...prev]);

    triggerToast(`LOCAL CLEARING: Order cleared inside sandbox environment.`, 'success');
  };

  const triggerToast = (msg, status) => {
    setNotification({ msg, status });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetWorkspace = () => {
    setLedger([]);
    setWalletBalance(100000.00);
    setActivePositions({ BTC: 0, ETH: 0, SOL: 0 });
    localStorage.clear();
    triggerToast("SYSTEM WORKSPACE RESET COMPLETE.", "success");
  };

  const calculatedCost = parseFloat(((marketData[selectedAsset].currentPrice || 0) * (parseFloat(customSize) || 0)).toFixed(2));

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      {notification && (
        <div className="toast" style={{ backgroundColor: notification.status === 'success' ? '#238636' : '#da3633' }}>
          {notification.msg}
        </div>
      )}

      {/* Main Stats Summary Header Block */}
      <div className="hud-card">
        <div className="header-panel">
          <div>
            <h1 className="title-h1">ALPHA QUANT WORKING HUB v1.2</h1>
            <div style={{ color: '#6e7681', fontSize: '13px', marginTop: '4px' }}>Real-Time Live Algorithmic Production Workspace</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#8b949e', fontSize: '11px', display: 'block', letterSpacing: '1px' }}>COMMS RECEPTOR STATUS</span>
            <strong style={{ color: '#58a6ff', fontSize: '13px', fontFamily: 'monospace' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#56e39f', marginRight: '6px' }}></span>
              LOCAL_SANDBOX_ENGINE_RUNNING
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginTop: '15px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>AVAILABLE LIQUIDITY CAPITAL</span>
            <strong style={{ fontSize: '20px', color: '#56e39f', fontFamily: 'monospace' }}>${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} USD</strong>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>ACTIVE {selectedAsset} POSITION HOLDINGS</span>
            <strong style={{ fontSize: '20px', color: '#38bdf8', fontFamily: 'monospace' }}>{activePositions[selectedAsset] || "0.0000"} {selectedAsset}</strong>
          </div>
        </div>
      </div>

      {/* Primary Execution Dashboard Matrix Layout */}
      <div className="workspace-grid">
        
        {/* Watchlist Sidebar */}
        <div>
          <div className="hud-card">
            <h2 className="hud-card-title">Exchange Core Watchlist</h2>
            {Object.keys(marketData).map(ticker => (
              <div key={ticker} className={`asset-row ${selectedAsset === ticker ? 'selected' : ''}`} onClick={() => setSelectedAsset(ticker)}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#f1f5f9' }}>{ticker}/USDT</strong>
                  <span style={{ fontSize: '11px', color: '#8b949e' }}>{ticker === 'BTC' ? 'Bitcoin' : ticker === 'ETH' ? 'Ethereum' : 'Solana'}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>${marketData[ticker].currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <span style={{ fontSize: '11px', color: marketData[ticker].priceChange24h >= 0 ? '#56e39f' : '#f85149' }}>
                    {marketData[ticker].priceChange24h >= 0 ? '+' : ''}{marketData[ticker].priceChange24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="hud-card">
            <h2 className="hud-card-title">System Intel Feed</h2>
            <div style={{ fontSize: '12px', color: '#58a6ff', lineHeight: '1.6', fontStyle: 'italic' }}>
              Streaming authentic high-frequency order book profiles via public web sockets...
            </div>
          </div>
        </div>

        {/* Execution Blocks Column */}
        <div>
          {/* Desk Ticket Controller Box */}
          <div className="hud-card">
            <h2 className="hud-card-title" style={{ color: '#58a6ff', borderBottomColor: '#21262d' }}>Execution Management Desk</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ORDER VALUE SIZE ({selectedAsset})</label>
                <input type="number" className="input-field" value={customSize} onChange={(e) => setCustomSize(e.target.value)}/>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button className="pct-btn" onClick={() => handlePercentageCalculate(0.25)}>25%</button>
                  <button className="pct-btn" onClick={() => handlePercentageCalculate(0.50)}>50%</button>
                  <button className="pct-btn" onClick={() => handlePercentageCalculate(0.75)}>75%</button>
                  <button className="pct-btn" onClick={() => handlePercentageCalculate(1.00)}>100%</button>
                </div>
              </div>
              <div style={{ background: '#0d1117', padding: '15px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>ESTIMATED ORDER VALUATION COST</span>
                <strong style={{ fontSize: '22px', color: '#ffffff', fontFamily: 'monospace' }}>
                  ${calculatedCost.toLocaleString(undefined, {minimumFractionDigits: 2})} <span style={{fontSize: '11px', color: '#8b949e', fontWeight: 'normal'}}>USD</span>
                </strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="action-btn" onClick={() => handleExecuteTrade('LONG')}>ROUTE MARKET BUY (LONG)</button>
              <button className="action-btn short" onClick={() => handleExecuteTrade('SHORT')}>ROUTE MARKET SELL (SHORT)</button>
            </div>
          </div>

          {/* Real-time Order Book Engine Component */}
          <div className="hud-card">
            <h2 className="hud-card-title">{selectedAsset} Order Depth Liquidity Book</h2>
            <div className="order-book-grid">
              <div>
                <div className="book-side-title title-ask">ORDER ASKS (SELL WALL)</div>
                {orderBook.asks.map((row, idx) => (
                  <div key={`ask-${idx}`} className="book-row ask">
                    <span>${row.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <span style={{color: '#8b949e'}}>{row.size.toFixed(4)}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="book-side-title title-bid">ORDER BIDS (BUY LIQUIDITY)</div>
                {orderBook.bids.map((row, idx) => (
                  <div key={`bid-${idx}`} className="book-row bid">
                    <span>${row.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <span style={{color: '#8b949e'}}>{row.size.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Ledger Logs Row */}
          <div className="hud-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px dashed #30363d', paddingBottom: '5px' }}>
              <h2 className="hud-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Persistent Session Auditing Ledger</h2>
              <button onClick={handleResetWorkspace} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', fontWeight: 'bold' }}>[RESET WORKSPACE DB]</button>
            </div>
            {ledger.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e', fontSize: '12px' }}>No active clearings logged in browser memory. Place a transaction above to populate.</div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Asset</th>
                    <th>Execution Type</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Total Capitalization</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((tx, idx) => (
                    <tr key={idx}>
                      <td style={{color: '#8b949e'}}>{tx.timestamp}</td>
                      <td style={{ color: '#58a6ff', fontWeight: 'bold' }}>{tx.asset}</td>
                      <td style={{ color: tx.type.includes('LONG') ? '#56e39f' : '#f85149', fontWeight: 'bold' }}>{tx.type}</td>
                      <td style={{fontFamily: 'monospace'}}>${tx.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td style={{fontFamily: 'monospace'}}>{tx.size}</td>
                      <td style={{fontFamily: 'monospace', color: '#ffffff'}}>${tx.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
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