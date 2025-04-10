// Define Buffer globally before any other imports
import BufferPolyfill from "./lib/buffer-polyfill";

// Explicitly set Buffer global
if (typeof window !== 'undefined') {
  (window as any).Buffer = BufferPolyfill;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
