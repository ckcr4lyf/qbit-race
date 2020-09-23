"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const auth_1 = require("./qbittorrent/auth");
const config_2 = require("./config");
const logger_1 = require("./helpers/logger");
module.exports = async () => {
    let t1 = Date.now();
    config_2.setTesting(true);
    try {
        await auth_1.login();
    }
    catch (errorCode) {
        if (errorCode === 999) {
            logger_1.feedLogger.log(`TEST`, `FAILED! qBittorrent API is not listening at http://${config_1.QBIT_HOST}:${config_1.QBIT_PORT}`);
        }
        else {
            logger_1.feedLogger.log(`[AUTH]`, `Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }
        process.exit(1);
    }
    let t2 = Date.now();
    logger_1.feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    logger_1.feedLogger.log(`TEST`, `SUCCESS!`);
};
//# sourceMappingURL=check_qbit.js.map