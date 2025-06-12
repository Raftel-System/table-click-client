// src/components/cart/CartSummary.tsx
import React from 'react';
import { Clock } from 'lucide-react';
import type { CartSummary as CartSummaryType } from '../../contexts/CartContext';

interface CartSummaryProps {
    cartSummary: CartSummaryType;
    currency: string;
    estimatedTime: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
                                                     cartSummary,
                                                     currency,
                                                     estimatedTime
                                                 }) => {
    return (
        <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border theme-shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 theme-foreground-text">
                📊 Résumé de la commande
            </h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center theme-secondary-text">
                    <span>Sous-total ({cartSummary.itemsCount} articles)</span>
                    <span className="font-medium">
                        {cartSummary.subtotal.toFixed(2)} {currency}
                    </span>
                </div>

                <div className="flex justify-between items-center theme-secondary-text">
                    <span>Frais de service (5%)</span>
                    <span className="font-medium">
                        {cartSummary.serviceFee.toFixed(2)} {currency}
                    </span>
                </div>

                <div className="h-px theme-border my-4"></div>

                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold theme-foreground-text">Total</span>
                    <span className="text-3xl font-bold theme-gradient-text">
                        {cartSummary.total.toFixed(2)} {currency}
                    </span>
                </div>
            </div>

            {/* Temps estimé */}
            <div className="theme-card-bg rounded-xl p-4 mt-6 theme-border">
                <div className="flex items-center gap-3">
                    <Clock size={20} className="theme-primary-text" />
                    <div>
                        <p className="font-medium theme-foreground-text">
                            Temps estimé
                        </p>
                        <p className="text-sm theme-secondary-text">
                            {estimatedTime}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;