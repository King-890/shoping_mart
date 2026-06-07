const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get Settings
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('settings').doc('1').get();

        if (!snapshot.exists) {
            return res.json({ facebook: '', instagram: '', phone: '', email: '' });
        }

        res.json(snapshot.data());
    } catch (error) {
        console.error('Settings Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving settings' });
    }
});

// Update Settings
router.put('/', async (req, res) => {
    try {
        const { facebook, instagram, phone, email } = req.body;

        await db.collection('settings').doc('1').set({
            facebook,
            instagram,
            phone,
            email
        }, { merge: true });

        res.json({ message: 'Settings updated successfully', settings: { facebook, instagram, phone, email } });
    } catch (error) {
        console.error('Settings Update Error:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
});

module.exports = router;
