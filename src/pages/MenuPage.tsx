// src/pages/MenuPage.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Import des composants
import CategoriesSlider from '../components/menu/CategoriesSlider/CategoriesSlider';
import ItemDetailModal from '../components/menu/ItemDetailModal/ItemDetailModal';
import MenuItems from '../components/menu/MenuItems/MenuItems';
import BottomNavigation from '../components/BottomNavigation';

// Import des hooks
import { useRestaurantData } from '../hooks/useRestaurantData';
import { useRestaurantInfo } from '../hooks/useRestaurantInfo';
import { useTheme } from '../hooks/useTheme';
import { type MenuItem, useCart } from '../contexts/CartContext';
import { useOrderType } from '../contexts/OrderTypeContext';

const MenuPage: React.FC = () => {
    const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
    const navigate = useNavigate();
    const { addToCart, getCartItemsCount } = useCart();
    const { isOrderConfigured } = useOrderType();

    // État local
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showItemDetail, setShowItemDetail] = useState<MenuItem | null>(null);

    // Hooks pour les données, infos et thème
    const { categories, items, loading: dataLoading, error: dataError, refetch } = useRestaurantData(restaurantSlug || '');
    const { restaurantInfo, loading: infoLoading, error: infoError } = useRestaurantInfo(restaurantSlug || '');
    const { theme, loading: themeLoading, error: themeError } = useTheme(restaurantSlug || '');

    // Loading combiné
    const loading = dataLoading || themeLoading || infoLoading;
    const error = dataError || themeError || infoError;

    // Vérifier si le service est configuré, sinon rediriger
    useEffect(() => {
        if (!loading && !error && !isOrderConfigured) {
            console.log('⚠️ Service non configuré, redirection vers la sélection');
            navigate(`/${restaurantSlug}/service`);
        }
    }, [loading, error, isOrderConfigured, navigate, restaurantSlug]);

    // Sélectionner automatiquement la première catégorie
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0].id);
        }
    }, [categories, selectedCategory]);

    // Filtrer les items selon la catégorie sélectionnée
    const filteredItems = items.filter(item =>
        item.category === selectedCategory && item.isAvailable !== false
    );

    // Gestion de l'ouverture du détail d'un item
    const handleOpenItemDetail = (item: MenuItem) => {
        setShowItemDetail(item);
    };

    // Gestion de la fermeture du détail d'un item
    const handleCloseItemDetail = () => {
        setShowItemDetail(null);
    };

    // Gestion de l'ajout au panier depuis la modal avec devise (DÉSACTIVÉ en mode consultation)
    const handleAddToCart = async (item: MenuItem, quantity: number, instructions?: string) => {
        // Mode consultation - commande sur place uniquement
        console.log('Mode consultation : commande sur place uniquement');
        // await addToCart(item, quantity, instructions);
    };

    // Gestion de la navigation
    const handleNavigate = (path: string) => {
        const basePath = `/${restaurantSlug}`;
        navigate(basePath + path.replace('/menu', '/menu').replace('/cart', '/cart'));
    };

    // Obtenir la catégorie actuelle
    const currentCategory = categories.find(c => c.id === selectedCategory);

    // Nom et devise du restaurant
    const restaurantName = restaurantInfo?.nom ||
        (restaurantSlug ? restaurantSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Restaurant');
    const currency = restaurantInfo?.devise || '€';

    // Rendu du loading
    if (loading) {
        return (
            <div className="min-h-screen theme-bg-gradient text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-current mx-auto mb-6 theme-primary-text"></div>
                    <h2 className="text-2xl font-bold mb-2">Chargement du menu</h2>
                    <div className="space-y-1 theme-secondary-text">
                        {themeLoading && <p>• Chargement du thème...</p>}
                        {dataLoading && <p>• Récupération des données...</p>}
                        {infoLoading && <p>• Récupération des informations...</p>}
                    </div>
                    {theme && (
                        <p className="text-xs theme-secondary-text mt-2">
                            🎨 Thème: {theme.nom}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Rendu des erreurs
    if (error) {
        return (
            <div className="min-h-screen theme-bg-gradient text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-900/20 rounded-full p-6 mb-6 inline-block">
                        <AlertCircle size={48} className="theme-alert-text" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 theme-alert-text">Erreur de chargement</h2>
                    <p className="theme-secondary-text mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={refetch}
                            className="theme-primary-gradient text-black px-6 py-3 rounded-full font-bold theme-primary-hover transition-all flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={18} />
                            Réessayer
                        </button>
                        <button
                            onClick={() => navigate('/talya-bercy/service')}
                            className="bg-gray-700 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-600 transition-all block mx-auto"
                        >
                            Retourner à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Rendu si aucune donnée
    if (categories.length === 0) {
        return (
            <div className="min-h-screen theme-bg-gradient text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-gray-800/30 rounded-full p-6 mb-6 inline-block">
                        <ShoppingCart size={48} className="text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Restaurant non trouvé</h2>
                    <p className="theme-secondary-text mb-6">
                        Le restaurant "{restaurantSlug}" n'existe pas ou n'a pas encore été configuré.
                    </p>

                    {/* Suggestions de restaurants */}
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-6">
                        <h3 className="text-blue-300 font-semibold mb-2">Restaurants disponibles :</h3>
                        <button
                            onClick={() => navigate('/talya-bercy/service')}
                            className="bg-blue-700/50 hover:bg-blue-600/50 text-blue-200 px-4 py-2 rounded-lg transition-all"
                        >
                            🏪 Talya Bercy
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/talya-bercy/service')}
                        className="theme-primary-gradient text-black px-6 py-3 rounded-full font-bold theme-primary-hover transition-all"
                    >
                        Retourner à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-bg-gradient text-white">
            {/* Header avec bannière personnalisée */}
            <header className="sticky top-0 z-50 theme-header-bg theme-border border-b theme-shadow">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2 theme-button-primary px-4 py-2 rounded-full theme-shadow-lg">
                        <span className="font-bold text-lg">TC</span>
                    </div>

                    {/* Titre */}
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold theme-gradient-text">
                            Menu
                        </h1>
                    </div>

                    {/* Bouton panier (DÉSACTIVÉ en mode consultation) */}
                    <button
                        onClick={() => {
                            // Mode consultation - afficher un message
                            alert('Commande sur place uniquement. Veuillez faire appel à votre serveur.');
                        }}
                        className="theme-button-secondary px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-all transform hover:scale-105 theme-shadow-lg relative opacity-60 cursor-not-allowed"
                    >
                        <ShoppingCart size={18} />
                        <span className="hidden sm:inline">Consultation</span>
                        {/* Badge mode consultation */}
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                            !
                        </div>
                    </button>
                </div>

                {/* BANNIÈRE PERSONNALISÉE */}
                <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                    <img 
                        src="/assets/restaurant-banner.webp" // Votre image en .webp
                        alt="Bannière restaurant"
                        className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                        onError={(e) => {
                            // Image de fallback si l'image principale n'existe pas
                            console.log('Image principale non trouvée, utilisation du fallback');
                            e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&auto=format";
                        }}
                        onLoad={() => {
                            console.log('✅ Image de bannière chargée avec succès');
                        }}
                    />
                    
                    {/* Overlay gradient moins opaque pour mieux voir l'image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                        <div className="w-full">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-2xl mb-2">
                                {restaurantName}
                            </h2>
                            <p className="text-white/95 text-base sm:text-lg drop-shadow-lg mb-3">
                                Découvrez notre menu authentique
                            </p>
                            
                            {/* Badge mode consultation avec meilleure visibilité */}
                           {/*  <div className="inline-flex items-center gap-2 bg-orange-500/95 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-orange-400/20">
                                <span>👨‍🍳</span>
                                Mode consultation - Commande sur place uniquement
                            </div> */}
                        </div>
                    </div>

                    {/* Debug: Affichage pour vérifier le chargement */}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-30">
                        Banner loaded
                    </div>
                </div>
            </header>

            {/* Categories Slider Component */}
            {categories.length > 0 && (
                <CategoriesSlider
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
            )}

            {/* Category Title */}
            {currentCategory && (
                <div className="px-4 py-6 border-b border-gray-800/30">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">
                            {currentCategory.emoji}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold theme-foreground-text">
                                {currentCategory.name}
                            </h2>
                            <p className="theme-secondary-text text-sm mt-1">
                                {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} disponible{filteredItems.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="h-1 w-24 theme-primary-gradient mt-4 rounded-full"></div>
                </div>
            )}

            {/* Menu Items Component avec devise 
            pb-32 a ajouter quand on reprnd la version de commande
            */}
            <div className="px-4 py-6 ">
                {filteredItems.length > 0 ? (
                    <MenuItems
                        items={filteredItems}
                        onItemClick={handleOpenItemDetail}
                        currency={currency}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-800/30 rounded-full p-6 mb-4 inline-block">
                            <ShoppingCart size={48} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Aucun article disponible</h3>
                        <p className="theme-secondary-text">
                            Cette catégorie ne contient aucun article disponible pour le moment.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation Component */}
           {/*  <BottomNavigation
                currentPath="menu"
                cartItemsCount={getCartItemsCount()}
                onNavigate={handleNavigate}
            /> */}

            {/* Item Detail Modal Component avec devise (MODE CONSULTATION) */}
            <ItemDetailModal
                item={showItemDetail}
                isOpen={!!showItemDetail}
                onClose={handleCloseItemDetail}
                onAddToCart={handleAddToCart}
                currency={currency}
            />
        </div>
    );
};

export default MenuPage;