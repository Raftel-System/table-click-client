import React, { useState, useRef } from 'react';
import { ShoppingCart, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { realMenuCategories, realMenuItems, type RealMenuItem } from '../data/menuData';

const MenuPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('breakfast');
    const [showItemDetail, setShowItemDetail] = useState<RealMenuItem | null>(null);
    const categoriesRef = useRef<HTMLDivElement>(null);
    const { addToCart, getCartItemsCount } = useCart();
    const navigate = useNavigate();

    const filteredItems = realMenuItems.filter(item =>
        item.category === selectedCategory && (item.isAvailable !== false)
    );

    const handleAddToCart = (item: RealMenuItem) => {
        addToCart(item);

        // Animation sur le bouton
        const button = document.getElementById(`add-${item.id}`);
        if (button) {
            button.classList.add('scale-110');
            setTimeout(() => button.classList.remove('scale-110'), 200);
        }
    };

    const getImageUrl = (item: RealMenuItem) => {
        if (item.photo) {
            return `/assets/menu/${item.photo}`;
        }
        // Images par défaut basées sur la catégorie
        const imageMap: { [key: string]: string } = {
            'breakfast': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
            'starters': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            'tajines': 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400',
            'couscous': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400',
            'mains': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            'pizzas': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            'tacos': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            'drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            'desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400'
        };
        return imageMap[item.category] || imageMap['mains'];
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo centré à gauche */}
                    <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full">
                        <span className="font-bold text-lg">O2</span>
                    </div>

                    {/* Titre centré */}
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold text-yellow-500">Menu</h1>
                    </div>

                    {/* Bouton panier */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-full flex items-center gap-2 font-medium hover:bg-yellow-400 transition-colors"
                    >
                        <ShoppingCart size={18} />
                        <span>Panier</span>
                        {getCartItemsCount() > 0 && (
                            <span className="bg-black text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {getCartItemsCount()}
                            </span>
                        )}
                    </button>
                </div>

                <div className="text-center pb-4">
                    <h1 className="text-2xl font-bold text-yellow-500">Café O2 Ice</h1>
                    <p className="text-sm text-gray-400 mt-1">Saveurs authentiques • Ambiance premium</p>
                </div>
            </header>

            {/* Categories Slider */}
            <div className="sticky top-[120px] z-40 bg-black border-b border-gray-800">
                <div
                    ref={categoriesRef}
                    className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {realMenuCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                selectedCategory === category.id
                                    ? 'bg-yellow-500 text-black font-medium'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <span className="text-lg">{category.emoji}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Title */}
            <div className="px-4 py-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">
                        {realMenuCategories.find(c => c.id === selectedCategory)?.emoji}
                    </span>
                    <h2 className="text-2xl font-bold text-white">
                        {realMenuCategories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                </div>
                <div className="h-1 w-20 bg-yellow-500 mt-2"></div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-6 pb-24">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="mb-8 cursor-pointer"
                        onClick={() => setShowItemDetail(item)}
                    >
                        {/* Badges */}
                        <div className="flex gap-2 mb-3">
                            {item.isPopular && (
                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    POPULAIRE
                                </div>
                            )}
                            {item.isSpecial && (
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                                    SPÉCIAL
                                </div>
                            )}
                        </div>

                        {/* Item Card */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-2">
                                    {item.name} {item.emoji}
                                </h3>
                                <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-yellow-500">
                                        {item.price}DH
                                    </span>
                                    <button
                                        id={`add-${item.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(item);
                                        }}
                                        className="bg-yellow-500 text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-yellow-400 transition-all transform"
                                    >
                                        <Plus size={18} />
                                        Ajouter
                                    </button>
                                </div>
                            </div>

                            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={getImageUrl(item)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
                <div className="flex">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex-1 flex flex-col items-center gap-1 py-4 bg-yellow-500 text-black"
                    >
                        <Home size={24} />
                        <span className="text-xs font-medium">Menu</span>
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex-1 flex flex-col items-center gap-1 py-4 text-gray-400 hover:text-yellow-500 transition-colors relative"
                    >
                        <ShoppingCart size={24} />
                        <span className="text-xs">Panier ({getCartItemsCount()})</span>
                        {getCartItemsCount() > 0 && (
                            <div className="absolute -top-1 right-1/4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Item Detail Modal */}
            {showItemDetail && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end"
                    onClick={() => setShowItemDetail(null)}
                >
                    <div
                        className="bg-gray-900 rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>

                        <img
                            src={getImageUrl(showItemDetail)}
                            alt={showItemDetail.name}
                            className="w-full h-64 object-cover rounded-2xl mb-6"
                        />

                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {showItemDetail.name} {showItemDetail.emoji}
                                </h3>
                                <div className="flex gap-2 mb-3">
                                    {showItemDetail.isPopular && (
                                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            POPULAIRE
                                        </div>
                                    )}
                                    {showItemDetail.isSpecial && (
                                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                                            SPÉCIAL
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-yellow-500">
                                {showItemDetail.price}DH
                            </span>
                        </div>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {showItemDetail.description}
                        </p>

                        <button
                            onClick={() => {
                                handleAddToCart(showItemDetail);
                                setShowItemDetail(null);
                            }}
                            className="w-full bg-yellow-500 text-black py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={24} />
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;