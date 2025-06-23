// src/hooks/useTheme.ts - Version améliorée
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Import des thèmes locaux
import sunriseTheme from '../assets/sunrise.json';
import daylightTheme from '../assets/daylight.json';
import oceanTheme from '../assets/ocean.json';
import cleanTheme from '../assets/clean.json';
import talyaTheme from '../assets/talya.json';

export interface Theme {
    id: string;
    nom: string;
    description: string;
    type?: 'light' | 'dark'; // Nouveau champ pour détecter le type
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
        cardBackground?: string; // Nouveau champ pour le fond des cartes
        cardBorder?: string; // Nouveau champ pour les bordures
        buttonText?: string; // Nouveau champ pour le texte des boutons
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
    isLightTheme: boolean;
}

// Thèmes disponibles localement avec le nouveau champ type
const LOCAL_THEMES: Record<string, Theme> = {
    sunrise: { ...sunriseTheme, type: 'dark' } as Theme,
    daylight: { ...daylightTheme, type: 'light' } as Theme,
    ocean: { ...oceanTheme, type: 'light' } as Theme,
    clean: { ...cleanTheme, type: 'light' } as Theme,
    talya: {...talyaTheme, type: 'light' } as Theme,
};

// Fonction pour détecter automatiquement si un thème est clair ou sombre
const detectThemeType = (theme: Theme): 'light' | 'dark' => {
    if (theme.type) return theme.type;

    // Analyser la luminosité du background
    const baseColor = theme.colors.background.base;
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculer la luminosité relative
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? 'light' : 'dark';
};

export const useTheme = (restaurantSlug: string): UseThemeReturn => {
    const [theme, setTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightTheme, setIsLightTheme] = useState(false);

    // Fonction pour appliquer le thème au DOM avec détection automatique
    const applyTheme = (selectedTheme: Theme) => {
        const root = document.documentElement;
        const themeType = detectThemeType(selectedTheme);

        // Définir le type de thème
        setIsLightTheme(themeType === 'light');

        // Ajouter l'attribut data-theme-type au body
        document.body.setAttribute('data-theme-type', themeType);

        // Appliquer les variables CSS de base
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

        if (themeType === 'light') {
            // Thème clair : cartes blanches, bordures douces
            root.style.setProperty('--theme-card-bg', selectedTheme.colors.cardBackground || 'rgba(255, 255, 255, 0.95)');
            root.style.setProperty('--theme-border', selectedTheme.colors.cardBorder || 'rgba(148, 163, 184, 0.3)');
            root.style.setProperty('--theme-shadow', 'rgba(0, 0, 0, 0.08)');
            root.style.setProperty('--theme-shadow-lg', '0 4px 15px rgba(0, 0, 0, 0.08)');
            root.style.setProperty('--theme-backdrop', 'rgba(0, 0, 0, 0.4)');
            root.style.setProperty('--theme-button-text', selectedTheme.colors.buttonText || '#ffffff');
        } else {
            // Thème sombre : cartes semi-transparentes sombres
            root.style.setProperty('--theme-card-bg', selectedTheme.colors.cardBackground || 'rgba(31, 41, 55, 0.4)');
            root.style.setProperty('--theme-border', selectedTheme.colors.cardBorder || 'rgba(75, 85, 99, 0.5)');
            root.style.setProperty('--theme-shadow', 'rgba(0, 0, 0, 0.25)');
            root.style.setProperty('--theme-shadow-lg', '0 10px 25px rgba(0, 0, 0, 0.25)');
            root.style.setProperty('--theme-backdrop', 'rgba(0, 0, 0, 0.8)');
            root.style.setProperty('--theme-button-text', selectedTheme.colors.buttonText || '#000000');
        }

        // Mettre à jour le body avec le gradient
        document.body.style.background = `linear-gradient(135deg, ${selectedTheme.colors.background.gradient.from} 0%, ${selectedTheme.colors.background.gradient.via} 50%, ${selectedTheme.colors.background.gradient.to} 100%)`;

        setTheme(selectedTheme);
        console.log(`🎨 Thème appliqué: ${selectedTheme.nom} (${themeType})`);
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
        applyTheme,
        isLightTheme
    };
};