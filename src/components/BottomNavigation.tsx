// src/components/BottomNavigation.tsx
import React from 'react';
import { Home, ShoppingCart } from 'lucide-react';

interface BottomNavigationProps {
    currentPath: 'menu' | 'cart';
    cartItemsCount: number;
    onNavigate: (path: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
                                                               currentPath,
                                                               cartItemsCount,
                                                               onNavigate
                                                           }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800/50 z-50 shadow-2xl">
            <div className="flex">
                <button
                    onClick={() => onNavigate('/menu')}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 relative transition-all duration-300 ${
                        currentPath === 'menu'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                            : 'text-gray-400 hover:text-yellow-500'
                    }`}
                >
                    <Home size={24} />
                    <span className={`text-xs ${currentPath === 'menu' ? 'font-bold' : ''}`}>
                        Menu
                    </span>
                    {currentPath === 'menu' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                </button>

                <button
                    onClick={() => onNavigate('/cart')}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 relative group transition-all duration-300 ${
                        currentPath === 'cart'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                            : 'text-gray-400 hover:text-yellow-500'
                    }`}
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        {cartItemsCount > 0 && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                                currentPath === 'cart' ? 'bg-red-600' : 'bg-red-500'
                            }`}></div>
                        )}
                    </div>
                    <span className={`text-xs ${currentPath === 'cart' ? 'font-bold' : ''}`}>
                        Panier ({cartItemsCount})
                    </span>
                    {currentPath !== 'cart' && (
                        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BottomNavigation;