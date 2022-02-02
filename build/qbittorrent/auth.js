"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const axios_1 = require("axios");
const config_1 = require("../config");
const basePath = `${config_1.HTTP_SCHEME}://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}${config_1.URL_PATH}`;
const login = async () => {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`${basePath}/api/v2/auth/login`, {
            params: {
                username: config_1.QBIT_USERNAME,
                password: config_1.QBIT_PASSWORD
            }
        }).then(response => {
            if (response.headers['set-cookie']) {
                (0, config_1.setCookie)(response.headers['set-cookie'][0]);
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
exports.login = login;
//# sourceMappingURL=auth.js.map