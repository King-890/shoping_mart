const express = require('express');
const router = express.Router();
const { loadData, writeData } = require('../utils/storage');

// Signup
router.post('/signup', (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const dbData = loadData();

        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }

        const existingUser = dbData.users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = {
            _id: Date.now().toString(),
            email: normalizedEmail,
            password: password.trim(),
            firstName,
            lastName,
            role: (normalizedEmail === 'shoppingmartgayaji@gmail.com' || 
                   normalizedEmail === 'ugantsharma@89' || 
                   normalizedEmail === 'bipiye3181@ixospace.com') ? 'admin' : 'user'
        };

        dbData.users.push(newUser);
        writeData(dbData);

        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error during signup' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();
        const dbData = loadData();

        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }

        console.log(`Login attempt for: ${normalizedEmail}`);
        console.log(`Total users in DB: ${dbData.users.length}`);

        const user = dbData.users.find(u => {
            const dbEmail = u.email.trim().toLowerCase();
            const dbPass = u.password.trim();
            const match = dbEmail === normalizedEmail && dbPass === normalizedPassword;
            if (dbEmail === normalizedEmail && !match) {
                console.log(`Email match found, but password mismatch for: ${normalizedEmail}`);
            }
            return match;
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
// Administrative: Get All Users
router.get('/users', (req, res) => {
    try {
        const dbData = loadData();
        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }
        // Return users without passwords for security
        const safeUsers = dbData.users.map(u => ({
            _id: u._id || u.id,
            id: u.id || u._id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role || 'user'
        }));
        res.json(safeUsers);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving users' });
    }
});

// Administrative: Create New Member
router.post('/users', (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const dbData = loadData();

        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }

        const existingUser = dbData.users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = {
            _id: Date.now().toString(),
            email: normalizedEmail,
            password: password ? password.trim() : '123456',
            firstName: firstName || '',
            lastName: lastName || '',
            role: role || 'user'
        };

        dbData.users.push(newUser);
        writeData(dbData);

        res.status(201).json({ success: true, user: { _id: newUser._id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, role: newUser.role } });
    } catch (error) {
        console.error('Add Member Error:', error);
        res.status(500).json({ success: false, message: 'Server error adding member' });
    }
});

// Administrative: Update User Role (Change Power)
router.patch('/users/:id/role', (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const dbData = loadData();

        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }

        const userIndex = dbData.users.findIndex(u => (u._id === id || u.id === id));
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const targetUser = dbData.users[userIndex];
        
        // Super-admin Role Protection
        const superAdmins = ['shoppingmartgayaji@gmail.com', 'ugantsharma@89', 'bipiye3181@ixospace.com'];
        if (superAdmins.includes(targetUser.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Security Violation: Cannot modify role of a primary super-admin account' });
        }

        dbData.users[userIndex].role = role;
        writeData(dbData);

        res.json({ success: true, user: { _id: targetUser._id, email: targetUser.email, firstName: targetUser.firstName, lastName: targetUser.lastName, role: role } });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating user role' });
    }
});

// Administrative: Delete User
router.delete('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dbData = loadData();

        if (!Array.isArray(dbData.users)) {
            dbData.users = [];
        }

        const user = dbData.users.find(u => (u._id === id || u.id === id));
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Super-admin Delete Protection
        const superAdmins = ['shoppingmartgayaji@gmail.com', 'ugantsharma@89', 'bipiye3181@ixospace.com'];
        if (superAdmins.includes(user.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Security Violation: Cannot delete a primary super-admin account' });
        }

        dbData.users = dbData.users.filter(u => (u._id !== id && u.id !== id));
        writeData(dbData);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting user' });
    }
});

module.exports = router;

