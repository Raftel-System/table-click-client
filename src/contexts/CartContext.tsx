import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
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

export interface CartItem extends MenuItem {
    quantity: number;
    instructions?: string;
    cartItemId: string; // ID unique pour chaque item dans le panier
    addedAt: number; // Timestamp d'ajout
}

export interface CartSummary {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
    itemsCount: number;
    uniqueItemsCount: number;
}

interface CartContextType {
    // État du panier
    cartItems: CartItem[];
    isLoading: boolean;

    // Actions principales
    addToCart: (item: MenuItem, quantity?: number, instructions?: string) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    updateInstructions: (cartItemId: string, instructions: string) => Promise<void>;
    clearCart: () => Promise<void>;

    // Calculs
    getCartSummary: (deliveryType?: 'delivery' | 'pickup') => CartSummary;
    getCartTotal: () => number;
    getCartItemsCount: () => number;

    // Utilitaires
    isItemInCart: (itemId: string) => boolean;
    getItemQuantityInCart: (itemId: string) => number;
    duplicateCartItem: (cartItemId: string) => Promise<void>;

    // Validation
    validateCart: () => { isValid: boolean; errors: string[] };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Configuration
const CART_STORAGE_KEY = 'cafe_o2_cart_v2';
const DELIVERY_FEE = 10;
const SERVICE_FEE_PERCENTAGE = 0.05; // 5%
const MAX_QUANTITY_PER_ITEM = 99;
const MAX_ITEMS_IN_CART = 50;

// Fonction pour générer un ID unique
const generateCartItemId = (): string => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Fonction pour valider un item du panier - CORRIGÉE
const validateCartItem = (item: CartItem): boolean => {
    return (
        // Vérifier que les strings ne sont pas vides
        Boolean(item.cartItemId) &&
        Boolean(item.id) &&
        Boolean(item.name) &&
        // Vérifier les valeurs numériques
        typeof item.price === 'number' &&
        item.price > 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        item.quantity <= MAX_QUANTITY_PER_ITEM &&
        // Vérifier le timestamp
        typeof item.addedAt === 'number' &&
        item.addedAt > 0
    );
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Charger le panier depuis localStorage au démarrage
    useEffect(() => {
        const loadCart = async () => {
            setIsLoading(true);
            try {
                const savedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    const parsedCart: CartItem[] = JSON.parse(savedCart);
                    // Valider et nettoyer les items
                    const validItems = parsedCart.filter(validateCartItem);
                    setCartItems(validItems);

                    // Si des items ont été supprimés, sauvegarder la version nettoyée
                    if (validItems.length !== parsedCart.length) {
                        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));
                        console.warn(`${parsedCart.length - validItems.length} items invalides supprimés du panier`);
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement du panier:', error);
                localStorage.removeItem(CART_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        loadCart();
    }, []);

    // Sauvegarder le panier dans localStorage à chaque modification
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du panier:', error);
            }
        }
    }, [cartItems, isLoading]);

    // Ajouter un item au panier
    const addToCart = useCallback(async (item: MenuItem, quantity: number = 1, instructions?: string): Promise<void> => {
        setIsLoading(true);

        try {
            // Validation des paramètres - AMÉLIORÉE
            if (!item || !item.id || !item.name || typeof item.price !== 'number') {
                throw new Error('Item invalide pour ajouter au panier');
            }

            if (quantity <= 0 || quantity > MAX_QUANTITY_PER_ITEM) {
                throw new Error(`Quantité invalide: doit être entre 1 et ${MAX_QUANTITY_PER_ITEM}`);
            }

            // Simulation async plus réaliste
            await new Promise(resolve => setTimeout(resolve, 150));

            setCartItems(currentItems => {
                // Vérifier la limite du panier
                const totalItems = currentItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
                if (totalItems + quantity > MAX_ITEMS_IN_CART) {
                    throw new Error(`Limite du panier atteinte (${MAX_ITEMS_IN_CART} articles maximum)`);
                }

                const trimmedInstructions = instructions?.trim();

                // Pour les items avec instructions, on crée toujours un nouvel item
                if (trimmedInstructions) {
                    const newCartItem: CartItem = {
                        ...item,
                        quantity,
                        instructions: trimmedInstructions,
                        cartItemId: generateCartItemId(),
                        addedAt: Date.now()
                    };
                    return [...currentItems, newCartItem];
                } else {
                    // Chercher un item existant identique sans instructions
                    const existingItemIndex = currentItems.findIndex(
                        cartItem => cartItem.id === item.id && !cartItem.instructions
                    );

                    if (existingItemIndex !== -1) {
                        // Mettre à jour la quantité de l'item existant
                        return currentItems.map((cartItem, index) =>
                            index === existingItemIndex
                                ? {
                                    ...cartItem,
                                    quantity: Math.min(cartItem.quantity + quantity, MAX_QUANTITY_PER_ITEM),
                                    addedAt: Date.now() // Mettre à jour le timestamp
                                }
                                : cartItem
                        );
                    } else {
                        // Créer un nouvel item sans instructions
                        const newCartItem: CartItem = {
                            ...item,
                            quantity,
                            cartItemId: generateCartItemId(),
                            addedAt: Date.now()
                        };
                        return [...currentItems, newCartItem];
                    }
                }
            });

            console.log(`✅ Ajouté au panier: ${item.name} (x${quantity})`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Supprimer un item du panier
    const removeFromCart = useCallback(async (cartItemId: string): Promise<void> => {
        if (!cartItemId) {
            throw new Error('ID d\'item requis pour la suppression');
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            setCartItems(currentItems => {
                const itemToRemove = currentItems.find(item => item.cartItemId === cartItemId);
                if (!itemToRemove) {
                    throw new Error('Item non trouvé dans le panier');
                }

                console.log(`🗑️ Supprimé du panier: ${itemToRemove.name}`);
                return currentItems.filter(item => item.cartItemId !== cartItemId);
            });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mettre à jour la quantité
    const updateQuantity = useCallback(async (cartItemId: string, quantity: number): Promise<void> => {
        if (!cartItemId) {
            throw new Error('ID d\'item requis pour la mise à jour');
        }

        if (quantity <= 0) {
            return removeFromCart(cartItemId);
        }

        if (quantity > MAX_QUANTITY_PER_ITEM) {
            throw new Error(`Quantité maximum: ${MAX_QUANTITY_PER_ITEM}`);
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            setCartItems(currentItems => {
                const existingItem = currentItems.find(item => item.cartItemId === cartItemId);
                if (!existingItem) {
                    throw new Error('Item non trouvé dans le panier');
                }

                console.log(`📊 Quantité mise à jour: ${existingItem.name} (${existingItem.quantity} → ${quantity})`);

                return currentItems.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity, addedAt: Date.now() }
                        : item
                );
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de quantité:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [removeFromCart]);

    // Mettre à jour les instructions
    const updateInstructions = useCallback(async (cartItemId: string, instructions: string): Promise<void> => {
        if (!cartItemId) {
            throw new Error('ID d\'item requis pour la mise à jour');
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            setCartItems(currentItems => {
                const existingItem = currentItems.find(item => item.cartItemId === cartItemId);
                if (!existingItem) {
                    throw new Error('Item non trouvé dans le panier');
                }

                const trimmedInstructions = instructions.trim();
                console.log(`📝 Instructions mises à jour: ${existingItem.name} → "${trimmedInstructions || 'Aucune'}"`);

                return currentItems.map(item =>
                    item.cartItemId === cartItemId
                        ? {
                            ...item,
                            instructions: trimmedInstructions || undefined,
                            addedAt: Date.now()
                        }
                        : item
                );
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des instructions:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Vider le panier
    const clearCart = useCallback(async (): Promise<void> => {
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            setCartItems([]);
            localStorage.removeItem(CART_STORAGE_KEY);
            console.log('🧹 Panier vidé');
        } catch (error) {
            console.error('Erreur lors du vidage du panier:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Dupliquer un item du panier
    const duplicateCartItem = useCallback(async (cartItemId: string): Promise<void> => {
        const itemToDuplicate = cartItems.find(item => item.cartItemId === cartItemId);
        if (!itemToDuplicate) {
            throw new Error('Item à dupliquer non trouvé');
        }

        console.log(`📋 Duplication: ${itemToDuplicate.name}`);
        await addToCart(itemToDuplicate, itemToDuplicate.quantity, itemToDuplicate.instructions);
    }, [cartItems, addToCart]);

    // Calculer le résumé du panier
    const getCartSummary = useCallback((deliveryType: 'delivery' | 'pickup' = 'delivery'): CartSummary => {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
        const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE;
        const total = subtotal + deliveryFee + serviceFee;
        const itemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        const uniqueItemsCount = cartItems.length;

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            deliveryFee: Math.round(deliveryFee * 100) / 100,
            serviceFee: Math.round(serviceFee * 100) / 100,
            total: Math.round(total * 100) / 100,
            itemsCount,
            uniqueItemsCount
        };
    }, [cartItems]);

    // Obtenir le total du panier
    const getCartTotal = useCallback((): number => {
        return getCartSummary().total;
    }, [getCartSummary]);

    // Obtenir le nombre d'items dans le panier
    const getCartItemsCount = useCallback((): number => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    // Vérifier si un item est dans le panier
    const isItemInCart = useCallback((itemId: string): boolean => {
        return cartItems.some(cartItem => cartItem.id === itemId);
    }, [cartItems]);

    // Obtenir la quantité totale d'un item dans le panier
    const getItemQuantityInCart = useCallback((itemId: string): number => {
        return cartItems
            .filter(cartItem => cartItem.id === itemId)
            .reduce((total, cartItem) => total + cartItem.quantity, 0);
    }, [cartItems]);

    // Valider le panier
    const validateCart = useCallback((): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (cartItems.length === 0) {
            errors.push('Le panier est vide');
            return { isValid: false, errors };
        }

        cartItems.forEach((item, index) => {
            if (!validateCartItem(item)) {
                errors.push(`Article ${index + 1} (${item.name || 'Inconnu'}) est invalide`);
            }
        });

        const totalItems = getCartItemsCount();
        if (totalItems > MAX_ITEMS_IN_CART) {
            errors.push(`Trop d'articles dans le panier (${totalItems}/${MAX_ITEMS_IN_CART})`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [cartItems, getCartItemsCount]);

    const value: CartContextType = {
        // État
        cartItems,
        isLoading,

        // Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        updateInstructions,
        clearCart,
        duplicateCartItem,

        // Calculs
        getCartSummary,
        getCartTotal,
        getCartItemsCount,

        // Utilitaires
        isItemInCart,
        getItemQuantityInCart,
        validateCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};