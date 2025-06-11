// src/pages/ServiceSelectionPage.tsx - Version simplifiée
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { useOrderType, type OrderConfig } from '../contexts/OrderTypeContext';
import { useTheme } from '../hooks/useTheme';

const ServiceSelectionPage: React.FC = () => {
    const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
    const navigate = useNavigate();
    const { setOrderConfig, orderConfig } = useOrderType();
    const { theme, loading: themeLoading } = useTheme(restaurantSlug || '');

    // États locaux
    const [selectedType, setSelectedType] = useState<'dine-in' | 'takeaway' | null>(
        orderConfig?.type || null
    );
    const [tableNumber, setTableNumber] = useState<string>(
        orderConfig?.tableNumber?.toString() || ''
    );
    const [errors, setErrors] = useState<string[]>([]);

    const restaurantName = restaurantSlug
        ? restaurantSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Restaurant';

    const validateAndSubmit = () => {
        const newErrors: string[] = [];

        if (!selectedType) {
            newErrors.push('Veuillez sélectionner un type de service');
        }

        if (selectedType === 'dine-in') {
            if (!tableNumber.trim()) {
                newErrors.push('Numéro de table requis');
            } else {
                const tableNum = parseInt(tableNumber.trim());
                if (isNaN(tableNum) || tableNum < 1 || tableNum > 999) {
                    newErrors.push('Numéro de table invalide (1-999)');
                }
            }
        }

        setErrors(newErrors);

        if (newErrors.length === 0 && selectedType) {
            const config: OrderConfig = {
                type: selectedType,
                tableNumber: selectedType === 'dine-in' ? parseInt(tableNumber.trim()) : undefined
            };

            setOrderConfig(config);
            navigate(`/${restaurantSlug}/menu`);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    // Loading avec thème
    if (themeLoading) {
        return (
            <div className="min-h-screen theme-bg-gradient theme-foreground-text flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-current mx-auto mb-6 theme-primary-text"></div>
                    <h2 className="text-2xl font-bold mb-2">Chargement</h2>
                    <p className="theme-secondary-text">Préparation de votre expérience...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-bg-gradient theme-foreground-text">
            {/* Header */}
            <header className="sticky top-0 z-50 theme-header-bg theme-border border-b theme-shadow">
                <div className="flex items-center px-4 py-3">
                    <button
                        onClick={handleBack}
                        className="theme-button-secondary p-2 rounded-full mr-4 hover:opacity-80 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold theme-gradient-text">
                            Type de service
                        </h1>
                        <p className="text-xs theme-secondary-text">{restaurantName}</p>
                        {/* Indicateur de thème en dev */}
                        {process.env.NODE_ENV === 'development' && theme && (
                            <p className="text-xs theme-accent-text">🎨 {theme.id}</p>
                        )}
                    </div>

                    <div className="w-10"></div>
                </div>
            </header>

            {/* Contenu principal */}
            <div className="px-4 py-8 max-w-lg mx-auto pb-32">
                {/* Introduction */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h2 className="text-2xl font-bold theme-foreground-text mb-3">
                        Comment souhaitez-vous commander ?
                    </h2>
                </div>

                {/* Sélection du type de service */}
                <div className="mb-8">
                    <div className="space-y-4">
                        {/* Option Sur place */}
                        <button
                            onClick={() => setSelectedType('dine-in')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 theme-card-bg backdrop-blur-sm text-left ${
                                selectedType === 'dine-in'
                                    ? 'theme-border border-opacity-100 theme-shadow-lg scale-105'
                                    : 'theme-border border-opacity-50 hover:border-opacity-75'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">🪑</div>
                                    <div>
                                        <h3 className="font-bold text-lg theme-foreground-text">Sur place</h3>
                                        <p className="theme-secondary-text text-sm">Service à table</p>
                                    </div>
                                </div>
                                {selectedType === 'dine-in' && (
                                    <Check size={24} className="theme-primary-text" />
                                )}
                            </div>
                        </button>

                        {/* Option À emporter */}
                        <button
                            onClick={() => setSelectedType('takeaway')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 theme-card-bg backdrop-blur-sm text-left ${
                                selectedType === 'takeaway'
                                    ? 'theme-border border-opacity-100 theme-shadow-lg scale-105'
                                    : 'theme-border border-opacity-50 hover:border-opacity-75'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">🥡</div>
                                    <div>
                                        <h3 className="font-bold text-lg theme-foreground-text">À emporter</h3>
                                        <p className="theme-secondary-text text-sm">Récupération au comptoir</p>
                                    </div>
                                </div>
                                {selectedType === 'takeaway' && (
                                    <Check size={24} className="theme-primary-text" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Saisie numéro de table (si sur place) */}
                {selectedType === 'dine-in' && (
                    <div className="mb-8">
                        <div className="theme-card-bg backdrop-blur-sm rounded-2xl p-6 theme-border">
                            <label className="block text-lg font-bold theme-foreground-text mb-4">
                                Numéro de table
                            </label>
                            <input
                                type="number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full theme-input focus:theme-primary-focus transition-all text-center text-2xl font-bold py-4"
                                placeholder="Ex: 12"
                                min="1"
                                max="999"
                                inputMode="numeric"
                            />
                            <p className="text-xs theme-secondary-text mt-2 text-center">
                                Saisissez le numéro de votre table
                            </p>
                        </div>
                    </div>
                )}

                {/* Erreurs */}
                {errors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="theme-alert-text flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="theme-alert-text font-medium mb-2">Erreur :</p>
                                <ul className="space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index} className="theme-alert-text text-sm">• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message informatif */}
                <div className="mb-8 p-4 theme-card-bg backdrop-blur-sm rounded-xl theme-border">
                    <p className="theme-accent-text text-sm text-center font-medium">
                        💡 Vous pourrez modifier votre choix plus tard depuis le menu
                    </p>
                </div>
            </div>

            {/* Bouton de validation fixe */}
            <div className="fixed bottom-0 left-0 right-0 theme-header-bg theme-border border-t p-4 z-50">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={validateAndSubmit}
                        disabled={!selectedType || (selectedType === 'dine-in' && !tableNumber.trim())}
                        className="w-full theme-button-primary py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed theme-shadow-lg flex items-center justify-center gap-3"
                    >
                        <span>Confirmer</span>
                        <span className="text-xl">✓</span>
                    </button>

                    {!selectedType && (
                        <p className="text-center text-xs theme-secondary-text mt-2">
                            Choisissez votre type de service
                        </p>
                    )}

                    {selectedType === 'dine-in' && !tableNumber.trim() && (
                        <p className="text-center text-xs theme-secondary-text mt-2">
                            Saisissez le numéro de votre table
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceSelectionPage;