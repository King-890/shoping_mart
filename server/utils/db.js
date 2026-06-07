const { loadData, writeData } = require('./storage');

class MockDocSnapshot {
    constructor(id, data) {
        this.id = id;
        this._data = data;
        this.exists = data !== undefined && data !== null;
    }
    data() {
        return this._data;
    }
}

class MockQuerySnapshot {
    constructor(docs) {
        this.docs = docs;
        this.empty = docs.length === 0;
    }
}

class MockDocRef {
    constructor(collectionName, id) {
        this.collectionName = collectionName;
        this.id = id;
    }

    async get() {
        const data = loadData();
        const collection = data[this.collectionName] || [];
        let docData;
        if (this.collectionName === 'settings' && this.id === '1') {
            docData = Array.isArray(collection) ? collection.find(d => (d.id || d._id) === this.id) : collection;
            if (!docData && !Array.isArray(collection)) {
                docData = collection;
            }
        } else {
            docData = collection.find(d => (d.id || d._id) === this.id);
        }
        return new MockDocSnapshot(this.id, docData);
    }

    async set(newData, options = {}) {
        const data = loadData();
        if (!data[this.collectionName]) {
            data[this.collectionName] = [];
        }
        
        if (this.collectionName === 'settings' && this.id === '1') {
            if (options.merge) {
                data.settings = { ...data.settings, ...newData };
            } else {
                data.settings = newData;
            }
        } else {
            const index = data[this.collectionName].findIndex(d => (d.id || d._id) === this.id);
            const current = index >= 0 ? data[this.collectionName][index] : {};
            const merged = options.merge ? { ...current, ...newData } : newData;
            merged.id = this.id;
            if (index >= 0) {
                data[this.collectionName][index] = merged;
            } else {
                data[this.collectionName].push(merged);
            }
        }
        writeData(data);
    }

    async update(newData) {
        const data = loadData();
        const collection = data[this.collectionName] || [];
        const index = collection.findIndex(d => (d.id || d._id) === this.id);
        if (index >= 0) {
            collection[index] = { ...collection[index], ...newData };
            data[this.collectionName] = collection;
            writeData(data);
        } else {
            throw new Error(`Document with ID ${this.id} not found in collection ${this.collectionName}`);
        }
    }

    async delete() {
        const data = loadData();
        const collection = data[this.collectionName] || [];
        data[this.collectionName] = collection.filter(d => (d.id || d._id) !== this.id);
        writeData(data);
    }
}

class MockCollectionRef {
    constructor(collectionName, queries = []) {
        this.collectionName = collectionName;
        this.queries = queries;
    }

    doc(id) {
        const docId = id || Math.random().toString(36).substring(2, 15);
        return new MockDocRef(this.collectionName, docId);
    }

    where(field, op, val) {
        return new MockCollectionRef(this.collectionName, [
            ...this.queries,
            { type: 'where', field, op, val }
        ]);
    }

    orderBy(field, direction = 'asc') {
        return new MockCollectionRef(this.collectionName, [
            ...this.queries,
            { type: 'orderBy', field, direction }
        ]);
    }

    async add(docData) {
        const id = Math.random().toString(36).substring(2, 15);
        const data = loadData();
        if (!data[this.collectionName]) {
            data[this.collectionName] = [];
        }
        const record = { id, ...docData };
        data[this.collectionName].push(record);
        writeData(data);
        return new MockDocRef(this.collectionName, id);
    }

    async get() {
        const data = loadData();
        let items = data[this.collectionName] || [];
        
        if (this.collectionName === 'settings' && !Array.isArray(items)) {
            items = [ { id: '1', ...items } ];
        }

        // Apply queries
        for (const q of this.queries) {
            if (q.type === 'where') {
                const getFieldValue = (item, fieldName) => {
                    if (fieldName === '__name__') return item.id || item._id;
                    if (fieldName === 'id') return item.id || item._id;
                    return item[fieldName];
                };

                if (q.op === '==') {
                    items = items.filter(item => getFieldValue(item, q.field) === q.val);
                } else if (q.op === 'in') {
                    const list = Array.isArray(q.val) ? q.val : [q.val];
                    items = items.filter(item => list.includes(getFieldValue(item, q.field)));
                } else {
                    items = items.filter(item => getFieldValue(item, q.field) === q.val);
                }
            } else if (q.type === 'orderBy') {
                items = [...items].sort((a, b) => {
                    const valA = a[q.field];
                    const valB = b[q.field];
                    if (valA === undefined) return 1;
                    if (valB === undefined) return -1;
                    if (q.direction === 'desc') {
                        return valA < valB ? 1 : valA > valB ? -1 : 0;
                    } else {
                        return valA > valB ? 1 : valA < valB ? -1 : 0;
                    }
                });
            }
        }

        const docs = items.map(item => new MockDocSnapshot(item.id || item._id, item));
        return new MockQuerySnapshot(docs);
    }
}

class MockBatch {
    constructor() {
        this.operations = [];
    }
    set(docRef, data) {
        this.operations.push({ docRef, data });
    }
    async commit() {
        for (const op of this.operations) {
            await op.docRef.set(op.data);
        }
    }
}

class LocalDB {
    collection(name) {
        return new MockCollectionRef(name);
    }
    batch() {
        return new MockBatch();
    }
}

const db = new LocalDB();

module.exports = db;
