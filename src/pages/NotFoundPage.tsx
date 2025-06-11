// src/pages/NotFoundPage.tsx - Version mise à jour
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
    message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message }) => {
    const navigate = useNavigate();

    const defaultMessage = "Oups ! Cette page n'existe pas";
    const displayMessage = message || defaultMessage;

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/talya-bercy/service');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
            <div className="text-center max-w-lg mx-auto">
                {/* Icône */}
                <div className="bg-orange-500/10 rounded-full p-8 mb-8 inline-block border border-orange-500/20">
                    <AlertTriangle size={80} className="text-orange-500" />
                </div>

                {/* Message principal */}
                <div className="mb-8">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {displayMessage}
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Il semble que vous vous soyez égaré. Pas de souci, cela arrive aux meilleurs d'entre nous !
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                    <button
                        onClick={() => navigate('/talya-bercy/service')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                    >
                        <Home size={18} />
                        Accueil
                    </button>
                </div>

                {/* Message sympa */}
                <div className="mt-12 text-sm text-gray-400 max-w-md mx-auto">
                    <p>
                        💡 Besoin d'aide ? N'hésitez pas à nous contacter directement !
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;