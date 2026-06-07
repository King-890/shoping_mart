const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// POST /api/contact - Submit a contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }

        const newMessage = {
            name,
            email,
            subject: subject || 'No Subject',
            message,
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('messages').add(newMessage);
        const savedMessage = { id: docRef.id, ...newMessage };

        res.status(201).json({ success: true, message: 'Message sent successfully!', data: savedMessage });
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// GET /api/contact - Get all messages (Admin only)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('messages')
            .orderBy('created_at', 'desc')
            .get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(messages);
    } catch (error) {
        console.error('Contact Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving messages' });
    }
});

module.exports = router;
