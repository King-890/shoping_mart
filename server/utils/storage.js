const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
    products: [
        { _id: '1', name: 'Arduino Uno R3', category: 'Microcontrollers', price: 24.99, description: 'The standard for makers.', image: '' },
        { _id: '2', name: 'Raspberry Pi 4', category: 'Microcontrollers', price: 45.00, description: 'Desktop PC performance.', image: '' }
    ],
    settings: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com'
    },
    orders: [],
    messages: [],
    users: []
};

const loadData = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            writeData(defaultData);
            return defaultData;
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(data);
        // Robust Schema Validation (Migrations)
        const db = { ...defaultData, ...parsed };
        if (!Array.isArray(db.users)) db.users = [];
        if (!Array.isArray(db.orders)) db.orders = [];
        if (!Array.isArray(db.messages)) db.messages = [];
        if (!Array.isArray(db.products)) db.products = defaultData.products;

        return db;
    } catch (error) {
        console.error('Error loading DB:', error);
        return defaultData;
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing DB:', error);
    }
};

module.exports = { loadData, writeData };
