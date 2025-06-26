// src/components/menu/MenuItems/MenuItems.tsx - Mode consultation
import React from 'react';
import { Star, Flame, Eye } from 'lucide-react';
import './MenuItems.module.css';

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

interface MenuItemsProps {
    items: MenuItem[];
    onItemClick: (item: MenuItem) => void;
    currency?: string;
}

const MenuItems: React.FC<MenuItemsProps> = ({
    items,
    onItemClick,
    currency = '€'
}) => {
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

    return (
        <div className="space-y-6">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="group theme-card-bg backdrop-blur-sm rounded-2xl p-4 theme-border border hover:theme-shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => onItemClick(item)}
                >
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            {/* Badges */}
                            <div className="flex gap-2 mb-3">
                                {item.isPopular && (
                                    <div className="theme-badge-popular px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Flame size={10} />
                                        POPULAIRE
                                    </div>
                                )}
                                {item.isSpecial && (
                                    <div className="theme-badge-special px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Star size={10} />
                                        SPÉCIAL
                                    </div>
                                )}
                            </div>

                            {/* Titre */}
                            <h3 className="text-xl font-bold theme-foreground-text mb-2 group-hover:theme-primary-text transition-colors">
                                {item.emoji} {item.name}
                            </h3>

                            {/* Description */}
                            <p className="theme-secondary-text text-sm mb-4 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>

                            {/* Prix et bouton - MODE CONSULTATION */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold theme-gradient-text">
                                        {item.price}
                                    </span>
                                    <span className="text-sm theme-secondary-text font-medium">{currency}</span>
                                </div>
                                
                                {/* BOUTON DÉSACTIVÉ - Mode consultation */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onItemClick(item); // Ouvre quand même le détail pour consultation
                                    }}
                                    className="bg-gray-600 opacity-60 cursor-default px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all duration-300 theme-shadow text-gray-300"
                                >
                                    <Eye size={18} />
                                    <span className="hidden sm:inline">Voir</span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer theme-shadow-lg hover:theme-shadow transition-all duration-300"
                            onClick={() => onItemClick(item)}
                        >
                            <img
                                src={getImageUrl(item)}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MenuItems;