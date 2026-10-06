import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Game crashed with error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: "#151823", color: "#ffffff", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#ff5964" }}>Oops! Game Encountered An Issue</h2>
          <p style={{ maxWidth: "480px", color: "#a0aec0", fontSize: "14px", marginBottom: "20px" }}>
            {this.state.error?.message || "An unexpected error occurred while starting the 3D engine."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ backgroundColor: "#2ec4b6", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            Muat Ulang Game (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// PWA: service worker hanya untuk build produksi (offline-first app shell)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline opsional — diamkan kalau hosting tidak melayani sw.js */
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

