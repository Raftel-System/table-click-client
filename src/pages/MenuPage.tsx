import React, { useState, useRef } from 'react';
import { ShoppingCart, Home, Plus, Minus, X, Star, Flame } from 'lucide-react';

// Types
interface MenuItem {
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

interface MenuCategory {
    id: string;
    name: string;
    emoji: string;
    isActive?: boolean;
}

// Mock data
const menuCategories: MenuCategory[] = [
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

const menuItems: MenuItem[] = [
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
    {
        id: '3',
        name: 'Œufs Brouillés Premium',
        description: 'Œufs fermiers brouillés avec fines herbes et fromage frais',
        price: 35,
        category: 'breakfast',
        emoji: '🍳',
        isAvailable: true
    },

    // Entrées
    {
        id: '4',
        name: 'Salade Marocaine',
        description: 'Tomates, concombres, olives, oignons avec vinaigrette à l\'huile d\'olive',
        price: 30,
        category: 'starters',
        emoji: '🥗',
        isAvailable: true
    },
    {
        id: '5',
        name: 'Briouates au Fromage',
        description: 'Feuilletés croustillants farcis au fromage et aux fines herbes',
        price: 35,
        category: 'starters',
        emoji: '🥟',
        isPopular: true,
        isAvailable: true
    },
    {
        id: '6',
        name: 'Zaalouk',
        description: 'Caviar d\'aubergines aux tomates et épices marocaines',
        price: 28,
        category: 'starters',
        emoji: '🍆',
        isAvailable: true
    },

    // Tajines
    {
        id: '7',
        name: 'Tajine de Poulet aux Olives',
        description: 'Poulet mijoté avec olives vertes, citron confit et épices marocaines',
        price: 70,
        category: 'tajines',
        emoji: '🍲',
        isPopular: true,
        isAvailable: true
    },
    {
        id: '8',
        name: 'Tajine de Viande aux Pruneaux',
        description: 'Agneau tendre aux pruneaux, amandes et cannelle',
        price: 80,
        category: 'tajines',
        emoji: '🥘',
        isSpecial: true,
        isAvailable: true
    },
    {
        id: '9',
        name: 'Tajine de Légumes',
        description: 'Mélange de légumes de saison mijotés aux épices',
        price: 55,
        category: 'tajines',
        emoji: '🥕',
        isAvailable: true
    },

    // Couscous
    {
        id: '10',
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
        id: '11',
        name: 'Couscous Végétarien',
        description: 'Couscous aux légumes frais et pois chiches',
        price: 40,
        category: 'couscous',
        emoji: '🥕',
        isAvailable: true
    },

    // Plats Principaux
    {
        id: '12',
        name: 'Grillades Mixtes',
        description: 'Assortiment de viandes grillées avec accompagnements',
        price: 85,
        category: 'mains',
        emoji: '🔥',
        isSpecial: true,
        isAvailable: true
    },
    {
        id: '13',
        name: 'Poisson Grillé',
        description: 'Poisson frais grillé avec légumes et riz',
        price: 75,
        category: 'mains',
        emoji: '🐟',
        isAvailable: true
    },

    // Pizzas
    {
        id: '14',
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
        id: '15',
        name: 'Pizza Margherita',
        description: 'Base tomate, mozzarella, basilic frais',
        price: 50,
        category: 'pizzas',
        emoji: '🍕',
        isAvailable: true
    },
    {
        id: '16',
        name: 'Pizza 4 Fromages',
        description: 'Mozzarella, chèvre, roquefort, parmesan',
        price: 65,
        category: 'pizzas',
        emoji: '🧀',
        isPopular: true,
        isAvailable: true
    },

    // Tacos
    {
        id: '17',
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
        id: '18',
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
        id: '19',
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
        id: '20',
        name: 'Thé à la Menthe',
        description: 'Thé traditionnel marocain à la menthe fraîche',
        price: 15,
        category: 'drinks',
        emoji: '🍵',
        isPopular: true,
        isAvailable: true
    },
    {
        id: '21',
        name: 'Jus d\'Orange Frais',
        description: 'Jus d\'orange pressé à la minute',
        price: 20,
        category: 'drinks',
        emoji: '🍊',
        isAvailable: true
    },
    {
        id: '22',
        name: 'Café Expresso',
        description: 'Café expresso italien traditionnel',
        price: 12,
        category: 'drinks',
        emoji: '☕',
        isAvailable: true
    },

    // Desserts
    {
        id: '23',
        name: 'Pâtisseries Orientales',
        description: 'Assortiment de pâtisseries marocaines traditionnelles',
        price: 30,
        category: 'desserts',
        emoji: '🍯',
        isSpecial: true,
        isAvailable: true
    },
    {
        id: '24',
        name: 'Fruits de Saison',
        description: 'Sélection de fruits frais de saison',
        price: 25,
        category: 'desserts',
        emoji: '🍓',
        isAvailable: true
    },
    {
        id: '25',
        name: 'Crème Brûlée',
        description: 'Dessert français classique à la vanille',
        price: 35,
        category: 'desserts',
        emoji: '🍮',
        isPopular: true,
        isAvailable: true
    }
];

// Mock hooks
const useCart = () => ({
    addToCart: (item: MenuItem, quantity = 1, instructions?: string) => {
        console.log('Ajout au panier:', {
            item: item.name,
            quantity,
            instructions,
            total: item.price * quantity
        });
        alert(`✅ ${item.name} ajouté au panier!\nQuantité: ${quantity}\n${instructions ? `Instructions: ${instructions}` : ''}`);
    },
    getCartItemsCount: () => 5
});

const useNavigate = () => (path: string) => console.log('Navigation vers:', path);

const MenuPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('breakfast');
    const [showItemDetail, setShowItemDetail] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');
    const categoriesRef = useRef<HTMLDivElement>(null);
    const { addToCart, getCartItemsCount } = useCart();
    const navigate = useNavigate();

    const filteredItems = menuItems.filter(item =>
        item.category === selectedCategory && (item.isAvailable !== false)
    );

    const handleOpenItemDetail = (item: MenuItem) => {
        setShowItemDetail(item);
        setQuantity(1);
        setInstructions('');
        // Prevent background scroll
        document.body.style.overflow = 'hidden';
    };

    const handleCloseItemDetail = () => {
        setShowItemDetail(null);
        setQuantity(1);
        setInstructions('');
        // Restore background scroll
        document.body.style.overflow = 'unset';
    };

    const handleAddToCart = () => {
        if (showItemDetail) {
            addToCart(showItemDetail, quantity, instructions.trim() || undefined);
            handleCloseItemDetail();
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    const getImageUrl = (item: MenuItem) => {
        if (item.photo) {
            return `/assets/menu/${item.photo}`;
        }
        // Images par défaut basées sur la catégorie
        const imageMap: { [key: string]: string } = {
            'breakfast': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&auto=format',
            'starters': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
            'tajines': 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop&auto=format',
            'couscous': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop&auto=format',
            'mains': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
            'pizzas': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
            'tacos': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format',
            'drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&auto=format',
            'desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format'
        };
        return imageMap[item.category] || imageMap['mains'];
    };

    const scrollToCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        // Auto-scroll dans la liste des catégories si nécessaire
        if (categoriesRef.current) {
            const categoryElement = categoriesRef.current.querySelector(`[data-category="${categoryId}"]`);
            if (categoryElement) {
                categoryElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-lg">O2</span>
                    </div>

                    {/* Titre */}
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            Menu
                        </h1>
                    </div>

                    {/* Bouton panier */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full flex items-center gap-2 font-medium hover:from-yellow-400 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg relative"
                    >
                        <ShoppingCart size={18} />
                        <span className="hidden sm:inline">Panier</span>
                        {getCartItemsCount() > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                                {getCartItemsCount()}
                            </div>
                        )}
                    </button>
                </div>

                {/* Titre restaurant */}
                <div className="text-center pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Café O2 Ice
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-2">
                        <span>✨ Saveurs authentiques</span>
                        <span>•</span>
                        <span>🏆 Ambiance premium</span>
                    </p>
                </div>
            </header>

            {/* Categories Slider */}
            <div className="sticky top-[120px] z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
                <div
                    ref={categoriesRef}
                    className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {menuCategories.map((category) => (
                        <button
                            key={category.id}
                            data-category={category.id}
                            onClick={() => scrollToCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap transition-all duration-300 ${
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold shadow-lg transform scale-105'
                                    : 'bg-gray-800/70 backdrop-blur-sm text-gray-300 hover:bg-gray-700/70 hover:text-white border border-gray-700/50'
                            }`}
                        >
                            <span className="text-xl">{category.emoji}</span>
                            <span className="text-sm font-medium">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Title */}
            <div className="px-4 py-6 border-b border-gray-800/30">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">
                        {menuCategories.find(c => c.id === selectedCategory)?.emoji}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {menuCategories.find(c => c.id === selectedCategory)?.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} disponible{filteredItems.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-orange-500 mt-4 rounded-full"></div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-6 pb-32">
                <div className="space-y-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group relative"
                        >
                            {/* Badges */}
                            <div className="flex gap-2 mb-3">
                                {item.isPopular && (
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Flame size={12} />
                                        POPULAIRE
                                    </div>
                                )}
                                {item.isSpecial && (
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Star size={12} />
                                        SPÉCIAL
                                    </div>
                                )}
                            </div>

                            {/* Item Card */}
                            <div className="flex gap-4 bg-gray-900/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/30 hover:border-yellow-500/40 transition-all duration-300 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-yellow-500/10">
                                <div className="flex-1">
                                    <h3
                                        className="text-xl font-bold text-white mb-2 cursor-pointer hover:text-yellow-400 transition-colors duration-300 group-hover:text-yellow-400"
                                        onClick={() => handleOpenItemDetail(item)}
                                    >
                                        {item.name} {item.emoji}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                                {item.price}
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium">DH</span>
                                        </div>
                                        <button
                                            onClick={() => handleOpenItemDetail(item)}
                                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            <Plus size={18} />
                                            <span className="hidden sm:inline">Ajouter</span>
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer shadow-lg group-hover:shadow-xl transition-all duration-300"
                                    onClick={() => handleOpenItemDetail(item)}
                                >
                                    <img
                                        src={getImageUrl(item)}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800/50 z-50 shadow-2xl">
                <div className="flex">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex-1 flex flex-col items-center gap-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black relative"
                    >
                        <Home size={24} />
                        <span className="text-xs font-bold">Menu</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex-1 flex flex-col items-center gap-1 py-4 text-gray-400 hover:text-yellow-500 transition-colors duration-300 relative group"
                    >
                        <div className="relative">
                            <ShoppingCart size={24} />
                            {getCartItemsCount() > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <span className="text-xs">Panier ({getCartItemsCount()})</span>
                        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>

            {/* Item Detail Bottom Sheet */}
            {showItemDetail && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300"
                    onClick={handleCloseItemDetail}
                >
                    <div
                        className="bg-gray-900 rounded-t-3xl w-full max-h-[95vh] overflow-y-auto border-t border-gray-700 animate-in slide-in-from-bottom duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4 mb-2"></div>

                        {/* Close button */}
                        <button
                            onClick={handleCloseItemDetail}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <div className="px-6 pb-8">
                            {/* Image avec overlay */}
                            <div className="relative mb-6 mt-2">
                                <img
                                    src={getImageUrl(showItemDetail)}
                                    alt={showItemDetail.name}
                                    className="w-full h-64 object-cover rounded-2xl shadow-2xl"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>

                                {/* Badges overlay */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {showItemDetail.isPopular && (
                                        <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Flame size={12} />
                                            POPULAIRE
                                        </div>
                                    )}
                                    {showItemDetail.isSpecial && (
                                        <div className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star size={12} />
                                            SPÉCIAL
                                        </div>
                                    )}
                                </div>

                                {/* Prix en overlay */}
                                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                        {showItemDetail.price}DH
                                    </span>
                                </div>
                            </div>

                            {/* Item info */}
                            <div className="mb-6">
                                <h3 className="text-3xl font-bold text-white mb-3">
                                    {showItemDetail.name} {showItemDetail.emoji}
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-base">
                                    {showItemDetail.description}
                                </p>
                            </div>

                            {/* Quantity selector */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    📦 Quantité
                                </h4>
                                <div className="flex items-center justify-center gap-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 border border-gray-700/50">
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 hover:border-gray-500"
                                    >
                                        <Minus size={20} className="text-white" />
                                    </button>

                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-white block">
                                            {quantity}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {quantity > 1 ? 'articles' : 'article'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= 99}
                                        className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={20} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Instructions spéciales */}
                            <div className="mb-8">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    📝 Instructions spéciales <span className="text-sm font-normal text-gray-400">(optionnel)</span>
                                </h4>
                                <div className="relative">
                                    <textarea
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="Ex: Sans oignons, bien cuit, sauce à part, allergie aux fruits de mer..."
                                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 min-h-[100px]"
                                        rows={4}
                                        maxLength={200}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded">
                                        {instructions.length}/200
                                    </div>
                                </div>
                                {instructions.length > 0 && (
                                    <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                                        ✓ Vos instructions seront transmises au chef
                                    </p>
                                )}
                            </div>

                            {/* Résumé et total */}
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-6">
                                <h4 className="text-lg font-bold text-white mb-4">📋 Résumé de votre commande</h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">{showItemDetail.name}</span>
                                        <span className="text-white font-medium">{showItemDetail.price} DH</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Quantité</span>
                                        <span className="text-white font-medium">× {quantity}</span>
                                    </div>

                                    {instructions.trim() && (
                                        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                                            <p className="text-xs text-blue-400 font-medium mb-1">Instructions spéciales:</p>
                                            <p className="text-sm text-blue-200">{instructions.trim()}</p>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-700 my-4"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total:</span>
                                        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                            {(showItemDetail.price * quantity).toFixed(2)} DH
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton d'ajout au panier */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ShoppingCart size={24} />
                                <span>
                                    Ajouter au panier • {quantity} {quantity > 1 ? 'articles' : 'article'}
                                </span>
                            </button>

                            {/* Note de service */}
                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                                <span>⏱️</span>
                                Les instructions spéciales peuvent affecter le temps de préparation
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Styles pour les animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slide-in-from-bottom {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                .animate-in {
                    animation-fill-mode: both;
                }
                
                .fade-in {
                    animation-name: fade-in;
                }
                
                .slide-in-from-bottom {
                    animation-name: slide-in-from-bottom;
                }
                
                .duration-300 {
                    animation-duration: 300ms;
                }
                
                .duration-500 {
                    animation-duration: 500ms;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                /* Custom scrollbar */
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                /* Hover effects */
                .group:hover .group-hover\\:scale-110 {
                    transform: scale(1.1);
                }
                
                .group:hover .group-hover\\:text-yellow-400 {
                    color: rgb(250 204 21);
                }
                
                .group:hover .group-hover\\:shadow-xl {
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
                }
            `}</style>
        </div>
    );
};

export default MenuPage;