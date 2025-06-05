import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Clock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [orderType, setOrderType] = useState<'takeaway' | 'delivery'>('delivery');

    const handleRemoveItem = (itemId: string) => {
        removeFromCart(itemId);
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity === 0) {
            const item = cartItems.find(i => i.id === itemId);
            if (item) {
                handleRemoveItem(itemId);
            }
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = async () => {
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
            alert('Veuillez remplir vos informations de contact');
            return;
        }

        if (orderType === 'delivery' && !customerInfo.address) {
            alert('Veuillez saisir votre adresse de livraison');
            return;
        }

        if (cartItems.length === 0) {
            alert('Votre panier est vide');
            return;
        }

        setShowCheckout(true);

        try {
            // Simulation d'une commande
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert(`🎉 Commande confirmée ! Total: ${total.toFixed(2)} DH`);
            clearCart();
            navigate('/menu');

        } catch (err) {
            console.log('err', err);
            alert('❌ Erreur lors de la commande. Veuillez réessayer.');
            setShowCheckout(false);
        }
    };

    const deliveryFee = orderType === 'delivery' ? 10 : 0;
    const subtotal = getCartTotal();
    const total = subtotal + deliveryFee;

    if (cartItems.length === 0 && !showCheckout) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
                    <div className="flex items-center justify-between px-4 py-3">
                        {/* Logo */}
                        <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full">
                            <span className="font-bold text-lg">O2</span>
                        </div>

                        {/* Titre centré */}
                        <h1 className="text-xl font-bold">Panier</h1>

                        {/* Spacer pour équilibrer */}
                        <div className="w-16"></div>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center h-[80vh] px-6">
                    <ShoppingCart size={80} className="text-gray-600 mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
                    <p className="text-gray-400 text-center mb-6">
                        Ajoutez des articles depuis notre menu pour commencer votre commande
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="bg-yellow-500 text-black px-8 py-3 rounded-full font-medium hover:bg-yellow-400 transition-colors"
                    >
                        Voir le menu
                    </button>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
                    <div className="flex">
                        <button
                            onClick={() => navigate('/menu')}
                            className="flex-1 flex flex-col items-center gap-1 py-4 text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                            <Home size={24} />
                            <span className="text-xs">Menu</span>
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="flex-1 flex flex-col items-center gap-1 py-4 bg-yellow-500 text-black"
                        >
                            <ShoppingCart size={24} />
                            <span className="text-xs font-medium">Panier (0)</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full">
                        <span className="font-bold text-lg">O2</span>
                    </div>

                    {/* Titre centré */}
                    <h1 className="text-xl font-bold">Mon Panier</h1>

                    {/* Spacer pour équilibrer */}
                    <div className="w-16"></div>
                </div>
            </header>

            {/* Cart Items */}
            <div className="px-4 py-6 pb-32">
                {/* Order Type Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Type de commande</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setOrderType('delivery')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                                orderType === 'delivery'
                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                            <div className="text-2xl mb-1">🛵</div>
                            <div className="font-semibold">Livraison</div>
                            <div className="text-xs opacity-75">30-45 min • +10 DH</div>
                        </button>
                        <button
                            onClick={() => setOrderType('takeaway')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                                orderType === 'takeaway'
                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                            <div className="text-2xl mb-1">🏃</div>
                            <div className="font-semibold">À emporter</div>
                            <div className="text-xs opacity-75">15-20 min • Gratuit</div>
                        </button>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">Vos informations</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nom complet</label>
                            <input
                                type="text"
                                placeholder="Nom complet"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Numéro de téléphone</label>
                            <input
                                type="tel"
                                placeholder="Numéro de téléphone"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        {orderType === 'delivery' && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Adresse de livraison</label>
                                <input
                                    type="text"
                                    placeholder="Adresse de livraison complète"
                                    value={customerInfo.address}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Items List */}
                {cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                <p className="text-gray-400 text-sm capitalize">{item.category.replace('s', '')}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-400 transition-colors p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-medium text-lg w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <span className="font-bold text-lg text-yellow-500">
                                {(item.price * item.quantity).toFixed(2)} DH
                            </span>
                        </div>
                    </div>
                ))}

                {/* Order Summary */}
                <div className="bg-gray-900/50 rounded-lg p-6 mt-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Résumé de la commande</h3>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-gray-400">
                            <span>Sous-total</span>
                            <span>{subtotal.toFixed(2)} DH</span>
                        </div>
                        {orderType === 'delivery' && (
                            <div className="flex justify-between text-gray-400">
                                <span>Frais de livraison</span>
                                <span>{deliveryFee.toFixed(2)} DH</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-700 my-3"></div>
                        <div className="flex justify-between text-xl font-bold text-white">
                            <span>Total</span>
                            <span className="text-yellow-500">{total.toFixed(2)} DH</span>
                        </div>
                    </div>

                    {/* Delivery Time */}
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-yellow-500" />
                            <div>
                                <p className="font-medium">Temps {orderType === 'delivery' ? 'de livraison' : 'de préparation'} estimé</p>
                                <p className="text-sm text-gray-400">
                                    {orderType === 'delivery' ? '30-45 minutes' : '15-20 minutes'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add Note */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Note pour la cuisine (optionnel)
                        </label>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                            rows={3}
                            placeholder="Ex: Sans oignons, bien cuit..."
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Checkout Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 p-4">
                <div className="flex gap-2 mb-4">
                    {/* Navigation */}
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <Home size={18} />
                        <span className="text-sm">Menu</span>
                    </button>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={showCheckout || cartItems.length === 0}
                        className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {showCheckout ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                <span>Traitement...</span>
                            </>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                <span>Commander • {total.toFixed(2)} DH</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold mb-2">Traitement de votre commande</h3>
                        <p className="text-gray-400">Veuillez patienter...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;