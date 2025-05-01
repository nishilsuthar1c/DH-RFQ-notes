const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const storeHash = 'iwxkme8jmh';
const accessToken = 'ak5uhha5ydl4xruv60d03nqwcbszeix';
//If this err comes : Error fetching data: Error: Network response was not ok, change the ngrok url
const ngrokURL = 'https://dh-rfq-notes.vercel.app';

const myChannelId = 1;

app.get('/', async (req, res) => {
    try {
        const apiUrl = `https://api.bigcommerce.com/stores/${storeHash}/v3/hooks`;

        const requestBody = {
            scope: `store/channel/${myChannelId}/order/created`,
            destination: `${ngrokURL}/webhooks`,
            is_active: true
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token': accessToken
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log(responseData);

        res.status(200).json({ message: 'Webhook created successfully', data: responseData });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/webhooks', async (req, res) => {
    try {
        if (!req.body || !req.body.data || !req.body.data.id) {
            throw new Error('Invalid webhook payload');
        }

        const webhookBody =  req.body;
        console.log('webhookBody : ',webhookBody);
        
        const orderId = req.body?.data?.id;
        console.log('orderId : ', orderId);

        if (!orderId) throw new Error('Order ID missing from webhook');

        const accessTokenV3 = 'p0kt5zlmhykdrw8dj99qi2zed3vmg59';
        // const orderDetailsRes = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`, {
        //     headers: {
        //         'X-Auth-Token': accessTokenV3,
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     }
        // });

        // if (!orderDetailsRes.ok) {
        //     const errText = await orderDetailsRes.text();
        //     throw new Error(`Failed to get order details: ${errText}`);
        // }

        // const orderData = await orderDetailsRes.json();
        // const channelId = orderData.channel_id;
        // const currentNote = orderData.staff_notes;
        // console.log('📡 Channel ID:', channelId);

        const channelNoteMap = {
            1: 'Hi there its Nishil',
            2: 'Hi there its Yuvraj',
            3: 'Hi there its Dhruvik'
        };

        const newNote = channelNoteMap[myChannelId] || 'Unknown Channel';

        // 🛑 Prevent infinite loop: Only update if note has changed
        // if (currentNote === newNote) {
        //     console.log('✅ Staff note already set correctly. No update needed.');
        //     return res.status(200).send('No update needed');
        // }

        const updateRes = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'X-Auth-Token': accessTokenV3,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ staff_notes: newNote })
        });

        if (!updateRes.ok) {
            const err = await updateRes.text();
            console.error('❌ Staff note update failed:', err);
            return res.status(500).json({ error: 'Failed to update staff note' });
        }

        console.log(`📝 Staff note updated for Order ${orderId}: ${newNote}`);
        res.status(200).send('Webhook handled successfully');

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
