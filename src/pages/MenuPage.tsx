import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import des composants
import CategoriesSlider from '../components/menu/CategoriesSlider/CategoriesSlider';
import ItemDetailModal from '../components/menu/ItemDetailModal/ItemDetailModal';
import MenuItems from '../components/menu/MenuItems/MenuItems';
import BottomNavigation from '../components/BottomNavigation';

// Import des données et types
import { realMenuCategories, realMenuItems } from '../data/menuData';
import {type MenuItem, useCart} from '../contexts/CartContext';

const MenuPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('breakfast');
    const [showItemDetail, setShowItemDetail] = useState<MenuItem | null>(null);
    const { addToCart, getCartItemsCount } = useCart();
    const navigate = useNavigate(); // Utiliser le vrai hook de react-router-dom

    // Filtrer les items selon la catégorie sélectionnée
    const filteredItems = realMenuItems.filter(item =>
        item.category === selectedCategory && (item.isAvailable !== false)
    );

    // Gestion de l'ouverture du détail d'un item
    const handleOpenItemDetail = (item: MenuItem) => {
        setShowItemDetail(item);
    };

    // Gestion de la fermeture du détail d'un item
    const handleCloseItemDetail = () => {
        setShowItemDetail(null);
    };

    // Gestion de l'ajout au panier depuis la modal
    const handleAddToCart = async (item: MenuItem, quantity: number, instructions?: string) => {
        await addToCart(item, quantity, instructions);
    };

    // Gestion de la navigation
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    // Obtenir la catégorie actuelle
    const currentCategory = realMenuCategories.find(c => c.id === selectedCategory);

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

            {/* Categories Slider Component */}
            <CategoriesSlider
                categories={realMenuCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            {/* Category Title */}
            <div className="px-4 py-6 border-b border-gray-800/30">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">
                        {currentCategory?.emoji}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {currentCategory?.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} disponible{filteredItems.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-orange-500 mt-4 rounded-full"></div>
            </div>

            {/* Menu Items Component */}
            <div className="px-4 py-6 pb-32">
                <MenuItems
                    items={filteredItems}
                    onItemClick={handleOpenItemDetail}
                />
            </div>

            {/* Bottom Navigation Component */}
            <BottomNavigation
                currentPath="menu"
                cartItemsCount={getCartItemsCount()}
                onNavigate={handleNavigate}
            />

            {/* Item Detail Modal Component */}
            <ItemDetailModal
                item={showItemDetail}
                isOpen={!!showItemDetail}
                onClose={handleCloseItemDetail}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default MenuPage;