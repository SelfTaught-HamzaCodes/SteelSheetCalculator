import { registerRootComponent } from 'expo';

import './i18n/config';
import App from './App';

// boot the app (expo handles the rest)
registerRootComponent(App);
