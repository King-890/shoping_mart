const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// 1. Newsletter Subscription
router.post('/subscribe', async (req, res) => {
    const { email, type } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const id = `${email}_${type || 'general'}`;
        await db.collection('subscriptions').doc(id).set({
            email,
            type: type || 'general',
            active: true
        }, { merge: true });

        res.json({ success: true, message: 'Subscribed successfully! 📩' });
    } catch (error) {
        console.error('Newsletter Error:', error);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
});

// 2. Product Waitlist (Price Drop / Restock)
router.post('/waitlist', async (req, res) => {
    const { email, product_id, alert_type } = req.body;

    if (!email || !product_id) return res.status(400).json({ message: 'Email and Product ID required' });

    try {
        await db.collection('waitlists').add({
            email,
            product_id,
            alert_type,
            active: true,
            created_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'Added to waitlist! We will notify you. ✨' });
    } catch (error) {
        console.error('Waitlist Error:', error);
        res.status(500).json({ message: 'Failed to join waitlist' });
    }
});

// 3. Trigger Alerts (Price Drop / Restock)
router.post('/trigger-alerts', async (req, res) => {
    const { product_id, alert_type, productName, newValue } = req.body;

    if (!product_id || !alert_type) return res.status(400).json({ message: 'Product ID and alert type required' });

    try {
        const snapshot = await db.collection('waitlists')
            .where('product_id', '==', product_id)
            .where('alert_type', '==', alert_type)
            .where('active', '==', true)
            .get();

        if (snapshot.empty) return res.json({ success: true, message: 'No users to notify.' });

        const emails = snapshot.docs.map(doc => doc.data().email);

        // Find users for these emails
        const profilesSnapshot = await db.collection('profiles')
            .where('email', 'in', emails)
            .get();

        const notifications = profilesSnapshot.docs.map(doc => ({
            user_id: doc.id,
            title: alert_type === 'price-drop' ? '📉 Price Drop Alert!' : '📦 Back in Stock!',
            message: alert_type === 'price-drop'
                ? `Good news! ${productName} is now available at a lower price: ${newValue}. Grab it before it's gone!`
                : `Great news! ${productName} is back in stock. Order now to secure yours!`,
            type: 'marketing',
            link: `/product/${product_id}`,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        if (notifications.length > 0) {
            const batch = db.batch();
            notifications.forEach(n => {
                const ref = db.collection('notifications').doc();
                batch.set(ref, n);
            });
            await batch.commit();
        }

        res.json({ success: true, count: notifications.length, message: 'Alerts triggered successfully' });
    } catch (error) {
        console.error('Trigger Alerts Error:', error);
        res.status(500).json({ message: 'Failed to trigger alerts' });
    }
});

// 4. Submit Review
router.post('/reviews', async (req, res) => {
    try {
        const { product_id, user_id, user_name, rating, comment } = req.body;
        const newReview = {
            product_id,
            user_id,
            user_name,
            rating: Number(rating),
            comment,
            created_at: new Date().toISOString()
        };
        const docRef = await db.collection('reviews').add(newReview);
        res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

// 5. Get Product Reviews
router.get('/reviews/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const snapshot = await db.collection('reviews')
            .where('product_id', '==', productId)
            .orderBy('created_at', 'desc')
            .get();
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(reviews);
    } catch (error) {
        console.error('Reviews Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving reviews' });
    }
});

// 6. Send Notification
router.post('/notifications', async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        const notification = {
            user_id,
            title,
            message,
            type,
            read: false,
            created_at: new Date().toISOString()
        };
        await db.collection('notifications').add(notification);
        res.json({ success: true });
    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ message: 'Error sending notification' });
    }
});

// 7. Get Notifications
router.get('/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('notifications')
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(notifications);
    } catch (error) {
        console.error('Notifications Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving notifications' });
    }
});

// 8. Mark Notification as Read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('notifications').doc(id).update({ read: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Notification Update Error:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
// 9. Get Reels (Dynamic with Default Fallbacks)
router.get('/reels', async (req, res) => {
    try {
        const snapshot = await db.collection('reels').get();
        let reels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fallback default reels if no custom reels exist in the database
        if (reels.length === 0) {
            reels = [
                {
                    id: 'reel-1',
                    productId: 'prod-1',
                    productName: '5-in-1 Handheld Cleaning Brush',
                    productPrice: 499,
                    productImage: '/uploads/cleaner.png',
                    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f6078e63a1cc0a66d03d36881c15f9b4c09d5a5&profile_id=139&oauth2_token_id=57447761'
                },
                {
                    id: 'reel-2',
                    productId: 'prod-2',
                    productName: 'AGARO Skin Face Scrubber',
                    productPrice: 1299,
                    productImage: '/uploads/scrubber.png',
                    videoUrl: 'https://player.vimeo.com/external/540092552.sd.mp4?s=d76fe602b9e64e5480749e7b233a7f80db7d3f8f&profile_id=139&oauth2_token_id=57447761'
                },
                {
                    id: 'reel-3',
                    productId: 'prod-5',
                    productName: 'AGARO Hair Straightener',
                    productPrice: 699,
                    productImage: '/uploads/straightener.png',
                    videoUrl: 'https://player.vimeo.com/external/510850877.sd.mp4?s=b0016e7880907a9e144a49db21cd9b9f71c4c82b&profile_id=139&oauth2_token_id=57447761'
                }
            ];
        }

        res.json(reels);
    } catch (error) {
        console.error('Reels Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving video reels' });
    }
});

// 10. Add New Custom Reel
router.post('/reels', async (req, res) => {
    try {
        const { productId, productName, productPrice, productImage, videoUrl } = req.body;
        const newReel = {
            productId,
            productName,
            productPrice: Number(productPrice),
            productImage,
            videoUrl,
            created_at: new Date().toISOString()
        };
        const docRef = await db.collection('reels').add(newReel);
        res.status(201).json({ id: docRef.id, ...newReel });
    } catch (error) {
        console.error('Reel Creation Error:', error);
        res.status(500).json({ message: 'Error saving video reel' });
    }
});

// 11. Delete Reel
router.delete('/reels/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('reels').doc(id).delete();
        res.json({ success: true, message: 'Video reel deleted successfully' });
    } catch (error) {
        console.error('Reel Deletion Error:', error);
        res.status(500).json({ message: 'Error deleting video reel' });
    }
});

module.exports = router;

