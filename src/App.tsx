import "./App.css";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NavBar from "./components/NavBar/NavBar";
import Contact from "./pages/Contact";
import ConsultasInbox from "./pages/ConsultasInbox";
import Dashboard from "./pages/Dashboard";
import GestionComercial from "./pages/GestionComercial";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Lotes from "./pages/Lotes";
import MiPanelUsuario from "./pages/MiPanelUsuario";
import Register from "./pages/Register";
import SetupAdmin from "./pages/SetupAdmin";

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-admin" element={<SetupAdmin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mi-panel"
          element={
            <ProtectedRoute>
              <MiPanelUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion"
          element={
            <ProtectedRoute allowedRoles={["admin", "empleado"]}>
              <GestionComercial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultas"
          element={
            <ProtectedRoute allowedRoles={["admin", "empleado"]}>
              <ConsultasInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
