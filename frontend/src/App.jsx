import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Urls from "./pages/Urls";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/urls"
            element={
              <ProtectedRoute>
                <Urls />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics/:short_code"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
