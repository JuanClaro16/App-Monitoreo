import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import RealTimeConsumption from "./pages/RealTimeConsumption";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";
import Alerts from "./pages/Alerts";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar (menú lateral) */}
          <div className="col-md-3 col-lg-2 p-0">
            <Sidebar />
          </div>

          {/* Contenido Principal */}
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
    </Router>
  );
}

export default App;
