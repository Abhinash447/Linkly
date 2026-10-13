import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import "./App.css";
import Urls from "./pages/Urls";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/urls" element={ <Urls />} />
        <Route path="/analytics/:short_code" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
