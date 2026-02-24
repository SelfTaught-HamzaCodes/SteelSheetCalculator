import { registerRootComponent } from 'expo';

import './i18n/config';
import App from './App';

// boot the app (expo handles the rest)
registerRootComponent(App);

// Snack expects a default export from the entry file to render
export default App;
