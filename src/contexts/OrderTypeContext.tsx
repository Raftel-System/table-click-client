// src/contexts/OrderTypeContext.tsx - Version simplifiée
import React, { createContext, useContext, useState, useEffect } from 'react';

export type OrderType = 'dine-in' | 'takeaway';

export interface OrderConfig {
    type: OrderType;
    tableNumber?: number;
}

interface OrderTypeContextType {
    orderConfig: OrderConfig | null;
    setOrderConfig: (config: OrderConfig) => void;
    clearOrderConfig: () => void;
    isOrderConfigured: boolean;
    getOrderDisplayName: () => string;
    getOrderIcon: () => string;
    getEstimatedTime: () => string;
}

const OrderTypeContext = createContext<OrderTypeContextType | undefined>(undefined);

const ORDER_STORAGE_KEY = 'cafe_order_config_v1';

export const useOrderType = () => {
    const context = useContext(OrderTypeContext);
    if (context === undefined) {
        throw new Error('useOrderType must be used within an OrderTypeProvider');
    }
    return context;
};

export const OrderTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orderConfig, setOrderConfigState] = useState<OrderConfig | null>(null);

    // Charger la configuration depuis localStorage au démarrage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(ORDER_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setOrderConfigState(parsed);
                console.log('📖 Configuration de commande chargée:', parsed);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
            localStorage.removeItem(ORDER_STORAGE_KEY);
        }
    }, []);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        if (orderConfig) {
            try {
                localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderConfig));
                console.log('💾 Configuration sauvegardée:', orderConfig);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
            }
        }
    }, [orderConfig]);

    const setOrderConfig = (config: OrderConfig) => {
        setOrderConfigState(config);
    };

    const clearOrderConfig = () => {
        setOrderConfigState(null);
        localStorage.removeItem(ORDER_STORAGE_KEY);
        console.log('🗑️ Configuration effacée');
    };

    const getOrderDisplayName = (): string => {
        if (!orderConfig) return 'Non configuré';

        switch (orderConfig.type) {
            case 'dine-in':
                return `Table ${orderConfig.tableNumber}`;
            case 'takeaway':
                return 'À emporter';
            default:
                return 'Non configuré';
        }
    };

    const getOrderIcon = (): string => {
        if (!orderConfig) return '❓';

        switch (orderConfig.type) {
            case 'dine-in':
                return '🪑';
            case 'takeaway':
                return '🥡';
            default:
                return '❓';
        }
    };

    const getEstimatedTime = (): string => {
        if (!orderConfig) return 'Non défini';

        switch (orderConfig.type) {
            case 'dine-in':
                return '15-25 min';
            case 'takeaway':
                return '10-15 min';
            default:
                return 'Non défini';
        }
    };

    const value: OrderTypeContextType = {
        orderConfig,
        setOrderConfig,
        clearOrderConfig,
        isOrderConfigured: !!orderConfig,
        getOrderDisplayName,
        getOrderIcon,
        getEstimatedTime
    };

    return (
        <OrderTypeContext.Provider value={value}>
            {children}
        </OrderTypeContext.Provider>
    );
};