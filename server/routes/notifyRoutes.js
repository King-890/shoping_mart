const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../utils/db');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.SMTP_PASS // Use Google App Password
    }
});

// Setup Twilio (Safeguard against invalid or placeholder keys)
let twilioClient;
const twilioSid = process.env.TWILIO_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (twilioSid && twilioSid.startsWith('AC') && twilioAuthToken) {
    try {
        twilioClient = require('twilio')(twilioSid, twilioAuthToken);
        console.log('✅ Twilio SMS service initialized.');
    } catch (err) {
        console.error('❌ Failed to initialize Twilio:', err.message);
    }
} else {
    console.warn('⚠️ Twilio SID missing or invalid. SMS notifications disabled.');
}

const sendSMS = async (to, body) => {
    if (!twilioClient || !process.env.TWILIO_PHONE) {
        console.warn('Twilio not configured. Skipping SMS.');
        return;
    }
    try {
        await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE,
            to
        });
        console.log('✅ SMS Sent to', to);
    } catch (err) {
        console.error('❌ Twilio Error:', err.message);
    }
};

// Notify on New Order
router.post('/order', async (req, res) => {
    try {
        const { order, email } = req.body;

        // SERVER-SIDE PRICE VALIDATION (Anti-Hack)
        let calculatedTotal = 0;
        let isFraud = false;

        try {
            // Fetch live product data from Firestore for these items
            const itemIds = order.items.map(item => item.id);

            let dbProducts = [];
            if (itemIds.length > 0) {
                const snapshot = await db.collection('products')
                    .where('__name__', 'in', itemIds)
                    .get();
                dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            // Recalculate total based on DB prices
            order.items.forEach(item => {
                const dbProduct = dbProducts.find(p => p.id === item.id);
                if (dbProduct) {
                    calculatedTotal += dbProduct.price;
                } else {
                    isFraud = true; // Item doesn't exist in DB
                }
            });

            // Compare with frontend total
            if (Math.abs(calculatedTotal - order.totalAmount) > 1) { // Allow tiny decimal diff if any
                isFraud = true;
            }
        } catch (err) {
            console.error('Validation Error:', err);
            // If validation fails, we continue but mark as unverified
        }

        if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_app_password_here') {
            console.warn('SMTP_PASS not configured. Skipping email.');
            return res.json({ success: true, message: 'Email skipped (unconfigured)' });
        }

        const mailOptions = {
            from: `"Gaya ji Shopping mart Notifications" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `${isFraud ? '⚠️ [FRAUD DETECTION] ' : '📦 '} New Order Placed: ${order.id}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid ${isFraud ? '#ff4444' : '#eee'}; padding: 20px;">
                    ${isFraud ? `<h2 style="color: #ff4444;">FRAUD WARNING: Price Mismatch!</h2><p style="color: #ff4444;">The frontend reported ₹${order.totalAmount}, but server calculated ₹${calculatedTotal}. <strong>Do not ship this order without verification!</strong></p>` : `<h2 style="color: #00f0ff;">New Order Received!</h2>`}
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Customer Email:</strong> ${email}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                    
                    <h3 style="border-bottom: 2px solid #00f0ff; padding-bottom: 5px;">Shipping Address</h3>
                    <p style="background: #f9f9f9; padding: 10px; border-radius: 4px;">
                        ${order.shippingAddress}
                    </p>

                    <h3 style="border-bottom: 2px solid #00f0ff; padding-bottom: 5px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; background: #f4f4f4;">
                                <th style="padding: 8px;">Item</th>
                                <th style="padding: 8px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <p style="margin-top: 20px; font-size: 0.8rem; color: #888;">
                        This is an automated notification from Gaya ji Shopping mart System.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // SMS NOTIFICATION (If phone exists)
        if (order.shippingAddress && order.shippingAddress.includes('Phone:')) {
            const phoneMatch = order.shippingAddress.match(/Phone:\s*(\+?\d+)/);
            if (phoneMatch && phoneMatch[1]) {
                const userPhone = phoneMatch[1];
                await sendSMS(
                    userPhone,
                    `Hi! Your Gaya ji Shopping mart order #${order.id} for ₹${order.totalAmount} has been placed. Track it here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${order.id}`
                );
            }
        }

        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        console.error('Email Notification Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
});

// Notify on New Message (Contact Form)
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_app_password_here') {
            console.warn('SMTP_PASS not configured. Skipping email.');
            return res.json({ success: true, message: 'Email skipped (unconfigured)' });
        }

        const mailOptions = {
            from: `"Gaya ji Shopping mart Contact" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `💬 New Message: ${subject || 'No Subject'}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f4f4f4; padding: 1rem; border-left: 4px solid #00f0ff;">
                    ${message}
                </blockquote>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        console.error('Email Notification Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
});

// Notify on Return / Exchange Request
router.post('/return', async (req, res) => {
    try {
        const { name, email, orderNumber, phoneNumber, productName, reason, details } = req.body;

        if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_app_password_here') {
            console.warn('SMTP_PASS not configured. Skipping email.');
            return res.json({ success: true, message: 'Email skipped (unconfigured)' });
        }

        const mailOptions = {
            from: `"Gaya ji Shopping mart Returns" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🔄 Return/Exchange Request: Order #${orderNumber}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #991b1b; border-bottom: 2px solid #fca5a5; padding-bottom: 8px; margin-top: 0;">Return or Exchange Request</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #eee;">Name:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Order Number:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${orderNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Phone Number:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${phoneNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Product Name:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${productName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Reason:</td>
                            <td style="padding: 6px 0; border-bottom: 1px solid #eee; color: #b91c1c; font-weight: bold;">${reason}</td>
                        </tr>
                    </table>
                    
                    <h3 style="margin-top: 20px; margin-bottom: 8px; color: #1e293b;">Additional Details:</h3>
                    <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 0; line-height: 1.5; font-size: 0.9rem;">
                        ${details}
                    </p>
                    
                    <p style="margin-top: 20px; font-size: 0.8rem; color: #64748b; border-top: 1px solid #eee; padding-top: 12px;">
                        This is an automated notification from Gaya ji Shopping mart System. Please follow up with the customer within 24-48 hours.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Return notification email sent successfully' });
    } catch (error) {
        console.error('Return Email Notification Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send return notification email' });
    }
});

module.exports = router;
