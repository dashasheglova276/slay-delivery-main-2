import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Recipes from "./pages/Recipes";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="stage">
      <div className="app">
        <Header />
        <main className="content" key={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </div>
  );
}
