import React, { useState, useEffect } from 'react';

// Production UI Theme Stylesheet
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
    padding: 10px 16px;
    font-family: inherit;
    cursor: pointer;
    font-weight: bold;
    flex: 1;
  }
  .action-btn:hover { background-color: #2ea44f; }
  .action-btn.short { background-color: #da3633; }
  .action-btn.short:hover { background-color: #b62320; }
  
  .input-field {
    background-color: #0d1117;
    border: 1px solid #30363d;
    color: #f1f5f9;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
  }
  .input-field:focus {
    border-color: #58a6ff;
    outline: none;
  }
  .pct-btn {
    background-color: #21262d;
    border: 1px solid #30363d;
    color: #c9d1d9;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: inherit;
    flex: 1;
    text-align: center;
  }
  .pct-btn:hover {
    background-color: #30363d;
    color: #ffffff;
  }
  .toast {
    position: fixed; bottom: 20px; right: 20px; padding: 14px 24px; border-radius: 4px; font-weight: bold; z-index: 1000; color: #ffffff;
  }
`;

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [marketData, setMarketData] = useState({
    BTC: { name: 'Bitcoin', currentPrice: 63646.00, priceChange24h: 1.17, aiSummary: 'Streaming authentic high-frequency order book profiles via public web sockets...' },
    ETH: { name: 'Ethereum', currentPrice: 3450.50, priceChange24h: -1.24, aiSummary: 'Tracking institutional spot execution depths across high-volume corridors...' },
    SOL: { name: 'Solana', currentPrice: 145.25, priceChange24h: 4.87, aiSummary: 'Monitoring active transaction pools for real-time liquidity pipeline fluctuations...' }
  });

  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [notification, setNotification] = useState(null);
  
  // Interactive Custom Input Form States
  const [customSize, setCustomSize] = useState('0.01');

  // PERSISTENT ACCOUNT WALLET STATES (LocalStorage Layer)
  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem('alpha_quant_balance');
    return savedBalance ? parseFloat(savedBalance) : 100000.00;
  });

  const [activePositions, setActivePositions] = useState(() => {
    const savedPositions = localStorage.getItem('alpha_quant_positions');
    return savedPositions ? JSON.parse(savedPositions) : {};
  });

  const [ledger, setLedger] = useState(() => {
    const savedLedger = localStorage.getItem('alpha_quant_ledger');
    return savedLedger ? JSON.parse(savedLedger) : [];
  });

  // Keep state collections locked into internal browser storage cache automatically
  useEffect(() => {
    localStorage.setItem('alpha_quant_balance', walletBalance.toString());
    localStorage.setItem('alpha_quant_positions', JSON.stringify(activePositions));
    localStorage.setItem('alpha_quant_ledger', JSON.stringify(ledger));
  }, [walletBalance, activePositions, ledger]);

  // REAL-TIME EVENT-DRIVEN WEBSOCKET RECEPTOR HOOK
  useEffect(() => {
    const tradingPair = `${selectedAsset.toLowerCase()}usdt`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${tradingPair}@depth10@100ms`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.asks || !data.bids) return;

        const processedAsks = data.asks.slice(0, 8).map(ask => ({
          price: parseFloat(ask[0]),
          size: parseFloat(ask[1])
        })).reverse();

        const processedBids = data.bids.slice(0, 8).map(bid => ({
          price: parseFloat(bid[0]),
          size: parseFloat(bid[1])
        }));

        setOrderBook({ asks: processedAsks, bids: processedBids });

        if (processedBids[0] && processedAsks[0]) {
          const midPrice = parseFloat(((processedBids[0].price + processedAsks[0].price) / 2).toFixed(2));
          setMarketData(prev => ({
            ...prev,
            [selectedAsset]: { ...prev[selectedAsset], currentPrice: midPrice }
          }));
        }
      } catch (err) {
        console.error("Stream parsing disruption: ", err);
      }
    };

    socket.onerror = (error) => console.error("WebSocket Pipeline Exception:", error);
    return () => socket.close();
  }, [selectedAsset]);

  // RISK PERCENT ALLOCATION SHORTCUT MATH
  const applyBalancePercentage = (pct) => {
    const currentSpotPrice = marketData[selectedAsset].currentPrice;
    if (!currentSpotPrice || currentSpotPrice <= 0) return;
    
    const budget = walletBalance * pct;
    const computedSize = (budget / currentSpotPrice);
    
    // Format sizing naturally based on asset profile thresholds
    if (selectedAsset === 'BTC') setCustomSize(computedSize.toFixed(4));
    else if (selectedAsset === 'ETH') setCustomSize(computedSize.toFixed(3));
    else setCustomSize(computedSize.toFixed(1));
  };

  // ACCOUNT BALANCE & EXCH_ROUTING LOGIC (UPDATED FOR DIRECT MANUAL VALUE CAPTURES)
  const executeMarketOrder = (side) => {
    const currentSpotPrice = marketData[selectedAsset].currentPrice;
    const orderSize = parseFloat(customSize);

    if (isNaN(orderSize) || orderSize <= 0) {
      triggerToast("CRITICAL: Invalid transaction allocation size entered", "error");
      return;
    }

    const tradeValue = parseFloat((currentSpotPrice * orderSize).toFixed(2));

    if (side === 'LONG' && tradeValue > walletBalance) {
      triggerToast("CRITICAL: Insufficient Capital for Order Routing Allocation", "error");
      return;
    }

    if (side === 'LONG') {
      setWalletBalance(prev => parseFloat((prev - tradeValue).toFixed(2)));
      setActivePositions(prev => ({
        ...prev,
        [selectedAsset]: parseFloat(((prev[selectedAsset] || 0) + orderSize).toFixed(4))
      }));
    } else {
      const currentHolding = activePositions[selectedAsset] || 0;
      if (currentHolding < orderSize) {
        triggerToast(`CRITICAL: Insufficient Asset Balance to liquidate ${selectedAsset}`, "error");
        return;
      }
      setWalletBalance(prev => parseFloat((prev + tradeValue).toFixed(2)));
      setActivePositions(prev => ({
        ...prev,
        [selectedAsset]: parseFloat((currentHolding - orderSize).toFixed(4))
      }));
    }

    const tradeEntry = {
      timestamp: new Date().toLocaleTimeString(),
      asset: selectedAsset,
      type: `MARKET_${side}`,
      price: currentSpotPrice,
      size: orderSize,
      totalValue: tradeValue
    };

    setLedger(prev => [tradeEntry, ...prev]);
    triggerToast(`ROUTED: ${side} ${orderSize} ${selectedAsset} @ $${currentSpotPrice}`, 'success');
  };

  const triggerToast = (msg, status) => {
    setNotification({ msg, status });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetEnvironmentDefaults = () => {
    setLedger([]);
    setWalletBalance(100000.00);
    setActivePositions({});
    setCustomSize('0.01');
    localStorage.removeItem('alpha_quant_ledger');
    localStorage.removeItem('alpha_quant_balance');
    localStorage.removeItem('alpha_quant_positions');
    triggerToast("SYSTEM RESET: Database logs and cash allocations cleared.", "success");
  };

  // Precompute calculated order parameters dynamically
  const calculatedCost = parseFloat(((marketData[selectedAsset].currentPrice || 0) * (parseFloat(customSize) || 0)).toFixed(2));

  return (
    <div className="dashboard-container">
      <style>{styles}</style>
      
      {notification && (
        <div className="toast" style={{ backgroundColor: notification.status === 'success' ? '#238636' : '#da3633' }}>
          {notification.msg}
        </div>
      )}

      {/* Primary Dashboard HUD Head Panel */}
      <div className="hud-card">
        <div className="header-panel">
          <div>
            <h1 className="title-h1">ALPHA QUANT WORKING HUB v1.2</h1>
            <div style={{ color: '#6e7681', fontSize: '13px', marginTop: '4px' }}>Real-Time Live Algorithmic Production Workspace</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#8b949e', fontSize: '11px', display: 'block' }}>COMMS RECEPTOR STATUS</span>
            <strong style={{ color: '#58a6ff', fontSize: '14px', fontFamily: 'monospace' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#56e39f', marginRight: '6px' }}></span>
              LIVE_BINANCE_WEBSOCKET
            </strong>
          </div>
        </div>

        {/* Dynamic Balance Tracking Card Bar */}
        <div style={{ display: 'flex', gap: '30px', marginTop: '15px', background: '#0d1117', padding: '12px', borderRadius: '4px', border: '1px solid #21262d' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', fontWeight: 'bold' }}>AVAILABLE LIQUIDITY CAPITAL</span>
            <strong style={{ fontSize: '18px', color: '#56e39f', fontFamily: 'monospace' }}>${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} USD</strong>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', fontWeight: 'bold' }}>ACTIVE {selectedAsset} POSITION HOLDINGS</span>
            <strong style={{ fontSize: '18px', color: '#38bdf8', fontFamily: 'monospace' }}>{activePositions[selectedAsset] || "0.0000"} {selectedAsset}</strong>
          </div>
        </div>
      </div>

      <div className="workspace-grid">
        {/* Left Hand: Core Watchlist Panel */}
        <div className="hud-card">
          <h2 className="hud-card-title">Exchange Core Watchlist</h2>
          <div>
            {Object.keys(marketData).map(ticker => (
              <div 
                key={ticker} 
                className={`asset-row ${selectedAsset === ticker ? 'selected' : ''}`}
                onClick={() => setSelectedAsset(ticker)}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#f1f5f9' }}>{ticker}/USDT</strong>
                  <span style={{ fontSize: '11px', color: '#8b949e' }}>{marketData[ticker].name}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>${marketData[ticker].currentPrice.toLocaleString()}</div>
                  <span style={{ fontSize: '10px', color: marketData[ticker].priceChange24h >= 0 ? '#56e39f' : '#f85149' }}>
                    {marketData[ticker].priceChange24h >= 0 ? '+' : ''}{marketData[ticker].priceChange24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '25px', background: '#0d1117', padding: '12px', borderRadius: '4px', border: '1px solid #30363d' }}>
            <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>SYSTEM INTEL FEED</div>
            <p style={{ margin: 0, fontSize: '12px', color: '#58a6ff', lineHeight: '1.4' }}>{marketData[selectedAsset].aiSummary}</p>
          </div>
        </div>

        {/* Right Hand: Liquidity Analysis Panels */}
        <div>
          {/* INTERACTIVE USER MANUAL ORDER FORM CARD */}
          <div className="hud-card" style={{ borderColor: '#21262d', background: '#1c2128' }}>
            <h2 className="hud-card-title" style={{ color: '#58a6ff' }}>Execution Management Desk</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  ORDER VALUE SIZE ({selectedAsset})
                </label>
                <input 
                  type="number" 
                  step="0.001"
                  className="input-field"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="0.00"
                />
                <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                  <button className="pct-btn" onClick={() => applyBalancePercentage(0.25)}>25%</button>
                  <button className="pct-btn" onClick={() => applyBalancePercentage(0.50)}>50%</button>
                  <button className="pct-btn" onClick={() => applyBalancePercentage(0.75)}>75%</button>
                  <button className="pct-btn" onClick={() => applyBalancePercentage(1.00)}>100%</button>
                </div>
              </div>
              
              <div style={{ background: '#0d1117', padding: '12px', borderRadius: '6px', border: '1px solid #30363d', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', textTransform: 'uppercase' }}>Estimated Order Valuation cost</span>
                <strong style={{ fontSize: '20px', color: '#ffffff', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>
                  ${calculatedCost.toLocaleString(undefined, {minimumFractionDigits: 2})} <span style={{fontSize: '12px', color: '#8b949e'}}>USD</span>
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button className="action-btn" onClick={() => executeMarketOrder('LONG')}>ROUTE MARKET BUY (LONG)</button>
              <button className="action-btn short" onClick={() => executeMarketOrder('SHORT')}>ROUTE MARKET SELL (SHORT)</button>
            </div>
          </div>

          {/* Order Book Depth Canvas */}
          <div className="hud-card">
            <h2 className="hud-card-title">{selectedAsset} Order Depth Liquidity Book</h2>
            
            <div className="order-book-grid">
              <div>
                <div className="book-side-title title-ask">ORDER ASKS (SELL WALL)</div>
                {orderBook.asks.length === 0 ? <div style={{textAlign:'center', fontSize:'12px', color:'#485563'}}>Connecting to stream...</div> : 
                  orderBook.asks.map((row, idx) => (
                    <div key={`ask-${idx}`} className="book-row ask">
                      <span>${row.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      <span>{row.size.toFixed(4)}</span>
                    </div>
                ))}
              </div>
              <div>
                <div className="book-side-title title-bid">ORDER BIDS (BUY LIQUIDITY)</div>
                {orderBook.bids.length === 0 ? <div style={{textAlign:'center', fontSize:'12px', color:'#485563'}}>Connecting to stream...</div> : 
                  orderBook.bids.map((row, idx) => (
                    <div key={`bid-${idx}`} className="book-row bid">
                      <span>${row.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      <span>{row.size.toFixed(4)}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logging Table */}
          <div className="hud-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="hud-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Persistent Session Auditing Ledger</h2>
              {(ledger.length > 0 || walletBalance !== 100000.00) && (
                <button 
                  onClick={resetEnvironmentDefaults} 
                  style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}
                >
                  [RESET WORKSPACE DB]
                </button>
              )}
            </div>
            
            {ledger.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e', fontSize: '13px' }}>
                No active clearings logged in browser memory. Place a transaction above to populate.
              </div>
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
                      <td>{tx.timestamp}</td>
                      <td style={{ color: '#58a6ff', fontWeight: 'bold' }}>{tx.asset}</td>
                      <td style={{ color: tx.type.includes('LONG') ? '#56e39f' : '#f85149' }}>{tx.type}</td>
                      <td>${tx.price.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
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