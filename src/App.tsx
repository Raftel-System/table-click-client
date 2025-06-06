import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";

const App = () => (
    <BrowserRouter>
        <CartProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/menu" replace />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="*" element={<Navigate to="/menu" replace />} />
            </Routes>
        </CartProvider>
    </BrowserRouter>
);

export default App;