import axios from 'axios';
import { QBIT_USERNAME, QBIT_HOST, QBIT_PASSWORD, QBIT_PORT, HTTP_SCHEME, URL_PATH, setCookie } from '../config.js';
const basePath = `${HTTP_SCHEME}://${QBIT_HOST}:${QBIT_PORT}${URL_PATH}`;
export const login = async (logFile) => {
    return new Promise((resolve, reject) => {
        axios.get(`${basePath}/api/v2/auth/login`, {
            params: {
                username: QBIT_USERNAME,
                password: QBIT_PASSWORD
            }
        }).then(response => {
            if (response.headers['set-cookie']) {
                setCookie(response.headers['set-cookie'][0], logFile);
                resolve();
            }
            else {
                reject(response.status);
            }
        }).catch(error => {
            if (error.response) {
                reject(error.response.status);
            }
            else {
                reject(999);
            }
        });
    });
};
//# sourceMappingURL=auth.js.map