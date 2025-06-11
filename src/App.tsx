// src/App.tsx - Version corrigée avec OrderTypeProvider
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { OrderTypeProvider } from "./contexts/OrderTypeContext"; // ← Import manquant
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import DevPage from "./pages/DevPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServiceSelectionPage from "./pages/ServiceSelectionPage";

const App = () => (
    <BrowserRouter>
        <OrderTypeProvider> {/* ← Provider manquant */}
            <CartProvider>
                <Routes>
                    {/* Routes pour le dev */}
                    <Route path="/dev" element={<DevPage />} />

                    {/* Routes dynamiques par restaurant */}
                    <Route path="/:restaurantSlug/service" element={<ServiceSelectionPage />} />
                    <Route path="/:restaurantSlug/menu" element={<MenuPage />} />
                    <Route path="/:restaurantSlug/cart" element={<CartPage />} />

                    {/* Route par défaut pour toutes les autres URLs */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </CartProvider>
        </OrderTypeProvider>
    </BrowserRouter>
);

export default App;