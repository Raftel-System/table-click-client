// src/pages/DevPage.tsx - Version complète avec gestion du menu
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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

// Types pour le menu
interface MenuCategory {
    id: string;
    nom: string;
    ordre: number;
    active: boolean;
    emoji?: string;
}

interface MenuItem {
    id: string;
    nom: string;
    categorieId: string;
    prix: number;
    description: string;
    imageUrl?: string;
    disponible: boolean;
    ordre: number;
    isPopular?: boolean;
    isSpecial?: boolean;
}

const DevPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'config' | 'themes' | 'menu'>('config');

    // Config Restaurant
    const [slug, setSlug] = useState('');
    const [config, setConfig] = useState('');
    const [categories, setCategories] = useState('');
    const [items, setItems] = useState('');

    // Gestion Menu
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Nouvelle catégorie
    const [newCategoryId, setNewCategoryId] = useState('');
    const [newCategoryNom, setNewCategoryNom] = useState('');
    const [newCategoryOrdre, setNewCategoryOrdre] = useState(1);
    const [newCategoryEmoji, setNewCategoryEmoji] = useState('🍽️');

    // Nouvel item
    const [newItemId, setNewItemId] = useState('');
    const [newItemNom, setNewItemNom] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemPrix, setNewItemPrix] = useState(0);
    const [newItemCategorieId, setNewItemCategorieId] = useState('');
    const [newItemOrdre, setNewItemOrdre] = useState(1);
    const [newItemImageUrl, setNewItemImageUrl] = useState('');
    const [newItemIsPopular, setNewItemIsPopular] = useState(false);
    const [newItemIsSpecial, setNewItemIsSpecial] = useState(false);

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

    // Charger les données du menu existant
    useEffect(() => {
        if (slug && activeTab === 'menu') {
            loadMenuData();
        }
    }, [slug, activeTab]);

    const loadMenuData = async () => {
        if (!slug) return;

        try {
            // Charger les catégories
            const categoriesSnapshot = await getDocs(collection(db, 'restaurants', slug, 'menuCategories'));
            const cats: MenuCategory[] = [];
            categoriesSnapshot.forEach(doc => {
                cats.push({ id: doc.id, ...doc.data() } as MenuCategory);
            });
            setMenuCategories(cats.sort((a, b) => a.ordre - b.ordre));

            // Charger les items
            const itemsSnapshot = await getDocs(collection(db, 'restaurants', slug, 'menuItems'));
            const its: MenuItem[] = [];
            itemsSnapshot.forEach(doc => {
                its.push({ id: doc.id, ...doc.data() } as MenuItem);
            });
            setMenuItems(its.sort((a, b) => a.ordre - b.ordre));

            setMessage('✅ Données du menu chargées');
        } catch (err) {
            setMessage('❌ Erreur lors du chargement: ' + (err as Error).message);
        }
    };

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
            if (activeTab === 'menu') {
                loadMenuData();
            }
        } catch (err) {
            setMessage('❌ Erreur config: ' + (err as Error).message);
        }
    };

    const handleCreateCategory = async () => {
        if (!slug || !newCategoryId || !newCategoryNom) {
            setMessage('Slug, ID et nom de catégorie requis');
            return;
        }

        try {
            const newCategory: MenuCategory = {
                id: newCategoryId,
                nom: newCategoryNom,
                ordre: newCategoryOrdre,
                active: true,
                emoji: newCategoryEmoji
            };

            await setDoc(
                doc(db, 'restaurants', slug, 'menuCategories', newCategoryId),
                newCategory
            );

            setMessage('✅ Catégorie créée');

            // Reset form
            setNewCategoryId('');
            setNewCategoryNom('');
            setNewCategoryOrdre(menuCategories.length + 1);
            setNewCategoryEmoji('🍽️');

            loadMenuData();
        } catch (err) {
            setMessage('❌ Erreur catégorie: ' + (err as Error).message);
        }
    };

    const handleCreateItem = async () => {
        if (!slug || !newItemId || !newItemNom || !newItemCategorieId) {
            setMessage('Slug, ID, nom et catégorie requis');
            return;
        }

        try {
            const newItem: MenuItem = {
                id: newItemId,
                nom: newItemNom,
                categorieId: newItemCategorieId,
                prix: newItemPrix,
                description: newItemDescription,
                imageUrl: newItemImageUrl || undefined,
                disponible: true,
                ordre: newItemOrdre,
                isPopular: newItemIsPopular,
                isSpecial: newItemIsSpecial
            };

            await setDoc(
                doc(db, 'restaurants', slug, 'menuItems', newItemId),
                newItem
            );

            setMessage('✅ Article créé');

            // Reset form
            setNewItemId('');
            setNewItemNom('');
            setNewItemDescription('');
            setNewItemPrix(0);
            setNewItemOrdre(menuItems.length + 1);
            setNewItemImageUrl('');
            setNewItemIsPopular(false);
            setNewItemIsSpecial(false);

            loadMenuData();
        } catch (err) {
            setMessage('❌ Erreur article: ' + (err as Error).message);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!slug || !confirm(`Supprimer la catégorie "${categoryId}" ?`)) return;

        try {
            await deleteDoc(doc(db, 'restaurants', slug, 'menuCategories', categoryId));
            setMessage('✅ Catégorie supprimée');
            loadMenuData();
        } catch (err) {
            setMessage('❌ Erreur suppression: ' + (err as Error).message);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!slug || !confirm(`Supprimer l'article "${itemId}" ?`)) return;

        try {
            await deleteDoc(doc(db, 'restaurants', slug, 'menuItems', itemId));
            setMessage('✅ Article supprimé');
            loadMenuData();
        } catch (err) {
            setMessage('❌ Erreur suppression: ' + (err as Error).message);
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

    const generateMenuPreset = () => {
        const categoriesPreset = [
            { id: 'breakfast', nom: 'Petit Déjeuner', ordre: 1, active: true, emoji: '🌅' },
            { id: 'starters', nom: 'Entrées', ordre: 2, active: true, emoji: '🥗' },
            { id: 'mains', nom: 'Plats Principaux', ordre: 3, active: true, emoji: '🍽️' },
            { id: 'desserts', nom: 'Desserts', ordre: 4, active: true, emoji: '🍰' },
            { id: 'drinks', nom: 'Boissons', ordre: 5, active: true, emoji: '🥤' }
        ];

        const itemsPreset = [
            {
                id: '1',
                nom: 'Petit Déjeuner Complet',
                categorieId: 'breakfast',
                prix: 12.50,
                description: 'Café, jus d\'orange, croissant, confiture et beurre',
                disponible: true,
                ordre: 1,
                isPopular: true
            },
            {
                id: '2',
                nom: 'Salade Caesar',
                categorieId: 'starters',
                prix: 8.90,
                description: 'Salade fraîche, croûtons, parmesan, sauce caesar',
                disponible: true,
                ordre: 1
            },
            {
                id: '3',
                nom: 'Burger Classique',
                categorieId: 'mains',
                prix: 14.90,
                description: 'Steak de bœuf, salade, tomate, oignon, frites',
                disponible: true,
                ordre: 1,
                isSpecial: true
            }
        ];

        setCategories(JSON.stringify(categoriesPreset, null, 2));
        setItems(JSON.stringify(itemsPreset, null, 2));
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

    const filteredItems = selectedCategory
        ? menuItems.filter(item => item.categorieId === selectedCategory)
        : menuItems;

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1200px',
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
                    <button
                        onClick={() => setActiveTab('menu')}
                        style={{
                            padding: '1rem 1.5rem',
                            backgroundColor: activeTab === 'menu' ? '#facc15' : 'transparent',
                            color: activeTab === 'menu' ? '#1f2937' : '#f9fafb',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🍽️ Gestion Menu
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

                    {/* Bouton preset menu */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Menu Prédéfini</h3>
                        <button
                            onClick={generateMenuPreset}
                            style={secondaryButtonStyle}
                        >
                            📋 Générer un menu exemple
                        </button>
                    </div>

                    {/* Config */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Config JSON</label>
                        <textarea
                            value={config}
                            onChange={(e) => setConfig(e.target.value)}
                            rows={5}
                            style={textareaStyle}
                            placeholder='{"nom": "Restaurant Name", "adresse": "...", "devise": "€", "theme": "sunrise", ...}'
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
                            placeholder='[{"id": "breakfast", "nom": "Petit Déjeuner", "ordre": 1, "active": true, "emoji": "🌅"}, ...]'
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
                            placeholder='[{"id": "1", "nom": "Article", "prix": 50, "categorieId": "breakfast", "description": "...", "disponible": true, "ordre": 1}, ...]'
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

            {/* Gestion Menu Tab */}
            {activeTab === 'menu' && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                        Gestion du Menu
                    </h2>

                    {!slug && (
                        <div style={{ padding: '1rem', backgroundColor: '#7f1d1d', borderRadius: '8px', marginBottom: '2rem' }}>
                            <p>⚠️ Veuillez d'abord saisir le slug du restaurant dans l'onglet Config</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Création de catégorie */}
                        <div style={{ backgroundColor: '#374151', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Nouvelle Catégorie</h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID</label>
                                <input
                                    value={newCategoryId}
                                    onChange={(e) => setNewCategoryId(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex: breakfast"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom</label>
                                <input
                                    value={newCategoryNom}
                                    onChange={(e) => setNewCategoryNom(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex: Petit Déjeuner"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ordre</label>
                                    <input
                                        type="number"
                                        value={newCategoryOrdre}
                                        onChange={(e) => setNewCategoryOrdre(parseInt(e.target.value))}
                                        style={inputStyle}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Emoji</label>
                                    <input
                                        value={newCategoryEmoji}
                                        onChange={(e) => setNewCategoryEmoji(e.target.value)}
                                        style={inputStyle}
                                        placeholder="🌅"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateCategory}
                                disabled={!slug || !newCategoryId || !newCategoryNom}
                                style={buttonStyle}
                            >
                                ➕ Créer Catégorie
                            </button>
                        </div>

                        {/* Création d'item */}
                        <div style={{ backgroundColor: '#374151', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Nouvel Article</h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID</label>
                                <input
                                    value={newItemId}
                                    onChange={(e) => setNewItemId(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex: 1"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom</label>
                                <input
                                    value={newItemNom}
                                    onChange={(e) => setNewItemNom(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex: Café Croissant"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                    style={inputStyle}
                                    rows={2}
                                    placeholder="Description de l'article..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prix</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newItemPrix}
                                        onChange={(e) => setNewItemPrix(parseFloat(e.target.value))}
                                        style={inputStyle}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ordre</label>
                                    <input
                                        type="number"
                                        value={newItemOrdre}
                                        onChange={(e) => setNewItemOrdre(parseInt(e.target.value))}
                                        style={inputStyle}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Catégorie</label>
                                <select
                                    value={newItemCategorieId}
                                    onChange={(e) => setNewItemCategorieId(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {menuCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.emoji} {cat.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL (optionnel)</label>
                                <input
                                    value={newItemImageUrl}
                                    onChange={(e) => setNewItemImageUrl(e.target.value)}
                                    style={inputStyle}
                                    placeholder="nom-fichier.jpg"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={newItemIsPopular}
                                        onChange={(e) => setNewItemIsPopular(e.target.checked)}
                                    />
                                    Populaire
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={newItemIsSpecial}
                                        onChange={(e) => setNewItemIsSpecial(e.target.checked)}
                                    />
                                    Spécial
                                </label>
                            </div>

                            <button
                                onClick={handleCreateItem}
                                disabled={!slug || !newItemId || !newItemNom || !newItemCategorieId}
                                style={buttonStyle}
                            >
                                ➕ Créer Article
                            </button>
                        </div>
                    </div>

                    {/* Liste des catégories existantes */}
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Catégories Existantes ({menuCategories.length})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {menuCategories.map(category => (
                                <div key={category.id} style={{ backgroundColor: '#4b5563', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h4 style={{ color: '#facc15', margin: 0 }}>
                                            {category.emoji} {category.nom}
                                        </h4>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            style={{ ...secondaryButtonStyle, padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#7f1d1d' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>
                                        ID: {category.id} | Ordre: {category.ordre} | Actif: {category.active ? '✅' : '❌'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.5rem 0 0 0' }}>
                                        {menuItems.filter(item => item.categorieId === category.id).length} article(s)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtre par catégorie */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#facc15' }}>
                            Filtrer les articles par catégorie
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Toutes les catégories</option>
                            {menuCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.emoji} {cat.nom} ({menuItems.filter(item => item.categorieId === cat.id).length})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Liste des articles */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>
                            Articles {selectedCategory ? `(${filteredItems.length} dans cette catégorie)` : `(${menuItems.length} au total)`}
                        </h3>

                        {filteredItems.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#374151', borderRadius: '8px' }}>
                                <p style={{ color: '#9ca3af' }}>
                                    {selectedCategory ? 'Aucun article dans cette catégorie' : 'Aucun article créé'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                                {filteredItems.map(item => {
                                    const category = menuCategories.find(cat => cat.id === item.categorieId);
                                    return (
                                        <div key={item.id} style={{ backgroundColor: '#4b5563', padding: '1.5rem', borderRadius: '8px', position: 'relative' }}>
                                            {/* Badges */}
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {item.isPopular && (
                                                    <span style={{ backgroundColor: '#06b6d4', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        🔥 POPULAIRE
                                                    </span>
                                                )}
                                                {item.isSpecial && (
                                                    <span style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        ⭐ SPÉCIAL
                                                    </span>
                                                )}
                                                {!item.disponible && (
                                                    <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        ❌ INDISPONIBLE
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bouton supprimer */}
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    ...secondaryButtonStyle,
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: '#7f1d1d'
                                                }}
                                            >
                                                🗑️
                                            </button>

                                            {/* Info article */}
                                            <h4 style={{ color: '#facc15', marginBottom: '0.5rem', fontSize: '1.1rem', marginTop: 0, paddingRight: '2rem' }}>
                                                {item.nom}
                                            </h4>

                                            <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                                                {item.description}
                                            </p>

                                            {/* Métadonnées */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <div>
                                                    <strong>ID:</strong> {item.id}
                                                </div>
                                                <div>
                                                    <strong>Prix:</strong> {item.prix}€
                                                </div>
                                                <div>
                                                    <strong>Catégorie:</strong> {category?.emoji} {category?.nom || item.categorieId}
                                                </div>
                                                <div>
                                                    <strong>Ordre:</strong> {item.ordre}
                                                </div>
                                                {item.imageUrl && (
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <strong>Image:</strong> {item.imageUrl}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions globales */}
                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Actions Globales</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={loadMenuData}
                                disabled={!slug}
                                style={secondaryButtonStyle}
                            >
                                🔄 Recharger les données
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Exporter le menu actuel vers les champs JSON ?')) {
                                        setCategories(JSON.stringify(menuCategories, null, 2));
                                        setItems(JSON.stringify(menuItems, null, 2));
                                        setMessage('✅ Menu exporté vers les champs JSON');
                                    }
                                }}
                                disabled={!slug || menuCategories.length === 0}
                                style={secondaryButtonStyle}
                            >
                                📤 Exporter vers JSON
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            L'export vous permet de copier la structure actuelle du menu vers les champs JSON pour sauvegarde ou réutilisation.
                        </p>
                    </div>
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