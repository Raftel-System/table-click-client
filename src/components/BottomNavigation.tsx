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
        <div className="fixed bottom-0 left-0 right-0 theme-header-bg theme-border border-t z-50 theme-shadow">
            <div className="flex">
                <button
                    onClick={() => onNavigate('/menu')}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 relative transition-all duration-300 ${
                        currentPath === 'menu'
                            ? 'theme-nav-item active'
                            : 'theme-nav-item'
                    }`}
                >
                    <Home size={24} />
                    <span className={`text-xs ${currentPath === 'menu' ? 'font-bold' : ''}`}>
                        Menu
                    </span>
                </button>

                <button
                    onClick={() => onNavigate('/cart')}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 relative group transition-all duration-300 ${
                        currentPath === 'cart'
                            ? 'theme-nav-item active'
                            : 'theme-nav-item'
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
                </button>
            </div>
        </div>
    );
};

export default BottomNavigation;