import React from "react";
import { createRoot } from "react-dom/client";
import { Gallery } from "./Gallery";
import { RenderView } from "./RenderView";

const root = document.getElementById("root")!;
const params = new URLSearchParams(window.location.search);
const renderTemplateId = params.get("render");

if (renderTemplateId) {
  // Headless render mode: bare template, no UI
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  createRoot(root).render(<RenderView templateId={renderTemplateId} />);
} else {
  // Normal gallery mode
  createRoot(root).render(
    <React.StrictMode>
      <Gallery />
    </React.StrictMode>
  );
}
