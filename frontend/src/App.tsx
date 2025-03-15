import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Chat } from "./pages/Chat";
import { HomePage } from "./pages/HomePage";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { Navbar } from "./pages/Navbar";

function App() {
  const { user } = useSelector( (state : RootState) => state.auth);
  console.log(user);
  
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={user ?  <HomePage /> : < Navigate to="/Auth" />} />
        <Route path="/Auth" element={  <Auth />  } />
        <Route path="/profile" element={  <Profile />  } />
        <Route path="/chat" element={user ? <Chat /> : < Navigate to="/Auth" />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;