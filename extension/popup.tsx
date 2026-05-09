import React from "react";
import { createRoot } from "react-dom/client";
import { Calculator } from "../components/calculator/Calculator";
import "../app/globals.css";

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <div style={{ width: 380, padding: 12 }}>
      <header style={{ marginBottom: 8, fontFamily: "Inter, system-ui, sans-serif" }}>
        <strong>kdpcover.pro</strong>
        <a
          href="https://kdpcover.pro?utm_source=ext"
          target="_blank"
          rel="noreferrer"
          style={{ float: "right", fontSize: 12, color: "#82986D" }}
        >
          Open full site →
        </a>
      </header>
      <Calculator compact silent />
    </div>
  </React.StrictMode>,
);
