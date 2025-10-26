import { hydrateRoot } from 'npm:react-dom/client';
import { App } from "./components/App.tsx";

hydrateRoot(document.getElementById('root'), <App />);