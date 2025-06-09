import React, { useState, useCallback } from 'react';
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
    MapPin,
    Phone,
    Mail,
    User,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

// Types
interface CartItem {
    cartItemId: string;
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    emoji: string;
    quantity: number;
    instructions?: string;
    addedAt: number;
    isPopular?: boolean;
    isSpecial?: boolean;
}

interface CartSummary {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
    itemsCount: number;
    uniqueItemsCount: number;
}

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
    address: string;
}

// Mock data et hooks
const mockCartItems: CartItem[] = [
    {
        cartItemId: 'cart_1',
        id: '1',
        name: 'Petit Déjeuner O2 Ice',
        description: 'Jus Fraîches, Beurre, Confiture, Fromage',
        price: 60,
        category: 'breakfast',
        emoji: '🌅',
        quantity: 2,
        instructions: 'Sans olive noires, jus d\'orange fraîche',
        addedAt: Date.now() - 300000,
        isSpecial: true
    },
    {
        cartItemId: 'cart_2',
        id: '4',
        name: 'Tajine de Poulet aux Olives',
        description: 'Poulet mijoté avec olives vertes',
        price: 70,
        category: 'tajines',
        emoji: '🍲',
        quantity: 1,
        addedAt: Date.now() - 200000,
        isPopular: true
    },
    {
        cartItemId: 'cart_3',
        id: '5',
        name: 'Pizza O2 Ice',
        description: 'Mozzarella, Sauce tomate, jambon de dinde',
        price: 60,
        category: 'pizzas',
        emoji: '🍕',
        quantity: 1,
        instructions: 'Bien cuite, fromage extra',
        addedAt: Date.now() - 100000,
        isSpecial: true
    }
];

const useCart = () => ({
    cartItems: mockCartItems,
    isLoading: false,
    removeFromCart: async (cartItemId: string) => {
        console.log('Supprimer:', cartItemId);
        await new Promise(resolve => setTimeout(resolve, 500));
    },
    updateQuantity: async (cartItemId: string, quantity: number) => {
        console.log('Quantité:', cartItemId, quantity);
        await new Promise(resolve => setTimeout(resolve, 300));
    },
    updateInstructions: async (cartItemId: string, instructions: string) => {
        console.log('Instructions:', cartItemId, instructions);
        await new Promise(resolve => setTimeout(resolve, 300));
    },
    duplicateCartItem: async (cartItemId: string) => {
        console.log('Dupliquer:', cartItemId);
        await new Promise(resolve => setTimeout(resolve, 300));
    },
    clearCart: async () => {
        console.log('Vider panier');
        await new Promise(resolve => setTimeout(resolve, 500));
    },
    getCartSummary: (deliveryType: 'delivery' | 'pickup' = 'delivery'): CartSummary => ({
        subtotal: 250,
        deliveryFee: deliveryType === 'delivery' ? 10 : 0,
        serviceFee: 12.5,
        total: deliveryType === 'delivery' ? 272.5 : 262.5,
        itemsCount: 4,
        uniqueItemsCount: 3
    }),
    validateCart: () => ({ isValid: true, errors: [] })
});

const useNavigate = () => (path: string) => console.log('Navigation:', path);

