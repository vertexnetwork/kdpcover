import React from "react";
import { createRoot } from "react-dom/client";
import { Calculator } from "../components/calculator/Calculator";
import { networkTools } from "../lib/content/network";
import "../app/globals.css";

const FONT = "Inter, system-ui, sans-serif";
const SAGE_700 = "#4F5D40";
const WARM = "#C97B5C";

const sister = networkTools.filter((t) => t.url !== "https://kdpcover.pro");

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <div style={{ width: 380, padding: 12, fontFamily: FONT }}>
      <header style={{ marginBottom: 8 }}>
        <strong>kdpcover.pro</strong>
        <a
          href="https://kdpcover.pro?utm_source=ext"
          target="_blank"
          rel="noreferrer"
          style={{ float: "right", fontSize: 12, color: SAGE_700 }}
        >
          Open full site →
        </a>
      </header>
      <Calculator compact silent />
      <p
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #cdd9b8",
          fontSize: 11,
          color: SAGE_700,
          lineHeight: 1.4,
        }}
      >
        More tools you might need:{" "}
        {sister.map((t, i) => (
          <React.Fragment key={t.url}>
            <a
              href={`${t.url}?utm_source=ext&utm_medium=kdpcover`}
              target="_blank"
              rel="noreferrer"
              style={{ color: WARM, textDecoration: "none" }}
            >
              {t.name.replace(/^https?:\/\//, "")}
            </a>
            {i < sister.length - 1 ? " · " : ""}
          </React.Fragment>
        ))}
      </p>
    </div>
  </React.StrictMode>,
);
