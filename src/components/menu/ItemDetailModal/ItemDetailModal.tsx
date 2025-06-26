// src/components/menu/ItemDetailModal/ItemDetailModal.tsx - Mode consultation
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Flame, Star, Loader2, Eye } from 'lucide-react';

export interface MenuItem {
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

interface ItemDetailModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, quantity: number, instructions?: string) => Promise<void>;
    currency?: string;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    item,
    isOpen,
    onClose,
    onAddToCart,
    currency = '€'
}) => {
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset quand la modal s'ouvre/ferme
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setInstructions('');
            setIsProcessing(false);
        }
    }, [isOpen]);

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

    // FONCTION DÉSACTIVÉE - Mode consultation uniquement
    const handleAddToCart = async () => {
        // Mode consultation - ne rien faire
        return;
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div
            className="fixed inset-0 theme-backdrop backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="theme-modal-bg rounded-t-3xl w-full h-[70vh] max-h-[70vh] theme-border border-t animate-in slide-in-from-bottom duration-500 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header fixe avec handle et close button */}
                <div className="flex-shrink-0 relative">
                    {/* Handle bar */}
                    <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4 mb-2"></div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 theme-secondary-text hover:theme-foreground-text transition-colors z-10 theme-card-bg backdrop-blur-sm rounded-full p-2 hover:theme-button-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tout le contenu scrollable */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 theme-scrollbar">
                    {/* Image mise en valeur - TOUJOURS affichée */}
                    <div className="relative mb-6 mt-2">
                        <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="w-full h-56 sm:h-64 object-cover rounded-2xl theme-shadow-lg hover:scale-[1.02] transition-transform duration-500"
                            loading="eager"
                        />

                        {/* Gradient overlay plus subtil pour mieux voir l'image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>

                        {/* Badges overlay avec fond semi-transparent */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {item.isPopular && (
                                <div className="theme-badge-popular px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm border border-white/20">
                                    <Flame size={12} />
                                    POPULAIRE
                                </div>
                            )}
                            {item.isSpecial && (
                                <div className="theme-badge-special px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm border border-white/20">
                                    <Star size={12} />
                                    SPÉCIAL
                                </div>
                            )}
                        </div>

                        {/* Indicateur de zoom subtil */}
                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 opacity-70">
                            <Eye size={16} />
                        </div>

                        {/* Prix en overlay en bas à droite */}
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-xl">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-yellow-400">
                                    {item.price}
                                </span>
                                <span className="text-sm opacity-90">{currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* Titre et prix */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold theme-foreground-text mb-2 leading-tight">
                                    {item.emoji} {item.name}
                                </h2>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-3xl font-bold theme-gradient-text">
                                        {item.price}
                                    </span>
                                    <span className="text-lg theme-secondary-text">{currency}</span>
                                </div>
                            </div>
                        </div>

                        <p className="theme-secondary-text leading-relaxed text-sm">
                            {item.description}
                        </p>
                    </div>

                    {/* MODE CONSULTATION - Affichage du prix et quantité pour information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-bold theme-foreground-text mb-3 flex items-center gap-2">
                            📦 Quantité (consultation)
                        </h4>
                        <div className="flex items-center justify-center gap-4 theme-card-bg backdrop-blur-sm rounded-xl py-4 theme-border border opacity-60">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:theme-button-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed theme-border border"
                            >
                                <Minus size={18} className="theme-foreground-text" />
                            </button>

                            <div className="text-center min-w-[4rem]">
                                <span className="text-3xl font-bold theme-foreground-text block">
                                    {quantity}
                                </span>
                                <span className="text-xs theme-secondary-text">
                                    {quantity > 1 ? 'articles' : 'article'}
                                </span>
                            </div>

                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= 99}
                                className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:theme-button-secondary transition-colors theme-border border disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} className="theme-foreground-text" />
                            </button>
                        </div>
                    </div>

                    {/* Instructions spéciales - Mode consultation */}
                    <div className="mb-6">
                        <h4 className="text-lg font-bold theme-foreground-text mb-3 flex items-center gap-2">
                            📝 Instructions spéciales
                            <span className="text-sm font-normal theme-secondary-text">(consultation)</span>
                        </h4>
                        <div className="relative opacity-60">
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Exemple d'instructions : Sans oignons, bien cuit, sauce à part..."
                                className="w-full theme-input resize-none focus:theme-primary-focus transition-all duration-300 min-h-[80px]"
                                rows={3}
                                maxLength={200}
                                disabled
                            />
                            <div className="absolute bottom-3 right-3 text-xs theme-secondary-text theme-card-bg px-2 py-1 rounded">
                                {instructions.length}/200
                            </div>
                        </div>
                        <p className="text-xs theme-secondary-text mt-2 flex items-center gap-1">
                            ℹ️ Mode consultation - Communiquez vos préférences à votre serveur
                        </p>
                    </div>

                    {/* Note de service en mode consultation */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">👨‍🍳</div>
                            <div>
                                <h4 className="font-bold text-orange-200 mb-1">Mode consultation</h4>
                                <p className="text-orange-300/80 text-sm">
                                    Pour commander cet article, veuillez faire appel à votre serveur qui prendra votre commande.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bouton désactivé - Mode consultation */}
                    <button
                        disabled
                        className="w-full bg-gray-600 opacity-50 cursor-not-allowed py-3.5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 theme-shadow-lg mb-4 text-gray-300"
                    >
                        <Eye size={22} />
                        <span>
                            Commande sur place uniquement • {quantity} {quantity > 1 ? 'articles' : 'article'} • {(item.price * quantity).toFixed(2)}{currency}
                        </span>
                    </button>

                    {/* Informations complémentaires */}
                    <div className="text-center text-xs theme-secondary-text space-y-1">
                        <p className="flex items-center justify-center gap-1">
                            <span>💡</span>
                            Consultez les détails et communiquez vos préférences à votre serveur
                        </p>
                        <p className="flex items-center justify-center gap-1">
                            <span>⏱️</span>
                            Les instructions spéciales peuvent affecter le temps de préparation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailModal;