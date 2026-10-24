import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Start every visit at the top: scroll-linked animations assume it, and smooth scrolling would otherwise fight the restore
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash.startsWith("#work/")) window.scrollTo(0, 0);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
