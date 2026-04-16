require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Airtable = require('airtable');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Airtable Config (Graceful check)
let base = null;
if (process.env.AIRTABLE_API_KEY) {
    base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
} else {
    console.warn('⚠️ AIRTABLE_API_KEY missing. Backend updates will be disabled.');
}
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Bookings';

app.use(express.json());
// Serve static frontend files from the 'public' directory
app.use(express.static('public'));

// Admin Dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Failure Analysis Mapping
const FAILURE_MAPPING = {
    'insufficient_funds': {
        msg: 'Account balance is too low.',
        action: 'Please top up your account or use another card.'
    },
    'invalid_card_details': {
        msg: 'The card details provided are incorrect.',
        action: 'Double-check your card number, expiry date, and CVV.'
    },
    'transaction_limit_exceeded': {
        msg: 'You have reached your transaction limit.',
        action: 'Contact your bank to increase your limit or use a different payment method.'
    },
    'authentication_failed': {
        msg: '3D Secure authentication failed.',
        action: 'Ensure you provide the correct OTP or check with your bank.'
    },
    'expired_card': {
        msg: 'This card has expired.',
        action: 'Please use a valid, non-expired card.'
    },
    'bank_system_error': {
        msg: 'Your bank is currently experiencing issues.',
        action: 'Wait a few minutes and try again, or use another bank card.'
    },
    'default': {
        msg: 'Payment was declined by the processor.',
        action: 'Please contact your bank or try a different payment method.'
    }
};

// Webhook Endpoint
app.post('/webhook', async (req, res) => {
    const signature = req.headers['verif-hash'];
    const secretHash = process.env.FLW_SECRET_HASH;

    // 1. Verify Signature
    if (!signature || signature !== secretHash) {
        console.warn('Invalid signature received');
        return res.status(401).send('Unauthorized');
    }

    const payload = req.body;
    console.log('Webhook received for TX:', payload.tx_ref);

    // 2. Acknowledge Receipt Immediately
    res.status(200).send('OK');

    // 3. Verify Transaction with Flutterwave API (Crucial for Security)
    try {
        const verificationResponse = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${payload.id}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
                }
            }
        );

        const data = verificationResponse.data.data;
        let paymentStatus = 'Pending';
        let failureReason = '';
        let resolutionSteps = '';

        if (data.status === 'successful' && data.amount >= data.charged_amount) {
            paymentStatus = 'সফল';
        } else if (data.status === 'failed') {
            paymentStatus = 'Failed';
            
            // Failure Analysis
            const errorCode = data.processor_response || 'default';
            const analysis = FAILURE_MAPPING[errorCode] || FAILURE_MAPPING['default'];
            failureReason = analysis.msg;
            resolutionSteps = analysis.action;

            // 4. Trigger Make.com Automation for failed payments
            if (process.env.MAKE_WEBHOOK_URL) {
                await axios.post(process.env.MAKE_WEBHOOK_URL, {
                    guest_email: data.customer.email,
                    guest_name: data.customer.name,
                    transaction_id: data.id,
                    amount: data.amount,
                    currency: data.currency,
                    failure_reason: failureReason,
                    resolution_steps: resolutionSteps,
                    retry_link: `https://sentinelengine.softr.app/repay?tx_ref=${data.tx_ref}`
                });
            }
        }

        // 5. Update Airtable
        if (!base) {
            console.warn('Airtable not configured. Skipping database update.');
            return;
        }

        const records = await base(tableName).select({
            filterByFormula: `{Flutterwave TX Ref} = '${data.tx_ref}'`
        }).firstPage();

        if (records.length > 0) {
            const recordId = records[0].id;
            await base(tableName).update(recordId, {
                'Payment Status': paymentStatus,
                'Failure Reason': failureReason,
                'Resolution Steps': resolutionSteps
            });
            console.log(`Updated Airtable record ${recordId} set to ${paymentStatus}`);
        } else {
            console.warn(`No Airtable record found for tx_ref: ${data.tx_ref}`);
        }

    } catch (error) {
        console.error('Error processing webhook:', error.response ? error.response.data : error.message);
    }
});

app.listen(port, () => {
    console.log(`Sentinel Resolver listening at http://localhost:${port}`);
});
