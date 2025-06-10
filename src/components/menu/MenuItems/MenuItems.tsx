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
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Flame size={12} />
                                POPULAIRE
                            </div>
                        )}
                        {item.isSpecial && (
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Star size={12} />
                                SPÉCIAL
                            </div>
                        )}
                    </div>

                    {/* Item Card */}
                    <div className="flex gap-4 bg-gray-900/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/30 hover:border-yellow-500/40 transition-all duration-300 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-yellow-500/10">
                        <div className="flex-1">
                            <h3
                                className="text-xl font-bold text-white mb-2 cursor-pointer hover:text-yellow-400 transition-colors duration-300 group-hover:text-yellow-400"
                                onClick={() => onItemClick(item)}
                            >
                                {item.name} {item.emoji}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                        {item.price}
                                    </span>
                                    <span className="text-sm text-gray-400 font-medium">DH</span>
                                </div>
                                <button
                                    onClick={() => onItemClick(item)}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <Plus size={18} />
                                    <span className="hidden sm:inline">Ajouter</span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer shadow-lg group-hover:shadow-xl transition-all duration-300"
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