import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { HomePage } from "./pages/HomePage";
import { Navbar } from "./pages/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { useEffect } from "react";
import axios from "axios";
import { setUser, logout, setLoading } from "./store/slices/authSlice";
import { Setting } from "./pages/Setting";

function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Check auth status on app load
  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true)); // Explicitly set loading to true
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check`, {
          withCredentials: true,
        });
        dispatch(setUser(response.data));
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false)); // Always reset loading
      }
    };

    if (!user) {
      checkAuth();
    }
  }, [dispatch, user]);

  // Show loading screen while checking auth
  if (!user && loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/Auth" />} />
        <Route path="/Auth" element={<Auth />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/Auth" />} />
        <Route path="/*" element={<Navigate to="/" />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;