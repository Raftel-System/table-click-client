export interface RealMenuItem {
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

export interface RealMenuCategory {
    id: string;
    name: string;
    emoji: string;
    isActive?: boolean;
}

export const realMenuCategories: RealMenuCategory[] = [
    { id: 'breakfast', name: 'Petit Déjeuner', emoji: '🌅', isActive: true },
    { id: 'starters', name: 'Entrées', emoji: '🥗', isActive: true },
    { id: 'tajines', name: 'Tajines', emoji: '🍲', isActive: true },
    { id: 'couscous', name: 'Couscous', emoji: '🍛', isActive: true },
    { id: 'mains', name: 'Plats Principaux', emoji: '🍽️', isActive: true },
    { id: 'pizzas', name: 'Pizzas', emoji: '🍕', isActive: true },
    { id: 'tacos', name: 'Tacos', emoji: '🌮', isActive: true },
    { id: 'drinks', name: 'Boissons', emoji: '🥤', isActive: true },
    { id: 'desserts', name: 'Desserts', emoji: '🍰', isActive: true }
];

export const realMenuItems: RealMenuItem[] = [
    // Petit Déjeuner
    {
        id: '1',
        name: 'Petit Déjeuner O2 Ice',
        description: 'Jus Fraîches, Beurre, Confiture, Fromage, Olive noir, Olive vertes, Huile d\'Olive',
        price: 60,
        category: 'breakfast',
        emoji: '🌅',
        isPopular: true,
        isSpecial: true,
        isAvailable: true,
        photo: 'petit-dejeuner.jpg'
    },
    {
        id: '2',
        name: 'Msemen avec Miel',
        description: 'Crêpes marocaines traditionnelles servies avec du miel naturel',
        price: 25,
        category: 'breakfast',
        emoji: '🥞',
        isAvailable: true
    },

    // Entrées
    {
        id: '3',
        name: 'Salade Marocaine',
        description: 'Tomates, concombres, olives, oignons avec vinaigrette à l\'huile d\'olive',
        price: 30,
        category: 'starters',
        emoji: '🥗',
        isAvailable: true
    },
    {
        id: '4',
        name: 'Briouates au Fromage',
        description: 'Feuilletés croustillants farcis au fromage et aux fines herbes',
        price: 35,
        category: 'starters',
        emoji: '🥟',
        isPopular: true,
        isAvailable: true
    },

    // Tajines
    {
        id: '5',
        name: 'Tajine de Poulet aux Olives',
        description: 'Poulet mijoté avec olives vertes, citron confit et épices marocaines',
        price: 70,
        category: 'tajines',
        emoji: '🍲',
        isPopular: true,
        isAvailable: true
    },
    {
        id: '6',
        name: 'Tajine de Viande aux Pruneaux',
        description: 'Agneau tendre aux pruneaux, amandes et cannelle',
        price: 80,
        category: 'tajines',
        emoji: '🥘',
        isSpecial: true,
        isAvailable: true
    },

    // Couscous
    {
        id: '7',
        name: 'Couscous de Viande',
        description: 'Couscous traditionnel avec viande tendre et légumes de saison',
        price: 45,
        category: 'couscous',
        emoji: '🍛',
        isPopular: true,
        isAvailable: true,
        photo: 'couscous-de-viande.jpg'
    },
    {
        id: '8',
        name: 'Couscous Végétarien',
        description: 'Couscous aux légumes frais et pois chiches',
        price: 40,
        category: 'couscous',
        emoji: '🥕',
        isAvailable: true
    },

    // Plats Principaux
    {
        id: '9',
        name: 'Grillades Mixtes',
        description: 'Assortiment de viandes grillées avec accompagnements',
        price: 85,
        category: 'mains',
        emoji: '🔥',
        isSpecial: true,
        isAvailable: true
    },
    {
        id: '10',
        name: 'Poisson Grillé',
        description: 'Poisson frais grillé avec légumes et riz',
        price: 75,
        category: 'mains',
        emoji: '🐟',
        isAvailable: true
    },

    // Pizzas
    {
        id: '11',
        name: 'Pizza O2 Ice',
        description: 'Mozzarella, Sauce tomate, jambon de dinde, Viande hachée',
        price: 60,
        category: 'pizzas',
        emoji: '🍕',
        isSpecial: true,
        isAvailable: true,
        photo: 'pizza-O2-Ice.jpg'
    },
    {
        id: '12',
        name: 'Pizza Margherita',
        description: 'Base tomate, mozzarella, basilic frais',
        price: 50,
        category: 'pizzas',
        emoji: '🍕',
        isAvailable: true
    },

    // Tacos
    {
        id: '13',
        name: 'Tacos O2 Ice',
        description: 'Spécialité de la maison avec garniture premium',
        price: 60,
        category: 'tacos',
        emoji: '🌮',
        isSpecial: true,
        isAvailable: true,
        photo: 'tacos-O2-Ice.jpg'
    },
    {
        id: '14',
        name: 'Tacos Poulet',
        description: 'Tortilla garnie de poulet grillé, légumes et sauce',
        price: 45,
        category: 'tacos',
        emoji: '🌮',
        isPopular: true,
        isAvailable: true
    },

    // Boissons
    {
        id: '15',
        name: 'Smoothie Royal',
        description: 'Banane + Mangue + Orange + Fraise glacé',
        price: 45,
        category: 'drinks',
        emoji: '🥤',
        isSpecial: true,
        isAvailable: true,
        photo: 'smoothie-royal.jpg'
    },
    {
        id: '16',
        name: 'Thé à la Menthe',
        description: 'Thé traditionnel marocain à la menthe fraîche',
        price: 15,
        category: 'drinks',
        emoji: '🍵',
        isPopular: true,
        isAvailable: true
    },
    {
        id: '17',
        name: 'Jus d\'Orange Frais',
        description: 'Jus d\'orange pressé à la minute',
        price: 20,
        category: 'drinks',
        emoji: '🍊',
        isAvailable: true
    },

    // Desserts
    {
        id: '18',
        name: 'Pâtisseries Orientales',
        description: 'Assortiment de pâtisseries marocaines traditionnelles',
        price: 30,
        category: 'desserts',
        emoji: '🍯',
        isSpecial: true,
        isAvailable: true
    },
    {
        id: '19',
        name: 'Fruits de Saison',
        description: 'Sélection de fruits frais de saison',
        price: 25,
        category: 'desserts',
        emoji: '🍓',
        isAvailable: true
    }
];