import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { setupPWA } from "./pwa";
import { setupChunkRecovery } from "./chunkRecovery";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

setupChunkRecovery();
setupPWA();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </AppErrorBoundary>
);
