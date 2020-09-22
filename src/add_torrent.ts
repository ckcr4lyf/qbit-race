import * as CONFIG from './config';
import { login } from './qbittorrent/auth';

login(CONFIG.QBIT_USERNAME, CONFIG.QBIT_PASSWORD);