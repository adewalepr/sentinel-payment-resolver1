require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple CORS implementation (since external 'cors' package install failed)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, verif-hash");
    next();
});

// Airtable Config
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Bookings';

const airtableBaseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Helper: Status Mapper
const mapStatus = (status) => {
    if (status === 'সফল' || status === 'Successful' || status === 'successful') return 'Successful';
    if (status === 'Failed' || status === 'failed') return 'Failed';
    return 'Pending';
};

// GET /api/bookings - Fetch and transform records
app.get('/api/bookings', async (req, res) => {
    try {
        const response = await axios.get(airtableBaseUrl, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });

        const transformed = response.data.records.map(record => ({
            name: record.fields['Guest Name'] || record.fields['Name'] || 'Guest',
            date: record.fields['Created Time'] || record.createdTime,
            amount: record.fields['Amount'] || '$0.00',
            status: mapStatus(record.fields['Payment Status']),
            reason: record.fields['Failure Reason'] || '-',
            txRef: record.fields['Flutterwave TX Ref'] || 'N/A'
        }));

        res.json(transformed);
    } catch (error) {
        if (error.response) {
            // Log exactly what Airtable said
            console.error('Airtable Error Status:', error.response.status);
            console.error('Airtable Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error fetching bookings:', error.message);
        }
        res.status(500).json({ error: 'Failed to fetch bookings from Airtable' });
    }
});

// POST /webhook/flutterwave - Webhook handler
app.post('/webhook/flutterwave', async (req, res) => {
    const signature = req.headers['verif-hash'];
    const secretHash = process.env.FLW_SECRET_HASH;

    // 1. Verify Signature
    if (!signature || signature !== secretHash) {
        return res.status(401).send('Unauthorized');
    }

    const payload = req.body;
    const txRef = payload.tx_ref;
    const status = payload.status === 'successful' ? 'Successful' : 'Failed';
    const failureReason = payload.processor_response || 'Declined by processor';

    console.log(`Webhook received for TX: ${txRef}, Status: ${status}`);

    // 2. Acknowledge immediately
    res.status(200).send('OK');

    // 3. Update Airtable asynchronously
    try {
        // Find record by txRef
        const searchResponse = await axios.get(`${airtableBaseUrl}?filterByFormula={Flutterwave TX Ref}='${txRef}'`, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });

        if (searchResponse.data.records.length > 0) {
            const recordId = searchResponse.data.records[0].id;
            
            await axios.patch(`${airtableBaseUrl}/${recordId}`, {
                fields: {
                    'Payment Status': status,
                    'Failure Reason': status === 'Failed' ? failureReason : ''
                }
            }, {
                headers: { 
                    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Airtable record ${recordId} updated to ${status}`);
        } else {
            console.warn(`No record found in Airtable for tx_ref: ${txRef}`);
        }
    } catch (error) {
        console.error('Error updating Airtable after webhook:', error.message);
    }
});

app.listen(port, async () => {
    console.log(`Sentinel Resolver listening at http://localhost:${port}`);
    
    // Startup Diagnostics
    console.log('--- Startup Diagnostics ---');
    console.log('AIRTABLE_API_KEY found:', !!process.env.AIRTABLE_API_KEY);
    if (process.env.AIRTABLE_API_KEY) {
        console.log('AIRTABLE_API_KEY starts with:', process.env.AIRTABLE_API_KEY.substring(0, 8) + '...');
    }
    console.log('AIRTABLE_BASE_ID found:', !!process.env.AIRTABLE_BASE_ID);
    console.log('AIRTABLE_TABLE_NAME:', process.env.AIRTABLE_TABLE_NAME || 'Bookings');
    
    // STARTUP TEST: Try to connect to Airtable immediately
    console.log('--- Running Startup Connection Test ---');
    try {
        const testResponse = await axios.get(airtableBaseUrl, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });
        console.log('✅ Startup Test SUCCESS: Connected to Airtable.');
        console.log('Records found:', testResponse.data.records.length);
    } catch (error) {
        console.log('❌ Startup Test FAILED: Could not connect to Airtable.');
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
    }
    console.log('---------------------------');
});
