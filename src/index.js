import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

// Get Clerk publishable key from environment variable
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key - authentication will not work");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 
            "bg-[#2563EB] hover:bg-[#1D4ED8] text-sm normal-case",
          card: "bg-[#141414] border border-[rgba(255,255,255,0.1)]",
          headerTitle: "text-white",
          headerSubtitle: "text-[rgba(255,255,255,0.7)]",
          socialButtonsBlockButton: 
            "border-[rgba(255,255,255,0.1)] text-white",
          formFieldLabel: "text-[rgba(255,255,255,0.7)]",
          formFieldInput: 
            "bg-[#0A0A0A] border-[rgba(255,255,255,0.1)] text-white",
          footerActionLink: "text-[#3B82F6] hover:text-[#2563EB]"
        }
      }}
    >
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <App />
      </StyledEngineProvider>
    </ClerkProvider>
  </React.StrictMode>
);