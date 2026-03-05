import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/brand.css";

import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import axios from 'axios';

// Globally bypass ngrok warnings for all Axios requests
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
