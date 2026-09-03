import { StrictMode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./css/cards.css";
import "./css/d.css";
import "./css/mobile.css";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </HelmetProvider>,
);
