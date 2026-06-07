const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const db = require('../utils/db');

// Initialize Razorpay
let razorpay;
try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !keyId.includes('placeholder')) {
        razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });
        console.log('✅ Razorpay initialized with real keys.');
    } else {
        console.warn('⚠️ Razorpay keys are missing or contain "placeholder". Online payments will fail.');
        razorpay = new Razorpay({
            key_id: 'rzp_test_PLACEHOLDER',
            key_secret: 'PLACEHOLDER_SECRET'
        });
    }
} catch (error) {
    console.error('❌ CRITICAL: Razorpay failed to initialize:', error.message);
}

// 1. Create Order (Unified for Firebase)
router.post('/create-order', async (req, res) => {
    const { items, shippingAddress, paymentMethod, email, user_id } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    try {
        // SERVER-SIDE PRICE VALIDATION
        const itemIds = items.map(item => item.id);

        let dbProducts = [];
        if (itemIds.length > 0) {
            const snapshot = await db.collection('products')
                .where('__name__', 'in', itemIds)
                .get();
            dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        let verifiedTotal = 0;
        let totalCost = 0;
        const enrichedItems = items.map(item => {
            const dbProduct = dbProducts.find(p => p.id === item.id);
            const qty = item.quantity || 1;
            if (dbProduct) {
                verifiedTotal += dbProduct.price * qty;
                totalCost += (dbProduct.cost_price || 0) * qty;
                return {
                    ...item,
                    price: dbProduct.price,
                    cost_price: dbProduct.cost_price || 0,
                    quantity: qty
                };
            }
            return item;
        });

        const newOrder = {
            items: enrichedItems,
            totalAmount: verifiedTotal,
            totalCost: totalCost,
            paymentMethod: paymentMethod.toUpperCase(),
            shippingAddress,
            paymentStatus: paymentMethod.toLowerCase() === 'cod' ? 'Pending' : 'Under Verification',
            status: 'Processing',
            email: email.trim().toLowerCase(),
            user_id: user_id || null,
            created_at: new Date().toISOString()
        };

        // Insert into Firestore
        const docRef = await db.collection('orders').add(newOrder);
        const order = { id: docRef.id, ...newOrder };

        // Create in-app notification for ALL admin users
        try {
            const dbData = require('../utils/storage').loadData();
            const admins = (dbData.users || []).filter(u => u.role === 'admin');

            for (const admin of admins) {
                await db.collection('notifications').add({
                    user_id: admin._id || admin.id,
                    title: '📦 New Order Received',
                    message: `New order #${order.id} placed by ${newOrder.email} for ₹${newOrder.totalAmount}`,
                    type: 'admin-order',
                    read: false,
                    created_at: new Date().toISOString()
                });
            }
        } catch (adminNotiErr) {
            console.error('Failed to notify admins in-app:', adminNotiErr);
        }

        res.status(201).json({ success: true, order, message: 'Order created successfully' });
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order on server' });
    }
});

// GET /orders/:id - Track Order
router.get('/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await db.collection('orders').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Order Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving order' });
    }
});

