// src/pages/CartPage.tsx - Version mise à jour avec infos restaurant
import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Clock,
    Home,
    Edit3,
    Copy,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Loader2,
    Settings
} from 'lucide-react';

import { useCart } from '../contexts/CartContext';
import { useRestaurantInfo } from '../hooks/useRestaurantInfo';
import { useTheme } from '../hooks/useTheme';
import { useOrderType } from '../contexts/OrderTypeContext';

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
    const [editingInstructions, setEditingInstructions] = useState<string | null>(null);
    const [tempInstructions, setTempInstructions] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

    // Calculs - plus de type livraison/emporter, juste le total
    const cartSummary = getCartSummary('pickup'); // On utilise toujours 'pickup' car plus de livraison
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

    const handleEditInstructions = (cartItemId: string, currentInstructions: string = '') => {
        setEditingInstructions(cartItemId);
        setTempInstructions(currentInstructions);
    };

    const handleSaveInstructions = useCallback(async () => {
        if (!editingInstructions) return;

        setProcessingItems(prev => new Set(prev).add(editingInstructions));
        try {
            await updateInstructions(editingInstructions, tempInstructions.trim());
            setEditingInstructions(null);
            setTempInstructions('');
        } catch (error) {
            console.error('Erreur instructions:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(editingInstructions);
                return newSet;
            });
        }
    }, [editingInstructions, tempInstructions, updateInstructions]);

    const handleCancelEdit = () => {
        setEditingInstructions(null);
        setTempInstructions('');
    };

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

    const handleCheckout = async () => {
        if (!cartValidation.isValid) {
            alert('⚠️ Votre panier contient des erreurs: ' + cartValidation.errors.join(', '));
            return;
        }

        if (!isOrderConfigured) {
            alert('⚠️ Veuillez d\'abord configurer votre service (table ou à emporter)');
            return;
        }

        setShowCheckout(true);

        try {
            // Simulation de traitement de commande
            await new Promise(resolve => setTimeout(resolve, 3000));

            const serviceType = orderConfig?.type === 'dine-in'
                ? `Table ${orderConfig.tableNumber}`
                : 'À emporter';

            alert(`🎉 Commande confirmée !\nTotal: ${cartSummary.total.toFixed(2)} ${currency}\nService: ${serviceType}`);
            await clearCart();
            navigateWithSlug('/menu');
        } catch (error) {
            console.error('Erreur commande:', error);
            alert('❌ Erreur lors de la commande. Veuillez réessayer.');
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

    // Rendu panier vide avec thème dynamique
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
                    <h2 className="text-3xl font-bold mb-3 text-center theme-foreground-text">Votre panier est vide</h2>
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
            {/* Header avec thème dynamique */}
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

            {/* Contenu principal avec thème */}
            <div className="px-4 py-6 pb-32 max-w-4xl mx-auto">
                {/* Info service configuré avec possibilité de modifier */}
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

                {/* Articles du panier avec cartes thématiques */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold theme-foreground-text mb-4 flex items-center gap-2">
                        🛒 Vos articles ({cartSummary.itemsCount})
                    </h3>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.cartItemId} className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border theme-shadow hover:theme-shadow-lg transition-all">
                                {/* En-tête de l'article */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-lg theme-foreground-text">{item.name} {item.emoji}</h4>
                                        </div>
                                        <p className="theme-secondary-text text-sm">{item.description}</p>
                                        <p className="text-xs theme-secondary-text mt-1">
                                            Ajouté il y a {Math.round((Date.now() - item.addedAt) / 60000)} min
                                        </p>
                                    </div>

                                    {/* Actions rapides avec thème */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleDuplicateItem(item.cartItemId)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="theme-accent-text hover:opacity-80 transition-colors p-2 rounded-lg theme-card-bg backdrop-blur-sm"
                                            title="Dupliquer l'article"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Copy size={18} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(item.cartItemId)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="theme-alert-text hover:opacity-80 transition-colors p-2 rounded-lg theme-card-bg backdrop-blur-sm"
                                            title="Supprimer l'article"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Instructions spéciales avec thème */}
                                {editingInstructions === item.cartItemId ? (
                                    <div className="mb-4 p-4 theme-card-bg rounded-xl theme-border">
                                        <label className="block text-sm font-medium theme-foreground-text mb-2">Instructions spéciales</label>
                                        <textarea
                                            value={tempInstructions}
                                            onChange={(e) => setTempInstructions(e.target.value)}
                                            placeholder="Ex: Sans oignons, bien cuit, sauce à part..."
                                            className="w-full theme-input resize-none focus:theme-primary-focus transition-all"
                                            rows={3}
                                            maxLength={200}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs theme-secondary-text">{tempInstructions.length}/200</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveInstructions}
                                                    disabled={processingItems.has(item.cartItemId)}
                                                    className="theme-success-text px-3 py-1 rounded-lg text-sm hover:opacity-80 transition-colors theme-card-bg flex items-center gap-1"
                                                >
                                                    {processingItems.has(item.cartItemId) ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={14} />
                                                    )}
                                                    Sauvegarder
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="theme-secondary-text px-3 py-1 rounded-lg text-sm hover:opacity-80 transition-colors theme-card-bg"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : item.instructions ? (
                                    <div className="mb-4 p-4 theme-accent-gradient-text bg-opacity-10 theme-border rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs theme-accent-text font-medium mb-1 flex items-center gap-1">
                                                    <MessageSquare size={12} />
                                                    Instructions spéciales:
                                                </p>
                                                <p className="text-sm theme-foreground-text">{item.instructions}</p>
                                            </div>
                                            <button
                                                onClick={() => handleEditInstructions(item.cartItemId, item.instructions)}
                                                className="theme-accent-text hover:opacity-80 transition-colors p-1"
                                                title="Modifier les instructions"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => handleEditInstructions(item.cartItemId, '')}
                                            className="theme-secondary-text hover:theme-primary-text transition-colors text-sm flex items-center gap-2 p-2 rounded-lg theme-card-bg hover:opacity-80"
                                        >
                                            <Edit3 size={14} />
                                            Ajouter des instructions spéciales
                                        </button>
                                    </div>
                                )}

                                {/* Contrôles quantité et prix avec devise */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-border"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Minus size={16} />
                                            )}
                                        </button>

                                        <div className="text-center min-w-[3rem]">
                                            <span className="font-bold text-xl theme-foreground-text">{item.quantity}</span>
                                            <p className="text-xs theme-secondary-text">article{item.quantity > 1 ? 's' : ''}</p>
                                        </div>

                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:opacity-80 transition-all theme-border disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm theme-secondary-text">{item.price} {currency} × {item.quantity}</p>
                                        <p className="font-bold text-xl theme-gradient-text">
                                            {(item.price * item.quantity).toFixed(2)} {currency}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Note pour la commande avec thème */}
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

                {/* Résumé de la commande avec thème et devise */}
                <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border mb-8 theme-shadow">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 theme-foreground-text">
                        📊 Résumé de la commande
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center theme-secondary-text">
                            <span>Sous-total ({cartSummary.itemsCount} articles)</span>
                            <span className="font-medium">{cartSummary.subtotal.toFixed(2)} {currency}</span>
                        </div>

                        <div className="flex justify-between items-center theme-secondary-text">
                            <span>Frais de service (5%)</span>
                            <span className="font-medium">{cartSummary.serviceFee.toFixed(2)} {currency}</span>
                        </div>

                        <div className="h-px theme-border my-4"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold theme-foreground-text">Total</span>
                            <span className="text-3xl font-bold theme-gradient-text">
                                {cartSummary.total.toFixed(2)} {currency}
                            </span>
                        </div>
                    </div>

                    {/* Temps estimé avec thème */}
                    <div className="theme-card-bg rounded-xl p-4 mt-6 theme-border">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="theme-primary-text" />
                            <div>
                                <p className="font-medium theme-foreground-text">
                                    Temps estimé
                                </p>
                                <p className="text-sm theme-secondary-text">
                                    {getEstimatedTime()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bouton de commande fixe avec thème et devise */}
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

                    {/* Erreurs de validation */}
                    {!cartValidation.isValid && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                            <div className="flex items-center gap-2 theme-alert-text text-sm">
                                <AlertCircle size={16} />
                                {cartValidation.errors.join(', ')}
                            </div>
                        </div>
                    )}

                    {/* Message si service non configuré */}
                    {!isOrderConfigured && (
                        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-300 text-sm">
                                <AlertCircle size={16} />
                                Service non configuré. Choisissez une table ou à emporter.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay de traitement de commande avec thème et devise */}
            {showCheckout && (
                <div className="fixed inset-0 theme-backdrop backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="theme-modal-bg rounded-2xl p-8 text-center theme-border max-w-md w-full theme-shadow-lg">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 theme-primary-text mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold mb-3 theme-foreground-text">Traitement de votre commande</h3>
                        <p className="theme-secondary-text mb-6">Veuillez patienter pendant que nous préparons votre commande...</p>

                        {/* Détails de la commande avec thème et devise */}
                        <div className="theme-card-bg rounded-xl p-4 text-left space-y-2 backdrop-blur-sm">
                            <div className="flex justify-between text-sm">
                                <span className="theme-secondary-text">Restaurant:</span>
                                <span className="theme-foreground-text font-medium">{restaurantName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="theme-secondary-text">Articles:</span>
                                <span className="theme-foreground-text font-medium">{cartSummary.itemsCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="theme-secondary-text">Total:</span>
                                <span className="theme-primary-text font-bold">{cartSummary.total.toFixed(2)} {currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="theme-secondary-text">Service:</span>
                                <span className="theme-foreground-text font-medium">
                                    {getOrderIcon()} {getOrderDisplayName()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-xs theme-secondary-text">
                            ⏱️ Cette opération peut prendre quelques secondes
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;