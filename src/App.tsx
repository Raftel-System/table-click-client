// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import DevPage from "./pages/DevPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => (
    <BrowserRouter>
        <CartProvider>
            <Routes>

                {/* Routes pour le dev */}
                <Route path="/dev" element={<DevPage />} />

                {/* Routes dynamiques par restaurant */}
                <Route path="/:restaurantSlug/menu" element={<MenuPage />} />
                <Route path="/:restaurantSlug/cart" element={<CartPage />} />

                {/* Route par défaut pour toutes les autres URLs */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </CartProvider>
    </BrowserRouter>
);

export default App;