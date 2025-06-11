// src/config/menu.config.ts

export const MENU_CONFIG = {
    // Limites et contraintes
    MAX_QUANTITY_PER_ITEM: 99,
    MAX_INSTRUCTIONS_LENGTH: 200,
    MAX_ITEMS_IN_CART: 50,

    // Animations et transitions
    ANIMATION_DURATION: {
        fast: 300,
        normal: 500,
        slow: 700
    },

    // Délais de recherche et filtrage
    SEARCH_DEBOUNCE_DELAY: 300,
    CATEGORY_SCROLL_DELAY: 100,

    // Images et médias
    DEFAULT_IMAGES: {
        breakfast: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&auto=format',
        starters: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
        tajines: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop&auto=format',
        couscous: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop&auto=format',
        mains: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
        pizzas: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
        tacos: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
        drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&auto=format',
        desserts: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format'
    },

    // Chemins et URLs
    PATHS: {
        menu: '/menu',
        cart: '/cart',
        checkout: '/checkout',
        profile: '/profile'
    },

    // Messages et textes
    MESSAGES: {
        errors: {
            addToCart: 'Erreur lors de l\'ajout au panier',
            loadMenu: 'Erreur lors du chargement du menu',
            invalidQuantity: 'Quantité invalide',
            networkError: 'Problème de connexion'
        },
        success: {
            addedToCart: 'Article ajouté au panier',
            removedFromCart: 'Article supprimé du panier',
            cartUpdated: 'Panier mis à jour'
        },
        placeholders: {
            instructions: 'Ex: Sans oignons, bien cuit, sauce à part...',
            search: 'Rechercher un plat...',
            orderNote: 'Note pour le restaurant (optionnel)'
        }
    },

    // Configuration UI
    UI: {
        // Breakpoints (en px)
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        },

        // Z-index layers
        zIndex: {
            dropdown: 40,
            modal: 50,
            toast: 60,
            loading: 70
        },

        // Couleurs du thème
        colors: {
            primary: {
                from: '#f59e0b', // yellow-500
                to: '#eab308'    // yellow-600
            },
            accent: {
                from: '#06b6d4', // cyan-500
                to: '#0891b2'    // cyan-600
            }
        }
    },

    // Configuration des fonctionnalités
    FEATURES: {
        enableSearch: true,
        enableFilters: true,
        enableFavorites: false,
        enableReviews: false,
        enableSocialShare: false,
        enablePushNotifications: false
    },

    // Configuration du cache
    CACHE: {
        menuTTL: 5 * 60 * 1000, // 5 minutes
        imageTTL: 24 * 60 * 60 * 1000, // 24 heures
        userPreferencesTTL: 7 * 24 * 60 * 60 * 1000 // 7 jours
    },

    // Configuration des notifications
    NOTIFICATIONS: {
        autoHideDuration: 3000,
        maxNotifications: 3,
        positions: {
            default: 'top-right',
            mobile: 'bottom-center'
        }
    },

    // Configuration de l'accessibilité
    ACCESSIBILITY: {
        announceChanges: true,
        keyboardNavigation: true,
        highContrast: false,
        reducedMotion: 'auto' // 'auto' | 'always' | 'never'
    },

    // Configuration du développement
    DEV: {
        enableDebugLogs: process.env.NODE_ENV === 'development',
        enablePerformanceMetrics: false,
        mockApiDelay: 500
    }
} as const;

// Types dérivés de la configuration
export type MenuConfigType = typeof MENU_CONFIG;
export type CategoryId = keyof typeof MENU_CONFIG.DEFAULT_IMAGES;
export type FeatureFlag = keyof typeof MENU_CONFIG.FEATURES;

// Helpers pour accéder à la configuration
export const getDefaultImage = (category: string): string => {
    return MENU_CONFIG.DEFAULT_IMAGES[category as CategoryId] || MENU_CONFIG.DEFAULT_IMAGES.mains;
};

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
    return MENU_CONFIG.FEATURES[feature];
};

export const getBreakpoint = (size: keyof typeof MENU_CONFIG.UI.breakpoints): number => {
    return MENU_CONFIG.UI.breakpoints[size];
};

export const getMessage = (category: 'errors' | 'success' | 'placeholders', key: string): string => {
    const messages = MENU_CONFIG.MESSAGES[category] as Record<string, string>;
    return messages[key] || `Message non trouvé: ${category}.${key}`;
};

// Configuration responsive
export const RESPONSIVE_CONFIG = {
    // Nombre de colonnes selon la taille d'écran
    columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3
    },

    // Taille des images selon l'appareil
    imageSize: {
        mobile: { width: 120, height: 120 },
        tablet: { width: 150, height: 150 },
        desktop: { width: 180, height: 180 }
    },

    // Espacements
    spacing: {
        mobile: { padding: 16, gap: 12 },
        tablet: { padding: 24, gap: 16 },
        desktop: { padding: 32, gap: 20 }
    }
} as const;

// Configuration des animations
export const ANIMATION_CONFIG = {
    // Easings
    easing: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },

    // Durées selon le type d'animation
    duration: {
        micro: 150,   // Hovers, petites transitions
        quick: 300,   // Transitions standard
        moderate: 500, // Modals, slides
        slow: 700,    // Chargements, grandes transitions
        glacial: 1000 // Animations décoratives
    },

    // Délais pour les animations en cascade
    stagger: {
        items: 50,    // Entre chaque élément d'une liste
        sections: 100, // Entre chaque section
        pages: 200    // Entre chaque page
    }
} as const;

// Configuration des formats
export const FORMAT_CONFIG = {
    // Formats de nombre
    number: {
        price: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
        quantity: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
        percentage: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }
    },

    // Formats de date
    date: {
        short: { month: 'short', day: 'numeric' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    },

    // Validation des formats
    validation: {
        phone: /^(\+\d{1,3}[- ]?)?\d{10}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        price: /^\d+(\.\d{1,2})?$/
    }
} as const;

export default MENU_CONFIG;