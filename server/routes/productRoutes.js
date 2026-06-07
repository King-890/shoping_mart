const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST Upload Image file
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl: filePath });
    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ success: false, message: 'Error uploading file' });
    }
});

// POST Upload Media (Images, Videos, etc.)
router.post('/upload-media', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ success: true, fileUrl: filePath });
    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ success: false, message: 'Error uploading media file' });
    }
});

// GET All Products
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('products')
            .orderBy('created_at', 'desc')
            .get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(products);
    } catch (error) {
        console.error('Products Fetch Error:', error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
});

// POST Create Product
router.post('/', async (req, res) => {
    try {
        const { name, category, price, description, image, original_price, cost_price, stock } = req.body;

        const sellPrice = Number(price);
        const cost = Number(cost_price || 0);

        if (sellPrice <= cost) {
            return res.status(400).json({
                success: false,
                message: `Profit Protection: Selling price (₹${sellPrice}) must be greater than cost price (₹${cost}).`
            });
        }

        const newProduct = {
            name,
            category,
            price: sellPrice,
            original_price: Number(original_price || price),
            cost_price: cost,
            description,
            image,
            stock: Number(stock || 0),
            rating: 4.5,
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('products').add(newProduct);
        const savedProduct = { id: docRef.id, ...newProduct };

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Product Creation Error:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// PUT Update Product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, description, image, original_price, cost_price, stock } = req.body;

        const sellPrice = Number(price);
        const cost = Number(cost_price);

        if (sellPrice <= cost) {
            return res.status(400).json({
                success: false,
                message: `Profit Protection: Selling price (₹${sellPrice}) must be greater than cost price (₹${cost}).`
            });
        }

        const updatedProduct = {
            name,
            category,
            price: sellPrice,
            original_price: Number(original_price),
            cost_price: cost,
            description,
            image,
            stock: Number(stock)
        };

        await db.collection('products').doc(id).update(updatedProduct);

        res.json({ id, ...updatedProduct });
    } catch (error) {
        console.error('Product Update Error:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// DELETE Product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.collection('products').doc(id).delete();

        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Product Deletion Error:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;
