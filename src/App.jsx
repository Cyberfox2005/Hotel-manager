// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/shared/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Rooms from "./components/Rooms/Rooms";
import Clients from "./components/Clients/Clients";
import Reservations from "./components/Reservations/Reservations";
import Settings from "./components/Settings/Settings";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="mr-64 flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
