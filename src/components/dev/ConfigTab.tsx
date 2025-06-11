// src/components/dev/ConfigTab.tsx
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ConfigTabProps {
    onMessage: (message: string) => void;
}

const ConfigTab: React.FC<ConfigTabProps> = ({ onMessage }) => {
    const [slug, setSlug] = useState('');
    const [config, setConfig] = useState('');

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #4b5563',
        backgroundColor: '#111827',
        color: '#f9fafb'
    };

    const textareaStyle = {
        ...inputStyle,
        fontFamily: 'monospace',
        resize: 'vertical' as const
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#facc15',
        color: '#1f2937',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    };

    const handleImportConfig = async () => {
        if (!slug) {
            onMessage('❌ Slug requis');
            return;
        }

        try {
            if (config) {
                const configData = JSON.parse(config);
                await setDoc(
                    doc(db, 'restaurants', slug, 'settings', 'config'),
                    configData
                );
            }

            onMessage('✅ Configuration importée avec succès');
        } catch (err) {
            onMessage('❌ Erreur config: ' + (err as Error).message);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                Configuration Restaurant
            </h2>

            {/* Slug */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Restaurant slug *
                </label>
                <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={inputStyle}
                    placeholder="ex: talya-bercy"
                />
            </div>

            {/* Config JSON */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Config JSON *
                </label>
                <textarea
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    rows={8}
                    style={textareaStyle}
                    placeholder={`{
  "nom": "Restaurant Name",
  "adresse": "123 Rue Example",
  "devise": "€",
  "theme": "sunrise",
  "telephone": "+33123456789",
  "horaires": {
    "lundi": "9h00-22h00",
    "mardi": "9h00-22h00"
  }
}`}
                />
            </div>

            {/* Exemples */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>💡 Exemple de configuration</h3>
                <pre style={{
                    fontSize: '0.8rem',
                    color: '#d1d5db',
                    overflow: 'auto',
                    backgroundColor: '#4b5563',
                    padding: '1rem',
                    borderRadius: '6px'
                }}>
{`{
  "nom": "Café O2 Ice",
  "adresse": "123 Boulevard de Bercy, Paris",
  "devise": "€",
  "theme": "sunrise",
  "telephone": "+33 1 23 45 67 89",
  "email": "contact@cafeo2ice.fr",
  "horaires": {
    "lundi": "9h00-22h00",
    "mardi": "9h00-22h00",
    "mercredi": "9h00-22h00",
    "jeudi": "9h00-22h00",
    "vendredi": "9h00-23h00",
    "samedi": "10h00-23h00",
    "dimanche": "10h00-21h00"
  },
  "services": ["sur-place", "emporter"],
  "acceptePaiement": ["especes", "carte", "cheque"]
}`}
                </pre>
            </div>

            {/* Validation et import */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                    onClick={handleImportConfig}
                    disabled={!slug || !config}
                    style={{
                        ...buttonStyle,
                        opacity: (!slug || !config) ? 0.5 : 1,
                        cursor: (!slug || !config) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => {
                        if (slug && config) {
                            e.currentTarget.style.backgroundColor = '#fde047';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (slug && config) {
                            e.currentTarget.style.backgroundColor = '#facc15';
                        }
                    }}
                >
                    📤 Importer Configuration
                </button>

                {/* Indicateurs de validation */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ color: slug ? '#10b981' : '#ef4444' }}>
                        {slug ? '✅' : '❌'} Slug
                    </span>
                    <span style={{ color: config ? '#10b981' : '#ef4444' }}>
                        {config ? '✅' : '❌'} Config
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ConfigTab;