import axios from 'axios';
import { QBIT_USERNAME, QBIT_HOST, QBIT_PASSWORD, QBIT_PORT, setCookie } from '../config';
import { config_t } from '../interfaces';

export const login = () => {

    return new Promise((resolve, reject) => {
        axios.get(`http://${QBIT_HOST}:${QBIT_PORT}/api/v2/auth/login`, {
            params: {
                username: QBIT_USERNAME,
                password: QBIT_PASSWORD
            }
        }).then(response => {
            if (response.headers['set-cookie']){
                setCookie(response.headers['set-cookie'][0]);
                resolve();
            } else {
                reject(response.status);
            }
        }).catch(error => {

            if (error.response){
                reject(error.response.status);
            } else {
                reject(999);
            }
        });
    });
}