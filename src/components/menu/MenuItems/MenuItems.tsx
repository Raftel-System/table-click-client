import React from 'react';
import { Star, Flame, Plus } from 'lucide-react';
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
}

const MenuItems: React.FC<MenuItemsProps> = ({ items, onItemClick }) => {
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
                <div key={item.id} className="group relative">
                    {/* Badges */}
                    <div className="flex gap-2 mb-3">
                        {item.isPopular && (
                            <div className="theme-badge-popular px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 theme-shadow-lg">
                                <Flame size={12} />
                                POPULAIRE
                            </div>
                        )}
                        {item.isSpecial && (
                            <div className="theme-badge-special px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 theme-shadow-lg">
                                <Star size={12} />
                                SPÉCIAL
                            </div>
                        )}
                    </div>

                    {/* Item Card */}
                    <div className="flex gap-4 theme-menu-card rounded-2xl p-5 transition-all duration-300 group">
                        <div className="flex-1">
                            <h3
                                className="text-xl font-bold theme-foreground-text mb-2 cursor-pointer hover:theme-primary-text transition-colors duration-300"
                                onClick={() => onItemClick(item)}
                            >
                                {item.name} {item.emoji}
                            </h3>
                            <p className="theme-secondary-text text-sm mb-4 leading-relaxed line-clamp-2">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold theme-gradient-text">
                                        {item.price}
                                    </span>
                                    <span className="text-sm theme-secondary-text font-medium">DH</span>
                                </div>
                                <button
                                    onClick={() => onItemClick(item)}
                                    className="theme-button-primary px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 theme-shadow-lg"
                                >
                                    <Plus size={18} />
                                    <span className="hidden sm:inline">Ajouter</span>
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