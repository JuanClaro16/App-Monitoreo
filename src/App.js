import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import RealTimeConsumption from "./pages/RealTimeConsumption";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";
import Alerts from "./pages/Alerts";
import "./App.css";

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-0">
          <Sidebar />
        </div>

        {/* Contenido principal */}
        <div className="col-md-9 col-lg-10 p-4 contenido">
          <Routes>
            <Route path="/" element={<RealTimeConsumption />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
