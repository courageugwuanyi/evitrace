import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExtensionPopup } from "./components/ExtensionPopup";
import { AuthProvider } from "./lib/auth";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("popup-root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ExtensionPopup
          standalone
          onDismiss={() => {
            window.close();
          }}
          onSave={() => {}}
        />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
);
