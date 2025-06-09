import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Star, Flame, MessageSquare, Loader2 } from 'lucide-react';
import type {MenuItem} from './MenuItems';

interface ItemDetailModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, quantity: number, instructions?: string) => Promise<void>;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
                                                             item,
                                                             isOpen,
                                                             onClose,
                                                             onAddToCart
                                                         }) => {
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen && item) {
            setQuantity(1);
            setInstructions('');
            setIsProcessing(false);
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore background scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, item]);

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

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!item) return;

        setIsProcessing(true);
        try {
            await onAddToCart(item, quantity, instructions.trim() || undefined);
            onClose();
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-gray-900 rounded-t-3xl w-full max-h-[95vh] overflow-y-auto border-t border-gray-700 animate-in slide-in-from-bottom duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4 mb-2"></div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-700"
                >
                    <X size={20} />
                </button>

                <div className="px-6 pb-8">
                    {/* Image avec overlay */}
                    <div className="relative mb-6 mt-2">
                        <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="w-full h-64 object-cover rounded-2xl shadow-2xl"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>

                        {/* Badges overlay */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            {item.isPopular && (
                                <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Flame size={12} />
                                    POPULAIRE
                                </div>
                            )}
                            {item.isSpecial && (
                                <div className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Star size={12} />
                                    SPÉCIAL
                                </div>
                            )}
                        </div>

                        {/* Prix en overlay */}
                        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                {item.price}DH
                            </span>
                        </div>
                    </div>

                    {/* Item info */}
                    <div className="mb-6">
                        <h3 className="text-3xl font-bold text-white mb-3">
                            {item.name} {item.emoji}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {item.description}
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
                                <span className="text-gray-300">{item.name}</span>
                                <span className="text-white font-medium">{item.price} DH</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Quantité</span>
                                <span className="text-white font-medium">× {quantity}</span>
                            </div>

                            {instructions.trim() && (
                                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                                    <p className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
                                        <MessageSquare size={12} />
                                        Instructions spéciales:
                                    </p>
                                    <p className="text-sm text-blue-200">{instructions.trim()}</p>
                                </div>
                            )}

                            <div className="h-px bg-gray-700 my-4"></div>

                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Total:</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                    {(item.price * quantity).toFixed(2)} DH
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bouton d'ajout au panier */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Ajout en cours...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={24} />
                                <span>
                                    Ajouter au panier • {quantity} {quantity > 1 ? 'articles' : 'article'}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Note de service */}
                    <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                        <span>⏱️</span>
                        Les instructions spéciales peuvent affecter le temps de préparation
                    </p>
                </div>
            </div>


        </div>
    );
};

export default ItemDetailModal;