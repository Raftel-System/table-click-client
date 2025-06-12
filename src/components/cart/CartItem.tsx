// src/components/cart/CartItem.tsx
import React, { useState } from 'react';
import {
    Trash2,
    Plus,
    Minus,
    Edit3,
    Copy,
    MessageSquare,
    CheckCircle,
    Loader2
} from 'lucide-react';
import type { CartItem as CartItemType } from '../../contexts/CartContext';

interface CartItemProps {
    item: CartItemType;
    currency: string;
    isProcessing: boolean;
    onRemove: (cartItemId: string) => void;
    onQuantityChange: (cartItemId: string, quantity: number) => void;
    onDuplicate: (cartItemId: string) => void;
    onUpdateInstructions: (cartItemId: string, instructions: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
                                               item,
                                               currency,
                                               isProcessing,
                                               onRemove,
                                               onQuantityChange,
                                               onDuplicate,
                                               onUpdateInstructions
                                           }) => {
    const [editingInstructions, setEditingInstructions] = useState(false);
    const [tempInstructions, setTempInstructions] = useState('');

    const handleEditInstructions = (currentInstructions: string = '') => {
        setEditingInstructions(true);
        setTempInstructions(currentInstructions);
    };

    const handleSaveInstructions = () => {
        onUpdateInstructions(item.cartItemId, tempInstructions.trim());
        setEditingInstructions(false);
        setTempInstructions('');
    };

    const handleCancelEdit = () => {
        setEditingInstructions(false);
        setTempInstructions('');
    };

    return (
        <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border theme-shadow hover:theme-shadow-lg transition-all">
            {/* En-tête de l'article */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg theme-foreground-text">
                            {item.name} {item.emoji}
                        </h4>
                    </div>
                    <p className="theme-secondary-text text-sm">{item.description}</p>
                    <p className="text-xs theme-secondary-text mt-1">
                        Ajouté il y a {Math.round((Date.now() - item.addedAt) / 60000)} min
                    </p>
                </div>

                {/* Actions rapides */}
                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={() => onDuplicate(item.cartItemId)}
                        disabled={isProcessing}
                        className="theme-accent-text hover:opacity-80 transition-colors p-2 rounded-lg theme-card-bg backdrop-blur-sm"
                        title="Dupliquer l'article"
                    >
                        {isProcessing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Copy size={18} />
                        )}
                    </button>
                    <button
                        onClick={() => onRemove(item.cartItemId)}
                        disabled={isProcessing}
                        className="theme-alert-text hover:opacity-80 transition-colors p-2 rounded-lg theme-card-bg backdrop-blur-sm"
                        title="Supprimer l'article"
                    >
                        {isProcessing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Instructions spéciales */}
            {editingInstructions ? (
                <div className="mb-4 p-4 theme-card-bg rounded-xl theme-border">
                    <label className="block text-sm font-medium theme-foreground-text mb-2">
                        Instructions spéciales
                    </label>
                    <textarea
                        value={tempInstructions}
                        onChange={(e) => setTempInstructions(e.target.value)}
                        placeholder="Ex: Sans oignons, bien cuit, sauce à part..."
                        className="w-full theme-input resize-none focus:theme-primary-focus transition-all"
                        rows={3}
                        maxLength={200}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs theme-secondary-text">
                            {tempInstructions.length}/200
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveInstructions}
                                disabled={isProcessing}
                                className="theme-success-text px-3 py-1 rounded-lg text-sm hover:opacity-80 transition-colors theme-card-bg flex items-center gap-1"
                            >
                                {isProcessing ? (
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
                            onClick={() => handleEditInstructions(item.instructions)}
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
                        onClick={() => handleEditInstructions('')}
                        className="theme-secondary-text hover:theme-primary-text transition-colors text-sm flex items-center gap-2 p-2 rounded-lg theme-card-bg hover:opacity-80"
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
                        onClick={() => onQuantityChange(item.cartItemId, item.quantity - 1)}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-border"
                    >
                        {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Minus size={16} />
                        )}
                    </button>

                    <div className="text-center min-w-[3rem]">
                        <span className="font-bold text-xl theme-foreground-text">
                            {item.quantity}
                        </span>
                        <p className="text-xs theme-secondary-text">
                            article{item.quantity > 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        onClick={() => onQuantityChange(item.cartItemId, item.quantity + 1)}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full theme-button-secondary flex items-center justify-center hover:opacity-80 transition-all theme-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                    </button>
                </div>

                <div className="text-right">
                    <p className="text-sm theme-secondary-text">
                        {item.price} {currency} × {item.quantity}
                    </p>
                    <p className="font-bold text-xl theme-gradient-text">
                        {(item.price * item.quantity).toFixed(2)} {currency}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartItem;