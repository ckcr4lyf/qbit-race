import { QBIT_HOST, QBIT_PORT } from './config';
import { login } from './qbittorrent/auth';
import { setTesting } from './config';
import { feedLogger } from './helpers/logger';

module.exports = async () => {

    let t1 = Date.now();
    setTesting(true);

    try {
        await login();
    } catch (errorCode) {

        if (errorCode === 999){
            feedLogger.log(`TEST`, `FAILED! qBittorrent API is not listening at http://${QBIT_HOST}:${QBIT_PORT}`);
        } else {
            feedLogger.log(`[AUTH]`, `Failed with error code ${errorCode}. Check username / password. Exiting...`);
        }

        process.exit(1);
    }

    let t2 = Date.now();
    feedLogger.log('AUTH', `Login completed in ${((t2 - t1) / 1000).toFixed(2)} seconds.`);
    feedLogger.log(`TEST`, `SUCCESS!`);
}