// src/pages/CartPage.tsx - Version finale refactorisée
import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ShoppingCart,
    CreditCard,
    Home,
    Settings,
    AlertCircle,
    Loader2
} from 'lucide-react';

import { useCart } from '../contexts/CartContext';
import { useRestaurantInfo } from '../hooks/useRestaurantInfo';
import { useTheme } from '../hooks/useTheme';
import { useOrderType } from '../contexts/OrderTypeContext';
import { OrderService } from '../services/orderService';

// Import des composants cart
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CheckoutModal from '../components/cart/CheckoutModal';

const CartPage: React.FC = () => {
    const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
    const navigate = useNavigate();
    const {
        cartItems,
        isLoading,
        removeFromCart,
        updateQuantity,
        updateInstructions,
        duplicateCartItem,
        clearCart,
        getCartSummary,
        validateCart
    } = useCart();

    const { orderConfig, isOrderConfigured, getOrderDisplayName, getOrderIcon, getEstimatedTime } = useOrderType();
    const { restaurantInfo, loading: infoLoading } = useRestaurantInfo(restaurantSlug || '');
    const { theme, loading: themeLoading, isLightTheme } = useTheme(restaurantSlug || '');

    // États locaux
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Calculs
    const cartSummary = getCartSummary('pickup');
    const cartValidation = validateCart();

    // Informations du restaurant
    const restaurantName = restaurantInfo?.nom ||
        (restaurantSlug ? restaurantSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Restaurant');
    const currency = restaurantInfo?.devise || '€';

    // Navigation avec slug
    const navigateWithSlug = (path: string) => {
        const basePath = `/${restaurantSlug}`;
        navigate(basePath + path);
    };

    // Rediriger vers la sélection de service si pas configuré
    React.useEffect(() => {
        if (!themeLoading && !infoLoading && !isOrderConfigured) {
            console.log('⚠️ Service non configuré, redirection depuis le panier');
            navigate(`/${restaurantSlug}/service`);
        }
    }, [themeLoading, infoLoading, isOrderConfigured, navigate, restaurantSlug]);

    // Gestion des actions
    const handleRemoveItem = useCallback(async (cartItemId: string) => {
        setProcessingItems(prev => new Set(prev).add(cartItemId));
        try {
            await removeFromCart(cartItemId);
        } catch (error) {
            console.error('Erreur suppression:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    }, [removeFromCart]);

    const handleQuantityChange = useCallback(async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 0) return;

        setProcessingItems(prev => new Set(prev).add(cartItemId));
        try {
            if (newQuantity === 0) {
                await removeFromCart(cartItemId);
            } else {
                await updateQuantity(cartItemId, newQuantity);
            }
        } catch (error) {
            console.error('Erreur quantité:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    }, [removeFromCart, updateQuantity]);

    const handleUpdateInstructions = useCallback(async (cartItemId: string, instructions: string) => {
        setProcessingItems(prev => new Set(prev).add(cartItemId));
        try {
            await updateInstructions(cartItemId, instructions);
        } catch (error) {
            console.error('Erreur instructions:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    }, [updateInstructions]);

    const handleDuplicateItem = useCallback(async (cartItemId: string) => {
        setProcessingItems(prev => new Set(prev).add(cartItemId));
        try {
            await duplicateCartItem(cartItemId);
        } catch (error) {
            console.error('Erreur duplication:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    }, [duplicateCartItem]);

    const handleChangeService = () => {
        navigate(`/${restaurantSlug}/service`);
    };

    // Traitement de la commande avec OrderService
    const handleCheckout = async () => {
        if (!cartValidation.isValid) {
            setCheckoutError('Votre panier contient des erreurs: ' + cartValidation.errors.join(', '));
            return;
        }

        if (!isOrderConfigured || !orderConfig) {
            setCheckoutError('Veuillez d\'abord configurer votre service (table ou à emporter)');
            return;
        }

        if (!restaurantSlug) {
            setCheckoutError('Restaurant non identifié');
            return;
        }

        setShowCheckout(true);
        setCheckoutError(null);

        try {
            // Validation des données avec OrderService
            const validation = OrderService.validateOrderData(cartItems, orderConfig, cartSummary.total);
            if (!validation.isValid) {
                throw new Error('Données de commande invalides: ' + validation.errors.join(', '));
            }

            console.log('🚀 Début de traitement de la commande...');

            // Créer la commande dans la Realtime Database
            const result = await OrderService.createOrder(
                restaurantSlug,
                cartItems,
                orderConfig,
                cartSummary.total,
                orderNote.trim() || undefined
            );

            const { orderId, clientNumber } = result;

            // Afficher le résumé de la commande dans les logs
            const orderSummaryForLog = OrderService.generateOrderSummary({
                createdAt: new Date().toISOString(),
                status: 'en_attente',
                items: cartItems.map(item => ({
                    produitId: item.id,
                    nom: item.name,
                    quantite: item.quantity,
                    prix: item.price,
                    instructions: item.instructions
                })),
                total: cartSummary.total,
                mode: orderConfig.type === 'dine-in' ? 'sur_place' : 'emporter',
                ...(orderConfig.type === 'dine-in' && { tableNumber: orderConfig.tableNumber }),
                ...(orderConfig.type === 'takeaway' && clientNumber && { numeroClient: clientNumber }),
                ...(orderNote && { noteCommande: orderNote.trim() })
            });

            console.log(orderSummaryForLog);

            // Simulation d'attente pour l'UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Succès !
            const serviceType = orderConfig.type === 'dine-in'
                ? `Table ${orderConfig.tableNumber}`
                : 'À emporter';

            const clientInfo = orderConfig.type === 'takeaway' && clientNumber
                ? `\nVotre numéro: ${clientNumber}`
                : '';

            alert(`🎉 Commande confirmée !
                \nNuméro de commande: ${orderId}
                \nTotal: ${cartSummary.total.toFixed(2)} ${currency}
                \nService: ${serviceType}${clientInfo}
                \nTemps estimé: ${getEstimatedTime()}`);

            // Vider le panier et rediriger
            await clearCart();
            navigateWithSlug('/menu');

        } catch (error) {
            console.error('❌ Erreur lors de la commande:', error);
            setCheckoutError(error instanceof Error ? error.message : 'Erreur inconnue lors de la commande');
        } finally {
            setShowCheckout(false);
        }
    };

    // Loading avec thème
    if (themeLoading || infoLoading) {
        return (
            <div className="min-h-screen theme-bg-gradient theme-foreground-text flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-current mx-auto mb-6 theme-primary-text"></div>
                    <h2 className="text-2xl font-bold mb-2">Chargement du panier</h2>
                    <div className="space-y-1 theme-secondary-text">
                        {themeLoading && <p>• Application du thème...</p>}
                        {infoLoading && <p>• Récupération des informations...</p>}
                    </div>
                </div>
            </div>
        );
    }

    // Rendu panier vide
    if (cartItems.length === 0 && !showCheckout) {
        return (
            <div className="min-h-screen theme-bg-gradient theme-foreground-text">
                <header className="sticky top-0 z-50 theme-header-bg theme-border border-b">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2 theme-button-primary px-3 py-1 rounded-full">
                            <span className="font-bold text-lg">TC</span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold">Panier</h1>
                            <p className="text-xs theme-secondary-text">{restaurantName}</p>
                        </div>
                        <div className="w-16"></div>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center h-[70vh] px-6">
                    <div className="theme-card-bg rounded-full p-8 mb-6 backdrop-blur-sm">
                        <ShoppingCart size={80} className="theme-secondary-text" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-center theme-foreground-text">
                        Votre panier est vide
                    </h2>
                    <p className="theme-secondary-text text-center mb-8 max-w-md leading-relaxed">
                        Découvrez nos délicieux plats et ajoutez vos favoris au panier pour commencer votre commande
                    </p>
                    <button
                        onClick={() => navigateWithSlug('/menu')}
                        className="theme-button-primary px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 theme-shadow-lg"
                    >
                        🍽️ Découvrir le menu
                    </button>
                </div>

                <div className="fixed bottom-0 left-0 right-0 theme-header-bg theme-border border-t z-50">
                    <div className="flex">
                        <button
                            onClick={() => navigateWithSlug('/menu')}
                            className="flex-1 flex flex-col items-center gap-1 py-4 theme-nav-item hover:theme-primary-text transition-colors"
                        >
                            <Home size={24} />
                            <span className="text-xs">Menu</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center gap-1 py-4 theme-nav-item active">
                            <ShoppingCart size={24} />
                            <span className="text-xs font-bold">Panier (0)</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-bg-gradient theme-foreground-text">
            {/* Header */}
            <header className="sticky top-0 z-50 theme-header-bg theme-border border-b theme-shadow">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 theme-button-primary px-3 py-1 rounded-full">
                        <span className="font-bold text-lg">TC</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold theme-gradient-text">
                            Mon Panier
                        </h1>
                        <p className="text-xs theme-secondary-text">{restaurantName}</p>
                        {/* Indicateur de thème en dev */}
                        {process.env.NODE_ENV === 'development' && theme && (
                            <p className="text-xs theme-accent-text">
                                🎨 {theme.id} ({isLightTheme ? 'clair' : 'sombre'})
                            </p>
                        )}
                    </div>
                    <div className="w-16"></div>
                </div>
            </header>

            {/* Contenu principal */}
            <div className="px-4 py-6 pb-32 max-w-4xl mx-auto">
                {/* Info service configuré */}
                {isOrderConfigured && orderConfig && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold theme-foreground-text mb-4 flex items-center gap-2">
                            🎯 Votre service
                        </h3>
                        <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border theme-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{getOrderIcon()}</div>
                                    <div>
                                        <p className="font-bold text-lg theme-foreground-text">
                                            {getOrderDisplayName()}
                                        </p>
                                        <p className="theme-secondary-text text-sm">
                                            Temps estimé: {getEstimatedTime()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleChangeService}
                                    className="theme-button-secondary px-4 py-2 rounded-xl hover:opacity-80 transition-colors flex items-center gap-2"
                                >
                                    <Settings size={16} />
                                    <span className="hidden sm:inline">Modifier</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Articles du panier */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold theme-foreground-text mb-4 flex items-center gap-2">
                        🛒 Vos articles ({cartSummary.itemsCount})
                    </h3>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <CartItem
                                key={item.cartItemId}
                                item={item}
                                currency={currency}
                                isProcessing={processingItems.has(item.cartItemId)}
                                onRemove={handleRemoveItem}
                                onQuantityChange={handleQuantityChange}
                                onDuplicate={handleDuplicateItem}
                                onUpdateInstructions={handleUpdateInstructions}
                            />
                        ))}
                    </div>
                </div>

                {/* Note pour la commande */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold theme-foreground-text mb-3 flex items-center gap-2">
                        📝 Note pour le restaurant (optionnel)
                    </h3>
                    <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-4 theme-border">
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            className="w-full theme-input resize-none focus:theme-primary-focus transition-all min-h-[80px]"
                            rows={3}
                            placeholder="Ex: Commande pour une fête, allergies particulières, préférences spéciales..."
                            maxLength={300}
                        />
                        <div className="text-right text-xs theme-secondary-text mt-2">
                            {orderNote.length}/300
                        </div>
                    </div>
                </div>

                {/* Résumé de la commande */}
                <CartSummary
                    cartSummary={cartSummary}
                    currency={currency}
                    estimatedTime={getEstimatedTime()}
                />
            </div>

            {/* Bouton de commande fixe */}
            <div className="fixed bottom-0 left-0 right-0 theme-header-bg theme-border border-t p-4 z-50">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        {/* Bouton retour menu */}
                        <button
                            onClick={() => navigateWithSlug('/menu')}
                            className="flex items-center justify-center gap-2 theme-button-secondary px-4 py-3 rounded-xl hover:opacity-80 transition-colors"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline text-sm">Menu</span>
                        </button>

                        {/* Bouton commander */}
                        <button
                            onClick={handleCheckout}
                            disabled={showCheckout || !cartValidation.isValid || isLoading || !isOrderConfigured}
                            className="flex-1 theme-button-primary py-3 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed theme-shadow-lg"
                        >
                            {showCheckout ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>Traitement...</span>
                                </>
                            ) : (
                                <>
                                    <CreditCard size={24} />
                                    <span>Commander • {cartSummary.total.toFixed(2)} {currency}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Messages d'erreur */}
                    {!cartValidation.isValid && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                            <div className="flex items-center gap-2 theme-alert-text text-sm">
                                <AlertCircle size={16} />
                                {cartValidation.errors.join(', ')}
                            </div>
                        </div>
                    )}

                    {!isOrderConfigured && (
                        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-300 text-sm">
                                <AlertCircle size={16} />
                                Service non configuré. Choisissez une table ou à emporter.
                            </div>
                        </div>
                    )}

                    {checkoutError && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                            <div className="flex items-center gap-2 theme-alert-text text-sm">
                                <AlertCircle size={16} />
                                {checkoutError}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de traitement de commande */}
            <CheckoutModal
                isOpen={showCheckout}
                restaurantName={restaurantName}
                cartSummary={cartSummary}
                currency={currency}
                serviceIcon={getOrderIcon()}
                serviceName={getOrderDisplayName()}
            />
        </div>
    );
};

export default CartPage;