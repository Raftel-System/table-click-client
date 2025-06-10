// src/hooks/useRestaurantData.ts
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types pour les données Firebase
export interface FirebaseMenuCategory {
    id: string;
    nom: string;
    ordre: number;
    active: boolean;
    emoji?: string; // Optionnel pour compatibilité
}

export interface FirebaseMenuItem {
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

// Types transformés pour l'application
export interface MenuCategory {
    id: string;
    name: string;
    emoji: string;
    isActive?: boolean;
    ordre?: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    emoji: string;
    isPopular?: boolean;
    isSpecial?: boolean;
    isAvailable?: boolean;
    photo?: string;
}

interface UseRestaurantDataReturn {
    categories: MenuCategory[];
    items: MenuItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Mapping des emojis par défaut selon le nom de la catégorie
const getEmojiByName = (nom: string): string => {
    const emojiMap: { [key: string]: string } = {
        'burgers': '🍔',
        'kebab': '🥙',
        'tacos': '🌮',
        'pizza': '🍕',
        'boissons': '🥤',
        'desserts': '🍰',
        'entrées': '🥗',
        'plats': '🍽️',
        'petit déjeuner': '🌅',
        'breakfast': '🌅',
        'starters': '🥗',
        'tajines': '🍲',
        'couscous': '🍛',
        'mains': '🍽️',
        'drinks': '🥤'
    };

    const normalizedName = nom.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (normalizedName.includes(key)) {
            return emoji;
        }
    }
    return '🍽️'; // Emoji par défaut
};

export const useRestaurantData = (restaurantSlug: string): UseRestaurantDataReturn => {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRestaurantData = async () => {
        if (!restaurantSlug) {
            setError('Slug du restaurant manquant');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log(`🔄 Chargement des données pour: ${restaurantSlug}`);

            // Récupération des catégories
            const categoriesRef = collection(db, 'restaurants', restaurantSlug, 'menuCategories');
            const categoriesQuery = query(categoriesRef, orderBy('ordre', 'asc'));
            const categoriesSnapshot = await getDocs(categoriesQuery);

            const fetchedCategories: MenuCategory[] = [];
            categoriesSnapshot.forEach((doc) => {
                const data = doc.data() as Omit<FirebaseMenuCategory, 'id'>;
                if (data.active) {
                    fetchedCategories.push({
                        id: doc.id,
                        name: data.nom,
                        emoji: data.emoji || getEmojiByName(data.nom),
                        isActive: data.active,
                        ordre: data.ordre
                    });
                }
            });

            console.log(`✅ ${fetchedCategories.length} catégories récupérées`);

            // Récupération des articles
            const itemsRef = collection(db, 'restaurants', restaurantSlug, 'menuItems');
            const itemsQuery = query(
                itemsRef,
                where('disponible', '==', true),
                orderBy('ordre', 'asc')
            );
            const itemsSnapshot = await getDocs(itemsQuery);

            const fetchedItems: MenuItem[] = [];
            itemsSnapshot.forEach((doc) => {
                const data = doc.data() as Omit<FirebaseMenuItem, 'id'>;

                fetchedItems.push({
                    id: doc.id,
                    name: data.nom,
                    description: data.description,
                    price: data.prix,
                    category: data.categorieId,
                    emoji: '', // Sera rempli après
                    isPopular: data.isPopular || false,
                    isSpecial: data.isSpecial || false,
                    isAvailable: data.disponible,
                    photo: data.imageUrl ? extractImageFilename(data.imageUrl) : undefined
                });
            });

            // Ajouter les emojis des catégories aux items
            const categoriesMap = new Map(fetchedCategories.map(cat => [cat.id, cat.emoji]));
            fetchedItems.forEach(item => {
                item.emoji = categoriesMap.get(item.category) || '🍽️';
            });

            console.log(`✅ ${fetchedItems.length} articles récupérés`);

            setCategories(fetchedCategories);
            setItems(fetchedItems);

        } catch (err) {
            console.error('❌ Erreur lors du chargement des données:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // Fonction utilitaire pour extraire le nom de fichier de l'URL
    const extractImageFilename = (url: string): string => {
        try {
            const filename = url.split('/').pop();
            return filename || url;
        } catch {
            return url;
        }
    };

    useEffect(() => {
        fetchRestaurantData();
    }, [restaurantSlug]);

    return {
        categories,
        items,
        loading,
        error,
        refetch: fetchRestaurantData
    };
};