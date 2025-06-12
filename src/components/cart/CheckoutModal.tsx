// src/components/cart/CheckoutModal.tsx
import React from 'react';
import type { CartSummary } from '../../contexts/CartContext';

interface CheckoutModalProps {
    isOpen: boolean;
    restaurantName: string;
    cartSummary: CartSummary;
    currency: string;
    serviceIcon: string;
    serviceName: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
                                                         isOpen,
                                                         restaurantName,
                                                         cartSummary,
                                                         currency,
                                                         serviceIcon,
                                                         serviceName
                                                     }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 theme-backdrop backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="theme-modal-bg rounded-2xl p-8 text-center theme-border max-w-md w-full theme-shadow-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 theme-primary-text mx-auto mb-6"></div>

                <h3 className="text-2xl font-bold mb-3 theme-foreground-text">
                    Traitement de votre commande
                </h3>

                <p className="theme-secondary-text mb-6">
                    Veuillez patienter pendant que nous enregistrons votre commande...
                </p>

                {/* Détails de la commande */}
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
                        <span className="theme-primary-text font-bold">
                            {cartSummary.total.toFixed(2)} {currency}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="theme-secondary-text">Service:</span>
                        <span className="theme-foreground-text font-medium">
                            {serviceIcon} {serviceName}
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-xs theme-secondary-text">
                    🔄 Enregistrement dans la base de données...
                    <div className="mt-2 text-center">
                        🔢 Génération automatique de votre numéro d'appel...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;