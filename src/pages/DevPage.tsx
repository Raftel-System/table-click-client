import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types pour les thèmes
interface ThemeColors {
    primary: {
        from: string;
        to: string;
    };
    accent: {
        from: string;
        to: string;
    };
    background: {
        gradient: {
            from: string;
            via: string;
            to: string;
        };
        base: string;
    };
    foreground: string;
    textSecondary: string;
    alert: string;
    success: string;
}

interface Theme {
    id: string;
    nom: string;
    description: string;
    colors: ThemeColors;
    gradients: {
        action: string;
        background: string;
    };
    createdAt: string;
    isDefault: boolean;
}

const DevPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'config' | 'themes'>('config');

    // Config Restaurant
    const [slug, setSlug] = useState('');
    const [config, setConfig] = useState('');
    const [categories, setCategories] = useState('');
    const [items, setItems] = useState('');

    // Themes
    const [themeId, setThemeId] = useState('');
    const [themeName, setThemeName] = useState('');
    const [themeDescription, setThemeDescription] = useState('');
    const [isDefaultTheme, setIsDefaultTheme] = useState(false);

    // Colors
    const [primaryFrom, setPrimaryFrom] = useState('#f59e0b');
    const [primaryTo, setPrimaryTo] = useState('#eab308');
    const [accentFrom, setAccentFrom] = useState('#06b6d4');
    const [accentTo, setAccentTo] = useState('#0891b2');
    const [backgroundFrom, setBackgroundFrom] = useState('#0f172a');
    const [backgroundVia, setBackgroundVia] = useState('#111827');
    const [backgroundTo, setBackgroundTo] = useState('#000000');
    const [backgroundBase, setBackgroundBase] = useState('#000000');
    const [foreground, setForeground] = useState('#fefefe');
    const [textSecondary, setTextSecondary] = useState('#9ca3af');
    const [alert, setAlert] = useState('#ef4444');
    const [success, setSuccess] = useState('#16a34a');

    const [message, setMessage] = useState<string | null>(null);

    const handleImportConfig = async () => {
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

            setMessage('✅ Import config terminé');
        } catch (err) {
            setMessage('❌ Erreur config: ' + (err as Error).message);
        }
    };

    const handleCreateTheme = async () => {
        if (!themeId || !themeName) {
            setMessage('ID et nom du thème requis');
            return;
        }

        try {
            const theme: Theme = {
                id: themeId,
                nom: themeName,
                description: themeDescription,
                colors: {
                    primary: {
                        from: primaryFrom,
                        to: primaryTo
                    },
                    accent: {
                        from: accentFrom,
                        to: accentTo
                    },
                    background: {
                        gradient: {
                            from: backgroundFrom,
                            via: backgroundVia,
                            to: backgroundTo
                        },
                        base: backgroundBase
                    },
                    foreground,
                    textSecondary,
                    alert,
                    success
                },
                gradients: {
                    action: `bg-gradient-to-r from-[${primaryFrom}] to-[${primaryTo}]`,
                    background: `bg-gradient-to-br from-[${backgroundFrom}] via-[${backgroundVia}] to-[${backgroundTo}]`
                },
                createdAt: new Date().toISOString(),
                isDefault: isDefaultTheme
            };

            // Sauvegarder dans app/settings/themes/{themeId}
            await setDoc(
                doc(db, 'app', 'settings', 'themes', themeId),
                theme
            );

            setMessage('✅ Thème créé avec succès');

            // Reset form
            setThemeId('');
            setThemeName('');
            setThemeDescription('');
            setIsDefaultTheme(false);
        } catch (err) {
            setMessage('❌ Erreur thème: ' + (err as Error).message);
        }
    };

    const loadPresetTheme = (preset: 'sunrise' | 'ocean' | 'forest') => {
        switch (preset) {
            case 'sunrise':
                setThemeId('sunrise');
                setThemeName('Sunrise – Jaune & Cyan');
                setThemeDescription('Thème chaleureux basé sur un dégradé jaune-orange avec accents cyan');
                setPrimaryFrom('#f59e0b');
                setPrimaryTo('#eab308');
                setAccentFrom('#06b6d4');
                setAccentTo('#0891b2');
                setBackgroundFrom('#0f172a');
                setBackgroundVia('#111827');
                setBackgroundTo('#000000');
                setIsDefaultTheme(true);
                break;
            case 'ocean':
                setThemeId('ocean');
                setThemeName('Ocean – Bleu & Turquoise');
                setThemeDescription('Thème océanique avec des tons bleus apaisants');
                setPrimaryFrom('#0ea5e9');
                setPrimaryTo('#0284c7');
                setAccentFrom('#06b6d4');
                setAccentTo('#0891b2');
                setBackgroundFrom('#0c1220');
                setBackgroundVia('#1e293b');
                setBackgroundTo('#020617');
                setIsDefaultTheme(false);
                break;
            case 'forest':
                setThemeId('forest');
                setThemeName('Forest – Vert & Emeraude');
                setThemeDescription('Thème naturel avec des verts profonds');
                setPrimaryFrom('#10b981');
                setPrimaryTo('#059669');
                setAccentFrom('#14b8a6');
                setAccentTo('#0d9488');
                setBackgroundFrom('#0f1419');
                setBackgroundVia('#1f2937');
                setBackgroundTo('#111827');
                setIsDefaultTheme(false);
                break;
        }
    };

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

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4b5563',
        color: '#f9fafb'
    };

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1000px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
            color: '#f0f0f0',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            minHeight: '100vh'
        }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#facc15' }}>
                Dev Panel - Configuration
            </h1>

            {/* Tabs */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #4b5563' }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        onClick={() => setActiveTab('config')}
                        style={{
                            padding: '1rem 1.5rem',
                            backgroundColor: activeTab === 'config' ? '#facc15' : 'transparent',
                            color: activeTab === 'config' ? '#1f2937' : '#f9fafb',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🏪 Config Restaurant
                    </button>
                    <button
                        onClick={() => setActiveTab('themes')}
                        style={{
                            padding: '1rem 1.5rem',
                            backgroundColor: activeTab === 'themes' ? '#facc15' : 'transparent',
                            color: activeTab === 'themes' ? '#1f2937' : '#f9fafb',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🎨 Config Thèmes
                    </button>
                </div>
            </div>

            {/* Config Restaurant Tab */}
            {activeTab === 'config' && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                        Configuration Restaurant
                    </h2>

                    {/* Slug */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Restaurant slug
                        </label>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={inputStyle}
                            placeholder="ex: talya-bercy"
                        />
                    </div>

                    {/* Config */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Config JSON</label>
                        <textarea
                            value={config}
                            onChange={(e) => setConfig(e.target.value)}
                            rows={5}
                            style={textareaStyle}
                            placeholder='{"nom": "Restaurant Name", "adresse": "...", ...}'
                        />
                    </div>

                    {/* Categories */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categories JSON</label>
                        <textarea
                            value={categories}
                            onChange={(e) => setCategories(e.target.value)}
                            rows={5}
                            style={textareaStyle}
                            placeholder='[{"id": "breakfast", "nom": "Petit Déjeuner", ...}, ...]'
                        />
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Items JSON</label>
                        <textarea
                            value={items}
                            onChange={(e) => setItems(e.target.value)}
                            rows={5}
                            style={textareaStyle}
                            placeholder='[{"id": "1", "nom": "Article", "prix": 50, ...}, ...]'
                        />
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleImportConfig}
                        style={buttonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde047'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#facc15'}
                    >
                        📤 Importer Config Restaurant
                    </button>
                </div>
            )}

            {/* Themes Tab */}
            {activeTab === 'themes' && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                        Gestion des Thèmes
                    </h2>

                    {/* Presets */}
                    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Thèmes Prédéfinis</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => loadPresetTheme('sunrise')}
                                style={secondaryButtonStyle}
                            >
                                🌅 Sunrise (Actuel)
                            </button>
                            <button
                                onClick={() => loadPresetTheme('ocean')}
                                style={secondaryButtonStyle}
                            >
                                🌊 Ocean
                            </button>
                            <button
                                onClick={() => loadPresetTheme('forest')}
                                style={secondaryButtonStyle}
                            >
                                🌲 Forest
                            </button>
                        </div>
                    </div>

                    {/* Theme Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID du thème *</label>
                            <input
                                value={themeId}
                                onChange={(e) => setThemeId(e.target.value)}
                                style={inputStyle}
                                placeholder="ex: sunrise, ocean, custom-theme"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom du thème *</label>
                            <input
                                value={themeName}
                                onChange={(e) => setThemeName(e.target.value)}
                                style={inputStyle}
                                placeholder="ex: Sunrise – Jaune & Cyan"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            value={themeDescription}
                            onChange={(e) => setThemeDescription(e.target.value)}
                            rows={2}
                            style={inputStyle}
                            placeholder="Description du thème..."
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                checked={isDefaultTheme}
                                onChange={(e) => setIsDefaultTheme(e.target.checked)}
                            />
                            Thème par défaut
                        </label>
                    </div>

                    {/* Colors Grid */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Couleurs Principales</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Primary From</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={primaryFrom}
                                        onChange={(e) => setPrimaryFrom(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={primaryFrom}
                                        onChange={(e) => setPrimaryFrom(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Primary To</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={primaryTo}
                                        onChange={(e) => setPrimaryTo(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={primaryTo}
                                        onChange={(e) => setPrimaryTo(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Accent From</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={accentFrom}
                                        onChange={(e) => setAccentFrom(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={accentFrom}
                                        onChange={(e) => setAccentFrom(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Accent To</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={accentTo}
                                        onChange={(e) => setAccentTo(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={accentTo}
                                        onChange={(e) => setAccentTo(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Colors */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Couleurs d'Arrière-plan</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background From</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={backgroundFrom}
                                        onChange={(e) => setBackgroundFrom(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={backgroundFrom}
                                        onChange={(e) => setBackgroundFrom(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Via</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={backgroundVia}
                                        onChange={(e) => setBackgroundVia(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={backgroundVia}
                                        onChange={(e) => setBackgroundVia(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background To</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={backgroundTo}
                                        onChange={(e) => setBackgroundTo(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={backgroundTo}
                                        onChange={(e) => setBackgroundTo(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Base</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={backgroundBase}
                                        onChange={(e) => setBackgroundBase(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={backgroundBase}
                                        onChange={(e) => setBackgroundBase(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text & Status Colors */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Couleurs de Texte & Status</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Foreground</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={foreground}
                                        onChange={(e) => setForeground(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={foreground}
                                        onChange={(e) => setForeground(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Text Secondary</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={textSecondary}
                                        onChange={(e) => setTextSecondary(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={textSecondary}
                                        onChange={(e) => setTextSecondary(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Alert</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={alert}
                                        onChange={(e) => setAlert(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={alert}
                                        onChange={(e) => setAlert(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Success</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={success}
                                        onChange={(e) => setSuccess(e.target.value)}
                                        style={{ width: '50px', height: '40px' }}
                                    />
                                    <input
                                        value={success}
                                        onChange={(e) => setSuccess(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Aperçu</h3>
                        <div style={{
                            background: `linear-gradient(135deg, ${backgroundFrom}, ${backgroundVia}, ${backgroundTo})`,
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #4b5563'
                        }}>
                            <div style={{
                                background: `linear-gradient(to right, ${primaryFrom}, ${primaryTo})`,
                                color: '#000',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                display: 'inline-block'
                            }}>
                                Bouton Principal
                            </div>
                            <div style={{
                                background: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
                                color: '#000',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                display: 'inline-block',
                                marginLeft: '1rem'
                            }}>
                                Accent
                            </div>
                            <p style={{ color: foreground, marginBottom: '0.5rem' }}>
                                Texte principal avec couleur foreground
                            </p>
                            <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
                                Texte secondaire plus discret
                            </p>
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleCreateTheme}
                        style={buttonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde047'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#facc15'}
                    >
                        🎨 Créer le Thème
                    </button>
                </div>
            )}

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