import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import TransactionsPage from "./TransactionsPage";
import AnalyticsPage from "./AnalyticsPage";
import WalletPage from "./WalletPage";
import PersonalPage from "./PersonalPage";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import "./App.css";

function MainLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#1a1c22]">
        <Outlet context={{ user, onLogout }} />
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // On login, store user info in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Decode token to get user info (simple base64 decode for demo, use jwt-decode in real app)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        name: payload.name,
        user_id: payload.user_id,
        email: payload.email,
      });
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Protect all routes except login/signup
  if (!user && !["/login", "/signup"].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route
          path="/personal"
          element={<PersonalPage onLogout={handleLogout} user={user} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