// 2. Create Razorpay Order (For Online Payment Initialization)
router.post('/razorpay-order', async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Items are required for payment' });
    }

    try {
        // SERVER-SIDE PRICE CALCULATION
        const itemIds = items.map(item => item.id);

        let dbProducts = [];
        if (itemIds.length > 0) {
            const snapshot = await db.collection('products')
                .where('__name__', 'in', itemIds)
                .get();
            dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        let verifiedTotal = 0;
        items.forEach(item => {
            const dbProduct = dbProducts.find(p => p.id === item.id);
            const qty = item.quantity || 1;
            if (dbProduct) {
                verifiedTotal += dbProduct.price * qty;
            }
        });

        if (verifiedTotal <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        const options = {
            amount: Math.round(verifiedTotal * 100),
            currency: 'INR',
            receipt: 'receipt_' + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json({ ...order, verifiedTotal });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Something went wrong with payment initialization' });
    }
});

// 3. Verify Payment & Finalize Order
router.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        try {
            // Update Order Status in Firestore
            await db.collection('orders').doc(order_id).update({
                paymentStatus: 'Paid',
                paymentId: razorpay_payment_id
            });

            res.json({ success: true, message: 'Payment verified and order updated' });
        } catch (error) {
            console.error('Order Update Error:', error);
            res.status(500).json({ success: false, message: 'Payment verified but failed to update order record' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
});

// 6. Get All Orders (Admin)
router.get('/orders', async (req, res) => {
    try {
        const snapshot = await db.collection('orders').orderBy('created_at', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (error) {
        console.error('Orders Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving orders' });
    }
});

// 7. Update Order Status (Admin)
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const orderSnapshot = await db.collection('orders').doc(id).get();
        if (orderSnapshot.exists) {
            const orderData = orderSnapshot.data();
            const customerUserId = orderData.user_id;

            await db.collection('orders').doc(id).update({ status });

            if (customerUserId) {
                const titleMap = {
                    'Processing': '📦 Order Processing',
                    'Shipped': '🚚 Order Shipped',
                    'Delivered': '🎉 Order Delivered',
                    'Cancelled': '❌ Order Cancelled'
                };
                const msgMap = {
                    'Processing': `Your order #${id} is currently being processed by the store.`,
                    'Shipped': `Great news! Your order #${id} has been shipped and is on the way.`,
                    'Delivered': `Success! Your order #${id} has been delivered successfully. Thank you for shopping with us!`,
                    'Cancelled': `Your order #${id} has been cancelled.`
                };

                await db.collection('notifications').add({
                    user_id: customerUserId,
                    title: titleMap[status] || `Order Update`,
                    message: msgMap[status] || `Your order #${id} status is now: ${status}`,
                    type: 'order',
                    read: false,
                    created_at: new Date().toISOString()
                });
            }
        } else {
            await db.collection('orders').doc(id).update({ status });
        }

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Order Status Update Error:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
});

// GET /user-orders/:email - Get past orders for user
router.get('/user-orders/:email', async (req, res) => {
    const { email } = req.params;
    const { userId } = req.query;
    try {
        let snapshot;
        if (userId && userId !== 'null' && userId !== 'undefined') {
            snapshot = await db.collection('orders')
                .where('user_id', '==', userId)
                .orderBy('created_at', 'desc')
                .get();
            if (snapshot.empty) {
                snapshot = await db.collection('orders')
                    .where('email', '==', email.trim().toLowerCase())
                    .orderBy('created_at', 'desc')
                    .get();
            }
        } else {
            snapshot = await db.collection('orders')
                .where('email', '==', email.trim().toLowerCase())
                .orderBy('created_at', 'desc')
                .get();
        }
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (error) {
        console.error('Fetch User Orders Error:', error);
        res.status(500).json({ message: 'Error retrieving user orders' });
    }
});

// PATCH /orders/:id/status - Update order status (admin or user cancel)
router.patch('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }
    try {
        const docRef = db.collection('orders').doc(id);
        const snap = await docRef.get();
        if (!snap.exists) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        await docRef.update({ status, updated_at: new Date().toISOString() });

        // Notify user about status update
        const orderData = snap.data();
        const userId = orderData.user_id || orderData.userId;
        if (userId) {
            const notifRef = db.collection('notifications').doc();
            await notifRef.set({
                userId,
                type: 'order_update',
                title: 'Order Status Updated',
                message: `Your order #${id.slice(0, 8)} status has been updated to: ${status}.`,
                orderId: id,
                read: false,
                created_at: new Date().toISOString()
            });
        }

        res.json({ success: true, message: `Order ${id} status updated to ${status}` });
    } catch (error) {
        console.error('Order Status Update Error:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

module.exports = router;

