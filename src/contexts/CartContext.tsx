import React, { createContext, useContext, useState, useEffect } from 'react';
import type {RealMenuItem} from '../data/menuData';

export interface CartItem extends RealMenuItem {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: RealMenuItem, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Charger le panier depuis localStorage au démarrage
    useEffect(() => {
        const savedCart = localStorage.getItem('cafe_o2_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Erreur lors du chargement du panier:', error);
                localStorage.removeItem('cafe_o2_cart');
            }
        }
    }, []);

    // Sauvegarder le panier dans localStorage à chaque modification
    useEffect(() => {
        localStorage.setItem('cafe_o2_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: RealMenuItem, quantity: number = 1) => {
        setCartItems(currentItems => {
            const existingItem = currentItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                return currentItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                return [...currentItems, { ...item, quantity }];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems(currentItems =>
            currentItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cafe_o2_cart');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemsCount,
        }}>
            {children}
        </CartContext.Provider>
    );
};