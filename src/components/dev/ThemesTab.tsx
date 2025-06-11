// src/components/dev/ThemesTab.tsx
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Theme {
    id: string;
    nom: string;
    description: string;
    colors: {
        primary: { from: string; to: string; };
        accent: { from: string; to: string; };
        background: {
            gradient: { from: string; via: string; to: string; };
            base: string;
        };
        foreground: string;
        textSecondary: string;
        alert: string;
        success: string;
    };
    gradients: {
        action: string;
        background: string;
    };
    createdAt: string;
    isDefault: boolean;
}

interface ThemesTabProps {
    onMessage: (message: string) => void;
}

const ThemesTab: React.FC<ThemesTabProps> = ({ onMessage }) => {
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

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #4b5563',
        backgroundColor: '#111827',
        color: '#f9fafb'
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

    const handleCreateTheme = async () => {
        if (!themeId || !themeName) {
            onMessage('❌ ID et nom du thème requis');
            return;
        }

        try {
            const theme: Theme = {
                id: themeId,
                nom: themeName,
                description: themeDescription,
                colors: {
                    primary: { from: primaryFrom, to: primaryTo },
                    accent: { from: accentFrom, to: accentTo },
                    background: {
                        gradient: { from: backgroundFrom, via: backgroundVia, to: backgroundTo },
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

            await setDoc(doc(db, 'app', 'settings', 'themes', themeId), theme);
            onMessage('✅ Thème créé avec succès');

            // Reset form
            setThemeId('');
            setThemeName('');
            setThemeDescription('');
            setIsDefaultTheme(false);
        } catch (err) {
            onMessage('❌ Erreur thème: ' + (err as Error).message);
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

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                Gestion des Thèmes
            </h2>

            {/* Presets */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Thèmes Prédéfinis</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => loadPresetTheme('sunrise')} style={secondaryButtonStyle}>
                        🌅 Sunrise
                    </button>
                    <button onClick={() => loadPresetTheme('ocean')} style={secondaryButtonStyle}>
                        🌊 Ocean
                    </button>
                    <button onClick={() => loadPresetTheme('forest')} style={secondaryButtonStyle}>
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

            {/* Colors Grid - Simplifié */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Couleurs Principales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Primary From', value: primaryFrom, setter: setPrimaryFrom },
                        { label: 'Primary To', value: primaryTo, setter: setPrimaryTo },
                        { label: 'Accent From', value: accentFrom, setter: setAccentFrom },
                        { label: 'Accent To', value: accentTo, setter: setAccentTo }
                    ].map(color => (
                        <div key={color.label}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{color.label}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="color"
                                    value={color.value}
                                    onChange={(e) => color.setter(e.target.value)}
                                    style={{ width: '50px', height: '40px' }}
                                />
                                <input
                                    value={color.value}
                                    onChange={(e) => color.setter(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            </div>
                        </div>
                    ))}
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
                disabled={!themeId || !themeName}
                style={{
                    ...buttonStyle,
                    opacity: (!themeId || !themeName) ? 0.5 : 1,
                    cursor: (!themeId || !themeName) ? 'not-allowed' : 'pointer'
                }}
            >
                🎨 Créer le Thème
            </button>
        </div>
    );
};

export default ThemesTab;