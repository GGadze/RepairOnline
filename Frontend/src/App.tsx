import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CabinetPage from "./pages/CabinetPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import AuthPage from "./pages/AuthPage";
import ReviewsPage from "./pages/ReviewsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cabinet" element={<CabinetPage />} />
      <Route path="/create-order" element={<CreateOrderPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
    </Routes>
  );
}

export default App;