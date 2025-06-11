import React, { useState } from 'react';
import ConfigTab from '../components/dev/ConfigTab';
import ThemesTab from '../components/dev/ThemesTab';
import MenuTab from '../components/dev/MenuTab';

const DevPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'config' | 'themes' | 'menu'>('config');
    const [message, setMessage] = useState<string | null>(null);

    const tabStyle = (isActive: boolean) => ({
        padding: '1rem 1.5rem',
        backgroundColor: isActive ? '#facc15' : 'transparent',
        color: isActive ? '#1f2937' : '#f9fafb',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontWeight: 'bold'
    });

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
            color: '#f0f0f0',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            minHeight: '100vh'
        }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#facc15' }}>
                Dev Panel - Configuration Restaurant
            </h1>

            {/* Tabs principaux */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #4b5563' }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        onClick={() => setActiveTab('config')}
                        style={tabStyle(activeTab === 'config')}
                    >
                        🏪 Config Restaurant
                    </button>
                    <button
                        onClick={() => setActiveTab('themes')}
                        style={tabStyle(activeTab === 'themes')}
                    >
                        🎨 Thèmes
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        style={tabStyle(activeTab === 'menu')}
                    >
                        🍽️ Gestion Menu
                    </button>
                </div>
            </div>

            {/* Contenu des tabs */}
            {activeTab === 'config' && (
                <ConfigTab onMessage={setMessage} />
            )}

            {activeTab === 'themes' && (
                <ThemesTab onMessage={setMessage} />
            )}

            {activeTab === 'menu' && (
                <MenuTab onMessage={setMessage} />
            )}

            {/* Message global */}
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