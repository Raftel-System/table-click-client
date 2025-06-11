import React, { useRef } from 'react';
import '../animations.css';

export interface MenuCategory {
    id: string;
    name: string;
    emoji: string;
    isActive?: boolean;
}

interface CategoriesSliderProps {
    categories: MenuCategory[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
                                                               categories,
                                                               selectedCategory,
                                                               onCategoryChange
                                                           }) => {
    const categoriesRef = useRef<HTMLDivElement>(null);

    const scrollToCategory = (categoryId: string) => {
        onCategoryChange(categoryId);

        // Auto-scroll dans la liste des catégories si nécessaire
        if (categoriesRef.current) {
            const categoryElement = categoriesRef.current.querySelector(`[data-category="${categoryId}"]`);
            if (categoryElement) {
                categoryElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    };

    return (
        <div className="sticky top-[120px] z-40 theme-header-bg theme-border border-b">
            <div
                ref={categoriesRef}
                className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide theme-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category) => (
                    <button
                        key={category.id}
                        data-category={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap transition-all duration-300 ${
                            selectedCategory === category.id
                                ? 'theme-category-button active'
                                : 'theme-category-button'
                        }`}
                    >
                        <span className="text-xl">{category.emoji}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoriesSlider;