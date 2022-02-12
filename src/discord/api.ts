import axios from 'axios';

import { DISCORD_WEBHOOK } from '../config.js';
import { getLogger } from '../helpers/logger.js';

export const sendMessage = (body: any, logFile?: string): Promise<void> => {
    const logger = getLogger(logFile || 'DISCORD');

    return new Promise((resolve, reject) => {
        axios.post(DISCORD_WEBHOOK, body).then(response => {
            logger.info(`Message sent successfully!`);
            resolve();
        }).catch(error => {
            logger.error(`sendMessage failed with error code ${error.response.status}`);
            reject();
        })
    })
}