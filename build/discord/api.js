"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const axios_1 = require("axios");
const config_1 = require("../config");
const logger_1 = require("../helpers/logger");
const sendMessage = (body) => {
    return new Promise((resolve, reject) => {
        axios_1.default.post(config_1.DISCORD_WEBHOOK, body).then(response => {
            logger_1.feedLogger.log('DISCORD', `Message sent successfully!`);
            resolve();
        }).catch(error => {
            logger_1.feedLogger.log('DISCORD', `sendMessage failed with error code ${error.response.status}`);
            reject();
        });
    });
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=api.js.map