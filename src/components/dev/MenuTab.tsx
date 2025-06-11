// src/components/dev/MenuTab.tsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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

interface MenuTabProps {
    onMessage: (message: string) => void;
}

const MenuTab: React.FC<MenuTabProps> = ({ onMessage }) => {
    const [slug, setSlug] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<'bulk' | 'single'>('bulk');

    // Bulk import
    const [categories, setCategories] = useState('');
    const [items, setItems] = useState('');

    // Gestion Menu existant
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
        backgroundColor: '#6b7280',
        color: '#f9fafb'
    };

    const subTabStyle = (isActive: boolean) => ({
        padding: '0.5rem 1rem',
        backgroundColor: isActive ? '#374151' : 'transparent',
        color: '#f9fafb',
        border: '1px solid #4b5563',
        cursor: 'pointer',
        fontSize: '0.875rem'
    });

    // Charger les données du menu existant
    useEffect(() => {
        if (slug) {
            loadMenuData();
        }
    }, [slug]);

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

            onMessage('✅ Données du menu chargées');
        } catch (err) {
            onMessage('❌ Erreur lors du chargement: ' + (err as Error).message);
        }
    };

    const generateMenuPreset = () => {
        const sampleCategories = [
            { "id": "breakfast", "nom": "Petit Déjeuner", "ordre": 1, "active": true, "emoji": "🌅" },
            { "id": "burgers", "nom": "Burgers", "ordre": 2, "active": true, "emoji": "🍔" },
            { "id": "drinks", "nom": "Boissons", "ordre": 3, "active": true, "emoji": "🥤" }
        ];

        const sampleItems = [
            { "id": "1", "nom": "Croissant Beurre", "prix": 250, "categorieId": "breakfast", "description": "Croissant français traditionnel au beurre", "disponible": true, "ordre": 1 },
            { "id": "2", "nom": "Big Burger", "prix": 1200, "categorieId": "burgers", "description": "Burger avec steak, fromage, salade, tomate", "disponible": true, "ordre": 1, "isPopular": true },
            { "id": "3", "nom": "Coca Cola", "prix": 300, "categorieId": "drinks", "description": "33cl", "disponible": true, "ordre": 1 }
        ];

        setCategories(JSON.stringify(sampleCategories, null, 2));
        setItems(JSON.stringify(sampleItems, null, 2));
    };

    const handleBulkImport = async () => {
        if (!slug) {
            onMessage('❌ Slug requis');
            return;
        }

        try {
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

            onMessage('✅ Import en lot terminé');
            loadMenuData();
        } catch (err) {
            onMessage('❌ Erreur import: ' + (err as Error).message);
        }
    };

    const handleCreateCategory = async () => {
        if (!slug || !newCategoryId || !newCategoryNom) {
            onMessage('❌ Slug, ID et nom de catégorie requis');
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

            onMessage('✅ Catégorie créée');

            // Reset form
            setNewCategoryId('');
            setNewCategoryNom('');
            setNewCategoryOrdre(menuCategories.length + 1);
            setNewCategoryEmoji('🍽️');

            loadMenuData();
        } catch (err) {
            onMessage('❌ Erreur catégorie: ' + (err as Error).message);
        }
    };

    const handleCreateItem = async () => {
        if (!slug || !newItemId || !newItemNom || !newItemCategorieId) {
            onMessage('❌ Slug, ID, nom et catégorie requis');
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

            onMessage('✅ Article créé');

            // Reset form
            setNewItemId('');
            setNewItemNom('');
            setNewItemDescription('');
            setNewItemPrix(0);
            setNewItemCategorieId('');
            setNewItemOrdre(1);
            setNewItemImageUrl('');
            setNewItemIsPopular(false);
            setNewItemIsSpecial(false);

            loadMenuData();
        } catch (err) {
            onMessage('❌ Erreur article: ' + (err as Error).message);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!slug) return;

        try {
            await deleteDoc(doc(db, 'restaurants', slug, 'menuCategories', categoryId));
            onMessage('✅ Catégorie supprimée');
            loadMenuData();
        } catch (err) {
            onMessage('❌ Erreur suppression: ' + (err as Error).message);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!slug) return;

        try {
            await deleteDoc(doc(db, 'restaurants', slug, 'menuItems', itemId));
            onMessage('✅ Article supprimé');
            loadMenuData();
        } catch (err) {
            onMessage('❌ Erreur suppression: ' + (err as Error).message);
        }
    };

    const filteredItems = selectedCategory
        ? menuItems.filter(item => item.categorieId === selectedCategory)
        : menuItems;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                🍽️ Gestion du Menu
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

            {!slug && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#7f1d1d',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    color: '#fef2f2'
                }}>
                    ⚠️ Veuillez d'abord entrer le slug du restaurant
                </div>
            )}

            {slug && (
                <>
                    {/* Sub-tabs */}
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '0' }}>
                        <button
                            onClick={() => setActiveSubTab('bulk')}
                            style={{
                                ...subTabStyle(activeSubTab === 'bulk'),
                                borderRadius: '8px 0 0 8px'
                            }}
                        >
                            📤 Import en lot
                        </button>
                        <button
                            onClick={() => setActiveSubTab('single')}
                            style={{
                                ...subTabStyle(activeSubTab === 'single'),
                                borderRadius: '0 8px 8px 0'
                            }}
                        >
                            ➕ Ajout individuel
                        </button>
                    </div>

                    {/* Import en lot */}
                    {activeSubTab === 'bulk' && (
                        <div>
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

                            {/* Categories JSON */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Categories JSON
                                </label>
                                <textarea
                                    value={categories}
                                    onChange={(e) => setCategories(e.target.value)}
                                    rows={6}
                                    style={textareaStyle}
                                    placeholder='[{"id": "breakfast", "nom": "Petit Déjeuner", "ordre": 1, "active": true, "emoji": "🌅"}, ...]'
                                />
                            </div>

                            {/* Items JSON */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Items JSON
                                </label>
                                <textarea
                                    value={items}
                                    onChange={(e) => setItems(e.target.value)}
                                    rows={6}
                                    style={textareaStyle}
                                    placeholder='[{"id": "1", "nom": "Article", "prix": 50, "categorieId": "breakfast", "description": "...", "disponible": true, "ordre": 1}, ...]'
                                />
                            </div>

                            {/* Button */}
                            <button
                                onClick={handleBulkImport}
                                disabled={!slug || (!categories && !items)}
                                style={{
                                    ...buttonStyle,
                                    opacity: (!slug || (!categories && !items)) ? 0.5 : 1,
                                    cursor: (!slug || (!categories && !items)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                📤 Importer Menu en lot
                            </button>
                        </div>
                    )}

                    {/* Ajout individuel */}
                    {activeSubTab === 'single' && (
                        <div>
                            {/* Nouvelle catégorie */}
                            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>🗂️ Nouvelle Catégorie</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ID *</label>
                                        <input
                                            value={newCategoryId}
                                            onChange={(e) => setNewCategoryId(e.target.value)}
                                            style={inputStyle}
                                            placeholder="ex: burgers"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nom *</label>
                                        <input
                                            value={newCategoryNom}
                                            onChange={(e) => setNewCategoryNom(e.target.value)}
                                            style={inputStyle}
                                            placeholder="ex: Burgers"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ordre</label>
                                        <input
                                            type="number"
                                            value={newCategoryOrdre}
                                            onChange={(e) => setNewCategoryOrdre(parseInt(e.target.value) || 1)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Emoji</label>
                                        <input
                                            value={newCategoryEmoji}
                                            onChange={(e) => setNewCategoryEmoji(e.target.value)}
                                            style={inputStyle}
                                            placeholder="🍔"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateCategory}
                                    disabled={!newCategoryId || !newCategoryNom}
                                    style={{
                                        ...buttonStyle,
                                        opacity: (!newCategoryId || !newCategoryNom) ? 0.5 : 1,
                                        cursor: (!newCategoryId || !newCategoryNom) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ➕ Créer Catégorie
                                </button>
                            </div>

                            {/* Nouvel item */}
                            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>🍽️ Nouvel Article</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ID *</label>
                                        <input
                                            value={newItemId}
                                            onChange={(e) => setNewItemId(e.target.value)}
                                            style={inputStyle}
                                            placeholder="ex: burger-1"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nom *</label>
                                        <input
                                            value={newItemNom}
                                            onChange={(e) => setNewItemNom(e.target.value)}
                                            style={inputStyle}
                                            placeholder="ex: Big Burger"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                                    <textarea
                                        value={newItemDescription}
                                        onChange={(e) => setNewItemDescription(e.target.value)}
                                        rows={2}
                                        style={textareaStyle}
                                        placeholder="Description de l'article..."
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prix (centimes) *</label>
                                        <input
                                            type="number"
                                            value={newItemPrix}
                                            onChange={(e) => setNewItemPrix(parseInt(e.target.value) || 0)}
                                            style={inputStyle}
                                            placeholder="1200"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Catégorie *</label>
                                        <select
                                            value={newItemCategorieId}
                                            onChange={(e) => setNewItemCategorieId(e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="">Choisir...</option>
                                            {menuCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.emoji} {cat.nom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ordre</label>
                                        <input
                                            type="number"
                                            value={newItemOrdre}
                                            onChange={(e) => setNewItemOrdre(parseInt(e.target.value) || 1)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Image URL</label>
                                        <input
                                            value={newItemImageUrl}
                                            onChange={(e) => setNewItemImageUrl(e.target.value)}
                                            style={inputStyle}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                                        <input
                                            type="checkbox"
                                            checked={newItemIsPopular}
                                            onChange={(e) => setNewItemIsPopular(e.target.checked)}
                                        />
                                        ⭐ Populaire
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                                        <input
                                            type="checkbox"
                                            checked={newItemIsSpecial}
                                            onChange={(e) => setNewItemIsSpecial(e.target.checked)}
                                        />
                                        🔥 Spécial
                                    </label>
                                </div>

                                <button
                                    onClick={handleCreateItem}
                                    disabled={!newItemId || !newItemNom || !newItemCategorieId}
                                    style={{
                                        ...buttonStyle,
                                        opacity: (!newItemId || !newItemNom || !newItemCategorieId) ? 0.5 : 1,
                                        cursor: (!newItemId || !newItemNom || !newItemCategorieId) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ➕ Créer Article
                                </button>
                            </div>

                            {/* Menu existant */}
                            {(menuCategories.length > 0 || menuItems.length > 0) && (
                                <div style={{ padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                                    <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>📋 Menu Existant</h3>

                                    {/* Catégories */}
                                    {menuCategories.length > 0 && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h4 style={{ marginBottom: '1rem', color: '#d1d5db' }}>Catégories ({menuCategories.length})</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                {menuCategories.map(cat => (
                                                    <div
                                                        key={cat.id}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            backgroundColor: selectedCategory === cat.id ? '#facc15' : '#4b5563',
                                                            color: selectedCategory === cat.id ? '#1f2937' : '#f9fafb',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                                                    >
                                                        <span>{cat.emoji} {cat.nom}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCategory(cat.id);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                padding: '0.25rem'
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items */}
                                    {filteredItems.length > 0 && (
                                        <div>
                                            <h4 style={{ marginBottom: '1rem', color: '#d1d5db' }}>
                                                Articles {selectedCategory && `- ${menuCategories.find(c => c.id === selectedCategory)?.nom}`} ({filteredItems.length})
                                            </h4>
                                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                {filteredItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            padding: '0.75rem',
                                                            backgroundColor: '#4b5563',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <span style={{ fontWeight: 'bold' }}>{item.nom}</span>
                                                            {item.isPopular && <span style={{ marginLeft: '0.5rem' }}>⭐</span>}
                                                            {item.isSpecial && <span style={{ marginLeft: '0.5rem' }}>🔥</span>}
                                                            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                                                {item.description} - {(item.prix / 100).toFixed(2)}€
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                padding: '0.5rem'
                                                            }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MenuTab;