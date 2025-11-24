import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import JoinHandler from "./components/JoinHandler";
import WelcomeScreen from "./components/WelcomeScreen";
import { AuthProvider } from "./lib/AuthContext";
import Dashboard from "./features/dashboard/Dashboard";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomeScreen />} />
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/join" element={<JoinHandler />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="*" element={<WelcomeScreen />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
