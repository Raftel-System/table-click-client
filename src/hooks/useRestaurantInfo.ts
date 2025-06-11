// src/hooks/useRestaurantInfo.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RestaurantInfo {
    nom: string;
    devise: string;
}

interface UseRestaurantInfoReturn {
    restaurantInfo: RestaurantInfo | null;
    loading: boolean;
    error: string | null;
}

export const useRestaurantInfo = (restaurantSlug: string): UseRestaurantInfoReturn => {
    const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurantInfo = async () => {
            if (!restaurantSlug) {
                setError('Slug du restaurant manquant');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log(`🔄 Récupération des infos pour: ${restaurantSlug}`);

                // Récupération de la config du restaurant
                const configRef = doc(db, 'restaurants', restaurantSlug, 'settings', 'config');
                const configSnap = await getDoc(configRef);

                if (!configSnap.exists()) {
                    throw new Error(`Configuration non trouvée pour ${restaurantSlug}`);
                }

                const data = configSnap.data();

                if (!data.nom || !data.devise) {
                    throw new Error('Nom ou devise manquant dans la configuration');
                }

                const info: RestaurantInfo = {
                    nom: data.nom,
                    devise: data.devise
                };

                setRestaurantInfo(info);
                console.log(`✅ Infos restaurant récupérées:`, info);

            } catch (err) {
                console.error('❌ Erreur lors de la récupération des infos:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');

                // Fallback avec nom formaté depuis le slug
                if (restaurantSlug) {
                    setRestaurantInfo({
                        nom: restaurantSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        devise: '€' // Devise par défaut
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantInfo();
    }, [restaurantSlug]);

    return {
        restaurantInfo,
        loading,
        error
    };
};