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
                className="bg-gray-900 rounded-t-3xl w-full h-[70vh] max-h-[70vh] border-t border-gray-700 animate-in slide-in-from-bottom duration-500 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header fixe avec handle et close button */}
                <div className="flex-shrink-0 relative">
                    {/* Handle bar */}
                    <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4 mb-2"></div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tout le contenu scrollable */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {/* Image avec overlay - seulement si photo existe */}
                    {item.photo && (
                        <div className="relative mb-6 mt-2">
                            <img
                                src={getImageUrl(item)}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>

                            {/* Badges overlay */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                {item.isPopular && (
                                    <div className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Flame size={10} />
                                        POPULAIRE
                                    </div>
                                )}
                                {item.isSpecial && (
                                    <div className="bg-purple-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Star size={10} />
                                        SPÉCIAL
                                    </div>
                                )}
                            </div>

                            {/* Prix en overlay */}
                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                    {item.price}DH
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Item info */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-2xl font-bold text-white flex-1">
                                {item.name} {item.emoji}
                            </h3>
                            {/* Prix affiché ici si pas d'image */}
                            {!item.photo && (
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-full px-3 py-1.5 ml-3">
                                    <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                        {item.price}DH
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Badges si pas d'image */}
                        {!item.photo && (
                            <div className="flex gap-2 mb-3">
                                {item.isPopular && (
                                    <div className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Flame size={10} />
                                        POPULAIRE
                                    </div>
                                )}
                                {item.isSpecial && (
                                    <div className="bg-purple-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Star size={10} />
                                        SPÉCIAL
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-gray-300 leading-relaxed text-sm">
                            {item.description}
                        </p>
                    </div>
                    {/* Quantity selector */}
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            📦 Quantité
                        </h4>
                        <div className="flex items-center justify-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl py-4 border border-gray-700/50">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 hover:border-gray-500"
                            >
                                <Minus size={18} className="text-white" />
                            </button>

                            <div className="text-center min-w-[4rem]">
                                <span className="text-3xl font-bold text-white block">
                                    {quantity}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {quantity > 1 ? 'articles' : 'article'}
                                </span>
                            </div>

                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= 99}
                                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Instructions spéciales */}
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            📝 Instructions spéciales
                            <span className="text-sm font-normal text-gray-400">(optionnel)</span>
                        </h4>
                        <div className="relative">
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Ex: Sans oignons, bien cuit, sauce à part, allergie aux fruits de mer..."
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 min-h-[80px]"
                                rows={3}
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

                    {/* Note de service */}
                    <p className="text-center text-xs text-gray-500 mb-4 flex items-center justify-center gap-1">
                        <span>⏱️</span>
                        Les instructions spéciales peuvent affecter le temps de préparation
                    </p>

                    {/* Bouton d'ajout au panier - maintenant dans la zone scrollable */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-3.5 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={22} className="animate-spin" />
                                <span>Ajout en cours...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={22} />
                                <span>
                                    Ajouter au panier • {quantity} {quantity > 1 ? 'articles' : 'article'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* Custom scrollbar */
                .scrollbar-thin {
                    scrollbar-width: thin;
                }

                .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
                    background-color: rgb(75, 85, 99);
                    border-radius: 0.375rem;
                }

                .scrollbar-track-gray-800::-webkit-scrollbar-track {
                    background-color: rgb(31, 41, 55);
                    border-radius: 0.375rem;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                /* Animation personnalisée pour le slide */
                @keyframes slide-in-from-bottom {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .slide-in-from-bottom {
                    animation: slide-in-from-bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Smooth scrolling */
                .overflow-y-auto {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default ItemDetailModal;