// src/hooks/useMenu.ts - Correction pour l'affichage des catégories

import { useState, useEffect } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import {
    MenuItem,
    MenuCategory,
    listenToCategories,
    listenToMenuItems,
    getCategories,
    getMenuItems,
} from '../services/menuService';

export const useMenu = (useRealtimeUpdates: boolean = true) => {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        let unsubscribeCategories: Unsubscribe | null = null;
        let unsubscribeItems: Unsubscribe | null = null;

        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log('🔄 Chargement du menu...');

                if (useRealtimeUpdates) {
                    let categoriesLoaded = false;
                    let itemsLoaded = false;

                    const checkLoadingComplete = () => {
                        if (categoriesLoaded && itemsLoaded) {
                            setIsLoading(false);
                        }
                    };

                    unsubscribeCategories = listenToCategories((categoriesData) => {
                        console.log('📂 Catégories Firebase:', categoriesData);
                        setCategories(categoriesData);
                        categoriesLoaded = true;
                        checkLoadingComplete();
                    });

                    unsubscribeItems = listenToMenuItems((itemsData) => {
                        console.log('🍽️ Items Firebase:', itemsData.length);
                        console.log('🔍 Exemple d\'item:', itemsData[0]);
                        setItems(itemsData);
                        itemsLoaded = true;
                        checkLoadingComplete();
                    });

                } else {
                    const [categoriesData, itemsData] = await Promise.all([
                        getCategories(),
                        getMenuItems()
                    ]);

                    console.log('📊 Données chargées:', {
                        categories: categoriesData.length,
                        items: itemsData.length
                    });

                    setCategories(categoriesData);
                    setItems(itemsData);
                    setIsLoading(false);
                }

            } catch (err) {
                console.error('❌ Erreur chargement menu:', err);
                setError(err instanceof Error ? err.message : 'Erreur de chargement');
                setIsLoading(false);
            }
        };

        loadInitialData();

        return () => {
            if (unsubscribeCategories) unsubscribeCategories();
            if (unsubscribeItems) unsubscribeItems();
        };
    }, [useRealtimeUpdates]);

    useEffect(() => {
        const newHasData = categories.length > 0 || items.length > 0;
        setHasData(newHasData);
        if (newHasData && error) setError(null);
    }, [categories.length, items.length, error]);

    // 🔧 CORRECTION PRINCIPALE : Filtrer les items par ID de catégorie Firebase
    const getItemsByCategory = (categoryId: string): MenuItem[] => {
        console.log("🔍 Recherche items pour categoryId:", categoryId);

        // Trouver la catégorie pour debug
        const category = categories.find(cat => cat.id === categoryId);
        console.log("📂 Catégorie trouvée:", category);

        // Filtrer les items qui ont cette catégorie comme ID Firebase
        const filteredItems = items.filter(item => {
            const matches = item.category === categoryId;
            const available = item.isAvailable ?? true;

            console.log(`📋 "${item.name}": category="${item.category}" === "${categoryId}" ? ${matches}, available: ${available}`);

            return matches && available;
        });

        console.log(`🎯 ${filteredItems.length} items trouvés pour "${category?.name}"`);
        return filteredItems;
    };

    // 🔧 CORRECTION : Catégories actives qui ont des items
    const getActiveCategories = (): MenuCategory[] => {
        console.log("🔍 Calcul des catégories actives...");

        const activeCategories = categories.filter(category => {
            const isActive = category.isActive ?? true;
            if (!isActive) return false;

            // Compter les items disponibles pour cette catégorie (par ID Firebase)
            const itemsCount = items.filter(item =>
                item.category === category.id && // ✅ Utiliser l'ID Firebase
                (item.isAvailable ?? true)
            ).length;

            console.log(`📂 "${category.name}" (ID: ${category.id}): ${itemsCount} items`);

            return itemsCount > 0;
        });

        console.log(`✅ ${activeCategories.length} catégories actives avec items`);
        return activeCategories;
    };

    const getPopularItems = (): MenuItem[] => {
        return items.filter(item =>
            item.isPopular && (item.isAvailable ?? true)
        );
    };

    const getSpecialItems = (): MenuItem[] => {
        return items.filter(item =>
            item.isSpecial && (item.isAvailable ?? true)
        );
    };

    const getCategoryById = (categoryId: string): MenuCategory | undefined => {
        return categories.find(category => category.id === categoryId);
    };

    const getItemById = (itemId: string): MenuItem | undefined => {
        return items.find(item => item.id === itemId);
    };

    const refreshData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔄 Rafraîchissement...');

            const [categoriesData, itemsData] = await Promise.all([
                getCategories(),
                getMenuItems()
            ]);

            setCategories(categoriesData);
            setItems(itemsData);
            setIsLoading(false);
            console.log('✅ Données rafraîchies');
        } catch (err) {
            console.error('❌ Erreur rafraîchissement:', err);
            setError(err instanceof Error ? err.message : 'Erreur de rafraîchissement');
            setIsLoading(false);
        }
    };

    const searchItems = (query: string): MenuItem[] => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return [];

        return items.filter(item => {
            const isAvailable = item.isAvailable ?? true;
            if (!isAvailable) return false;

            const matchesItem =
                item.name.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm);

            const category = getCategoryById(item.category);
            const matchesCategory = category?.name.toLowerCase().includes(searchTerm);

            return matchesItem || matchesCategory;
        });
    };

    return {
        // Données principales
        categories,
        items,
        isLoading,
        error,
        hasData,

        // Fonctions principales
        getItemsByCategory,
        getActiveCategories, // ✅ Fonction corrigée
        getPopularItems,
        getSpecialItems,
        getCategoryById,
        getItemById,
        refreshData,
        searchItems,

        // Statistiques
        stats: {
            totalCategories: categories.length,
            activeCategories: getActiveCategories().length,
            totalItems: items.length,
            availableItems: items.filter(item => item.isAvailable ?? true).length,
            popularItems: getPopularItems().length,
            specialItems: getSpecialItems().length,
            unavailableItems: items.filter(item => !(item.isAvailable ?? true)).length,
        }
    };
};