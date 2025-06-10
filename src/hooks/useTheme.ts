// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Import des thèmes locaux
import sunriseTheme from '../assets/sunrise.json';
import daylightTheme from '../assets/daylight.json';
import oceanTheme from '../assets/ocean.json';
import cleanTheme from '../assets/clean.json';

export interface Theme {
    id: string;
    nom: string;
    description: string;
    colors: {
        primary: {
            from: string;
            to: string;
        };
        accent: {
            from: string;
            to: string;
        };
        background: {
            gradient: {
                from: string;
                via: string;
                to: string;
            };
            base: string;
        };
        foreground: string;
        textSecondary: string;
        alert: string;
        success: string;
    };
    gradients: {
        action: string;
        background: string;
    };
    createdAt: string;
    isDefault: boolean;
}

interface UseThemeReturn {
    theme: Theme | null;
    loading: boolean;
    error: string | null;
    applyTheme: (theme: Theme) => void;
}

// Thèmes disponibles localement
const LOCAL_THEMES: Record<string, Theme> = {
    sunrise: sunriseTheme as Theme,
    daylight: daylightTheme as Theme,
    ocean: oceanTheme as Theme,
    clean: cleanTheme as Theme
};

export const useTheme = (restaurantSlug: string): UseThemeReturn => {
    const [theme, setTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour appliquer le thème au DOM
    const applyTheme = (selectedTheme: Theme) => {
        const root = document.documentElement;

        // Appliquer les variables CSS
        root.style.setProperty('--theme-primary-from', selectedTheme.colors.primary.from);
        root.style.setProperty('--theme-primary-to', selectedTheme.colors.primary.to);
        root.style.setProperty('--theme-accent-from', selectedTheme.colors.accent.from);
        root.style.setProperty('--theme-accent-to', selectedTheme.colors.accent.to);
        root.style.setProperty('--theme-bg-from', selectedTheme.colors.background.gradient.from);
        root.style.setProperty('--theme-bg-via', selectedTheme.colors.background.gradient.via);
        root.style.setProperty('--theme-bg-to', selectedTheme.colors.background.gradient.to);
        root.style.setProperty('--theme-bg-base', selectedTheme.colors.background.base);
        root.style.setProperty('--theme-foreground', selectedTheme.colors.foreground);
        root.style.setProperty('--theme-text-secondary', selectedTheme.colors.textSecondary);
        root.style.setProperty('--theme-alert', selectedTheme.colors.alert);
        root.style.setProperty('--theme-success', selectedTheme.colors.success);

        // Mettre à jour le body avec le gradient
        document.body.style.background = `linear-gradient(135deg, ${selectedTheme.colors.background.gradient.from} 0%, ${selectedTheme.colors.background.gradient.via} 50%, ${selectedTheme.colors.background.gradient.to} 100%)`;

        setTheme(selectedTheme);
        console.log(`🎨 Thème appliqué: ${selectedTheme.nom}`);
    };

    // Charger le thème du restaurant
    useEffect(() => {
        const loadTheme = async () => {
            if (!restaurantSlug) {
                setError('Slug du restaurant manquant');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log(`🔄 Chargement du thème pour: ${restaurantSlug}`);

                // 1. Récupérer la config du restaurant
                const configRef = doc(db, 'restaurants', restaurantSlug, 'settings', 'config');
                const configSnap = await getDoc(configRef);

                if (!configSnap.exists()) {
                    throw new Error(`Configuration non trouvée pour ${restaurantSlug}`);
                }

                const config = configSnap.data();
                const themeId = config.theme || 'sunrise'; // Fallback sur sunrise

                console.log(`🎨 Thème configuré: ${themeId}`);

                // 2. Chercher d'abord dans les thèmes locaux
                if (LOCAL_THEMES[themeId]) {
                    console.log(`✅ Thème local trouvé: ${themeId}`);
                    applyTheme(LOCAL_THEMES[themeId]);
                    return;
                }

                // 3. Si pas trouvé localement, chercher dans Firebase
                console.log(`🔍 Recherche du thème dans Firebase: ${themeId}`);
                const themeRef = doc(db, 'app', 'settings', 'themes', themeId);
                const themeSnap = await getDoc(themeRef);

                if (themeSnap.exists()) {
                    const firebaseTheme = themeSnap.data() as Theme;
                    console.log(`✅ Thème Firebase trouvé: ${themeId}`);
                    applyTheme(firebaseTheme);
                    return;
                }

                // 4. Fallback sur le thème par défaut
                console.warn(`⚠️ Thème "${themeId}" non trouvé, utilisation du thème par défaut`);
                applyTheme(LOCAL_THEMES.sunrise);

            } catch (err) {
                console.error('❌ Erreur lors du chargement du thème:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');

                // En cas d'erreur, utiliser le thème par défaut
                if (LOCAL_THEMES.sunrise) {
                    applyTheme(LOCAL_THEMES.sunrise);
                }
            } finally {
                setLoading(false);
            }
        };

        loadTheme();
    }, [restaurantSlug]);

    return {
        theme,
        loading,
        error,
        applyTheme
    };
};