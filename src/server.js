const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Authorize cross origin sharing parameters securely across local addresses
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ENCRYPTED OUTBOUND TRANSMISSION GATEWAY
app.post('/api/v1/order', async (req, res) => {
    try {
        const { symbol, side, quantity } = req.body;
        const timestamp = Date.now();
        
        // Assemble parameter string configurations 
        const queryString = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
        
        // Hash standard message string utilizing hidden API keys via HMAC SHA256 cryptographic algorithms
        const signature = crypto
            .createHmac('sha256', process.env.BINANCE_SECRET_KEY)
            .update(queryString)
            .digest('hex');

        // Route order structure downstream to production server engine gateways
        const response = await axios.post(
            `https://api.binance.com/api/v3/order?${queryString}&signature=${signature}`,
            {},
            {
                headers: {
                    'X-MBX-APIKEY': process.env.BINANCE_API_KEY
                }
            }
        );

        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error("Broker Transmission Exception Met:", error.response ? error.response.data : error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.response ? error.response.data : { msg: "Internal proxy gateway timeout interruption." } 
        });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🔒 Secure Algorithmic Trading Broker proxy online on port :${PORT}`));