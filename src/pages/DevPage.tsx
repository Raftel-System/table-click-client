import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DevPage: React.FC = () => {
    const [slug, setSlug] = useState('');
    const [config, setConfig] = useState('');
    const [categories, setCategories] = useState('');
    const [items, setItems] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    const handleImport = async () => {
        if (!slug) {
            setMessage('Slug requis');
            return;
        }

        try {
            // Config
            if (config) {
                const configData = JSON.parse(config);
                await setDoc(
                    doc(db, 'restaurants', slug, 'settings', 'config'),
                    configData
                );
            }

            // Categories
            if (categories) {
                const cats = JSON.parse(categories);
                if (Array.isArray(cats)) {
                    for (const cat of cats) {
                        if (cat.id) {
                            await setDoc(
                                doc(db, 'restaurants', slug, 'menuCategories', String(cat.id)),
                                cat
                            );
                        }
                    }
                }
            }

            // Items
            if (items) {
                const itemsArr = JSON.parse(items);
                if (Array.isArray(itemsArr)) {
                    for (const item of itemsArr) {
                        if (item.id) {
                            await setDoc(
                                doc(db, 'restaurants', slug, 'menuItems', String(item.id)),
                                item
                            );
                        }
                    }
                }
            }

            setMessage('✅ Import terminé');
        } catch (err) {
            setMessage('❌ Erreur: ' + (err as Error).message);
        }
    };



    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
            color: '#f0f0f0',
            backgroundColor: '#1f2937',
            borderRadius: '12px'
        }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#facc15' }}>Dev Import Page</h1>

            {/* Slug */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Restaurant slug
                </label>
                <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #4b5563',
                        backgroundColor: '#111827',
                        color: '#f9fafb'
                    }}
                />
            </div>

            {/* Config */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Config JSON</label>
                <textarea
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    rows={5}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #4b5563',
                        backgroundColor: '#111827',
                        color: '#f9fafb',
                        fontFamily: 'monospace'
                    }}
                />
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categories JSON</label>
                <textarea
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    rows={5}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #4b5563',
                        backgroundColor: '#111827',
                        color: '#f9fafb',
                        fontFamily: 'monospace'
                    }}
                />
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Items JSON</label>
                <textarea
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    rows={5}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #4b5563',
                        backgroundColor: '#111827',
                        color: '#f9fafb',
                        fontFamily: 'monospace'
                    }}
                />
            </div>

            {/* Button */}
            <button
                onClick={handleImport}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#facc15',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde047'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#facc15'}
            >
                📤 Importer
            </button>

            {/* Message */}
            {message && (
                <p style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: message.startsWith('✅') ? '#166534' : '#7f1d1d',
                    color: '#fff',
                    borderRadius: '8px'
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default DevPage;