const CartPage: React.FC = () => {
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

    const navigate = useNavigate();

    // États locaux
    const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
    const [showCheckout, setShowCheckout] = useState(false);
    const [editingInstructions, setEditingInstructions] = useState<string | null>(null);
    const [tempInstructions, setTempInstructions] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    // Calculs
    const cartSummary = getCartSummary(orderType);
    const cartValidation = validateCart();

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

    const handleCheckout = async () => {
        // Validation des informations client
        if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.email.trim()) {
            alert('⚠️ Veuillez remplir toutes vos informations de contact');
            return;
        }

        if (orderType === 'delivery' && !customerInfo.address.trim()) {
            alert('⚠️ Veuillez saisir votre adresse de livraison');
            return;
        }

        if (!cartValidation.isValid) {
            alert('⚠️ Votre panier contient des erreurs: ' + cartValidation.errors.join(', '));
            return;
        }

        setShowCheckout(true);

        try {
            // Simulation de traitement de commande
            await new Promise(resolve => setTimeout(resolve, 3000));

            alert(`🎉 Commande confirmée !\nTotal: ${cartSummary.total.toFixed(2)} DH\nType: ${orderType === 'delivery' ? 'Livraison' : 'À emporter'}`);
            await clearCart();
            navigate('/menu');
        } catch (error) {
            console.error('Erreur commande:', error);
            alert('❌ Erreur lors de la commande. Veuillez réessayer.');
        } finally {
            setShowCheckout(false);
        }
    };

    // Rendu panier vide
    if (cartItems.length === 0 && !showCheckout) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
                <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full">
                            <span className="font-bold text-lg">O2</span>
                        </div>
                        <h1 className="text-xl font-bold">Panier</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center h-[70vh] px-6">
                    <div className="bg-gray-800/30 rounded-full p-8 mb-6">
                        <ShoppingCart size={80} className="text-gray-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-center">Votre panier est vide</h2>
                    <p className="text-gray-400 text-center mb-8 max-w-md leading-relaxed">
                        Découvrez nos délicieux plats et ajoutez vos favoris au panier pour commencer votre commande
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg"
                    >
                        🍽️ Découvrir le menu
                    </button>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 z-50">
                    <div className="flex">
                        <button
                            onClick={() => navigate('/menu')}
                            className="flex-1 flex flex-col items-center gap-1 py-4 text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                            <Home size={24} />
                            <span className="text-xs">Menu</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center gap-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                            <ShoppingCart size={24} />
                            <span className="text-xs font-bold">Panier (0)</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full">
                        <span className="font-bold text-lg">O2</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Mon Panier
                    </h1>
                    <div className="w-16"></div>
                </div>
            </header>

            {/* Contenu principal */}
            <div className="px-4 py-6 pb-32 max-w-4xl mx-auto">
                {/* Type de commande */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🚀 Type de commande
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setOrderType('delivery')}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                orderType === 'delivery'
                                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                            }`}
                        >
                            <div className="text-3xl mb-3">🛵</div>
                            <div className="font-bold text-lg">Livraison</div>
                            <div className="text-sm text-gray-400 mt-1">30-45 min • +{cartSummary.deliveryFee} DH</div>
                        </button>
                        <button
                            onClick={() => setOrderType('pickup')}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                orderType === 'pickup'
                                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                            }`}
                        >
                            <div className="text-3xl mb-3">🏃</div>
                            <div className="font-bold text-lg">À emporter</div>
                            <div className="text-sm text-gray-400 mt-1">15-20 min • Gratuit</div>
                        </button>
                    </div>
                </div>

                {/* Informations client */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        👤 Vos informations
                    </h3>
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <User size={16} />
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Votre nom complet"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Phone size={16} />
                                    Téléphone *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+212 6 XX XX XX XX"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Mail size={16} />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                />
                            </div>

                            {orderType === 'delivery' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <MapPin size={16} />
                                        Adresse de livraison *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Adresse complète"
                                        value={customerInfo.address}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Articles du panier */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🛒 Vos articles ({cartSummary.itemsCount})
                    </h3>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.cartItemId} className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                                {/* En-tête de l'article */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-lg text-white">{item.name} {item.emoji}</h4>
                                            {item.isPopular && (
                                                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">🔥 POPULAIRE</span>
                                            )}
                                            {item.isSpecial && (
                                                <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">⭐ SPÉCIAL</span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm">{item.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ajouté il y a {Math.round((Date.now() - item.addedAt) / 60000)} min
                                        </p>
                                    </div>

                                    {/* Actions rapides */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleDuplicateItem(item.cartItemId)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-400/10"
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
                                            className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
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

                                {/* Instructions spéciales */}
                                {editingInstructions === item.cartItemId ? (
                                    <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Instructions spéciales</label>
                                        <textarea
                                            value={tempInstructions}
                                            onChange={(e) => setTempInstructions(e.target.value)}
                                            placeholder="Ex: Sans oignons, bien cuit, sauce à part..."
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                                            rows={3}
                                            maxLength={200}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">{tempInstructions.length}/200</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveInstructions}
                                                    disabled={processingItems.has(item.cartItemId)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-1"
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
                                                    className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-500 transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : item.instructions ? (
                                    <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
                                                    <MessageSquare size={12} />
                                                    Instructions spéciales:
                                                </p>
                                                <p className="text-sm text-blue-200">{item.instructions}</p>
                                            </div>
                                            <button
                                                onClick={() => handleEditInstructions(item.cartItemId, item.instructions)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
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
                                            className="text-gray-400 hover:text-yellow-500 transition-colors text-sm flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50"
                                        >
                                            <Edit3 size={14} />
                                            Ajouter des instructions spéciales
                                        </button>
                                    </div>
                                )}

                                {/* Contrôles quantité et prix */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 border border-gray-600"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Minus size={16} />
                                            )}
                                        </button>

                                        <div className="text-center min-w-[3rem]">
                                            <span className="font-bold text-xl text-white">{item.quantity}</span>
                                            <p className="text-xs text-gray-400">article{item.quantity > 1 ? 's' : ''}</p>
                                        </div>

                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                                            disabled={processingItems.has(item.cartItemId)}
                                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 border border-gray-600"
                                        >
                                            {processingItems.has(item.cartItemId) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">{item.price} DH × {item.quantity}</p>
                                        <p className="font-bold text-xl text-yellow-500">
                                            {(item.price * item.quantity).toFixed(2)} DH
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Note pour la commande */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        📝 Note pour le restaurant (optionnel)
                    </h3>
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 resize-none transition-all"
                            rows={3}
                            placeholder="Ex: Commande pour une fête, livraison discrète, allergies particulières..."
                            maxLength={300}
                        />
                        <div className="text-right text-xs text-gray-500 mt-2">
                            {orderNote.length}/300
                        </div>
                    </div>
                </div>

                {/* Résumé de la commande */}
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        📊 Résumé de la commande
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Sous-total ({cartSummary.itemsCount} articles)</span>
                            <span className="font-medium">{cartSummary.subtotal.toFixed(2)} DH</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-300">
                            <span>Frais de service (5%)</span>
                            <span className="font-medium">{cartSummary.serviceFee.toFixed(2)} DH</span>
                        </div>

                        {orderType === 'delivery' && (
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Frais de livraison</span>
                                <span className="font-medium">{cartSummary.deliveryFee.toFixed(2)} DH</span>
                            </div>
                        )}

                        <div className="h-px bg-gray-700 my-4"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">Total</span>
                            <span className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                {cartSummary.total.toFixed(2)} DH
                            </span>
                        </div>
                    </div>

                    {/* Temps estimé */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mt-6">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-yellow-500" />
                            <div>
                                <p className="font-medium text-white">
                                    Temps {orderType === 'delivery' ? 'de livraison' : 'de préparation'} estimé
                                </p>
                                <p className="text-sm text-gray-400">
                                    {orderType === 'delivery' ? '30-45 minutes' : '15-20 minutes'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bouton de commande fixe */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4 z-50">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        {/* Bouton retour menu */}
                        <button
                            onClick={() => navigate('/menu')}
                            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-colors"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline text-sm">Menu</span>
                        </button>

                        {/* Bouton commander */}
                        <button
                            onClick={handleCheckout}
                            disabled={showCheckout || !cartValidation.isValid || isLoading}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-3 px-6 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {showCheckout ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>Traitement...</span>
                                </>
                            ) : (
                                <>
                                    <CreditCard size={24} />
                                    <span>Commander • {cartSummary.total.toFixed(2)} DH</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Erreurs de validation */}
                    {!cartValidation.isValid && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {cartValidation.errors.join(', ')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay de traitement de commande */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700 max-w-md w-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold mb-3">Traitement de votre commande</h3>
                        <p className="text-gray-400 mb-6">Veuillez patienter pendant que nous préparons votre commande...</p>

                        {/* Détails de la commande */}
                        <div className="bg-gray-800/50 rounded-xl p-4 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Articles:</span>
                                <span className="text-white font-medium">{cartSummary.itemsCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total:</span>
                                <span className="text-yellow-500 font-bold">{cartSummary.total.toFixed(2)} DH</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white font-medium">
                                    {orderType === 'delivery' ? '🛵 Livraison' : '🏃 À emporter'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-xs text-gray-500">
                            ⏱️ Cette opération peut prendre quelques secondes
                        </div>
                    </div>
                </div>
            )}

            {/* Styles CSS pour les animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slide-up {
                    animation: slideUp 0.4s ease-out;
                }
                
                /* Effet de charge pour les boutons */
                .loading-pulse {
                    position: relative;
                    overflow: hidden;
                }
                
                .loading-pulse::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    animation: loading-sweep 1.5s infinite;
                }
                
                @keyframes loading-sweep {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                
                /* Amélioration du focus */
                .focus-ring:focus {
                    outline: 2px solid rgb(234 179 8);
                    outline-offset: 2px;
                }
                
                /* Animation des cartes */
                .cart-item-card {
                    transition: all 0.3s ease;
                }
                
                .cart-item-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
                
                /* Indicateur de traitement */
                .processing-overlay {
                    position: relative;
                }
                
                .processing-overlay::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: inherit;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .processing-overlay.processing::before {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default CartPage;