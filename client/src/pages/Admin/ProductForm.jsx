import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../config/api';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        original_price: '',
        cost_price: '',
        description: '',
        stock: '',
        image: ''
    });
    const [oldPrice, setOldPrice] = useState(0);
    const [oldStock, setOldStock] = useState(0);
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/products/${id}`);
                    if (!response.ok) throw new Error('Failed to fetch product');
                    const data = await response.json();

                    if (data) {
                        setFormData({
                            name: data.name,
                            category: data.category,
                            price: data.price,
                            original_price: data.original_price || data.price,
                            cost_price: data.cost_price || 0,
                            description: data.description,
                            stock: data.stock || 0,
                            image: data.image || ''
                        });
                        setOldPrice(data.price || 0);
                        setOldStock(data.stock || 0);
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = formData.image || '';

            if (image) {
                const uploadData = new FormData();
                uploadData.append('image', image);
                const uploadRes = await fetch(`${API_URL}/api/products/upload`, {
                    method: 'POST',
                    body: uploadData
                });
                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image file');
                }
                const uploadJson = await uploadRes.json();
                imageUrl = uploadJson.imageUrl;
            }

            const productData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                original_price: parseFloat(formData.original_price) || parseFloat(formData.price),
                cost_price: parseFloat(formData.cost_price),
                description: formData.description,
                stock: parseInt(formData.stock),
                image: imageUrl
            };

            // Profit Protection Logic
            if (productData.price < productData.cost_price) {
                alert(`⚠️ Warning: Selling Price (${productData.price}) is lower than Cost Price (${productData.cost_price}). Please adjust to ensure profit.`);
                return;
            }

            let response;
            if (isEditMode) {
                response = await fetch(`${API_URL}/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            } else {
                response = await fetch(`${API_URL}/api/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Error saving product');
            }

            // Trigger Marketing Alerts if applicable
            if (id) {
                // Price Drop Detection
                if (parseFloat(formData.price) < oldPrice) {
                    fetch(`${API_URL}/api/marketing/trigger-alerts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            product_id: id,
                            alert_type: 'price-drop',
                            productName: formData.name,
                            newValue: formData.price
                        })
                    }).catch(err => console.error('Price Drop Alert Error:', err));
                }

                // Restock Detection
                if (oldStock === 0 && parseInt(formData.stock) > 0) {
                    fetch(`${API_URL}/api/marketing/trigger-alerts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            product_id: id,
                            alert_type: 'restock',
                            productName: formData.name
                        })
                    }).catch(err => console.error('Restock Alert Error:', err));
                }
            }

            alert(id ? 'Product updated! ✅' : 'Product added! ✅');
            navigate('/admin');
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.message}`);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ margin: 0, borderLeft: '4px solid var(--neon-blue)', paddingLeft: '1rem' }}>
                    {isEditMode ? 'Edit Product Configuration' : 'Create New Technical Asset'}
                </h2>
                <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--text-secondary)', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer' }}>
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto 4rem auto', background: '#ffffff' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Product Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Raspberry Pi 5"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                color: 'var(--text-primary)',
                                borderRadius: '12px',
                                outline: 'none',
                                transition: '0.3s'
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <option value="">Select Category</option>
                                <option value="Home Utilities">Home Utilities</option>
                                <option value="Personal Care">Personal Care</option>
                                <option value="Footwear & Fashion">Footwear & Fashion</option>
                                <option value="Grocery & Essentials">Grocery & Essentials</option>
                                <option value="Toys, Sports & Fitness">Toys, Sports & Fitness</option>
                                <option value="Home & Furniture">Home & Furniture</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="original_price" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Original Price (Strike-through)</label>
                            <input
                                id="original_price"
                                type="number"
                                name="original_price"
                                required
                                value={formData.original_price}
                                onChange={handleChange}
                                placeholder="e.g. 1200"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label htmlFor="cost_price" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cost Price (Investment)</label>
                            <input
                                id="cost_price"
                                type="number"
                                name="cost_price"
                                required
                                value={formData.cost_price}
                                onChange={handleChange}
                                placeholder="e.g. 800"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div>
                            <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Selling Price (Admin Price)</label>
                            <input
                                id="price"
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 999"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="stock" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Stock Quantity</label>
                        <input
                            id="stock"
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                color: 'var(--text-primary)',
                                borderRadius: '12px',
                                outline: 'none',
                                transition: '0.3s'
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                color: 'var(--text-primary)',
                                borderRadius: '12px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                resize: 'vertical',
                                transition: '0.3s'
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#9333ea'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.12)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Product Image</label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ color: 'var(--text-secondary)' }}
                        />
                    </div>

                    <button className="btn-primary" type="submit" style={{ width: '100%', padding: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>
                        {isEditMode ? 'Apply Changes' : 'Publish Asset'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
