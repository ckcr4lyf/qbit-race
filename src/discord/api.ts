import axios from 'axios';

import { DISCORD_WEBHOOK } from '../config';
import { logger } from '../helpers/logger';

export const sendMessage = (body: any): Promise<void> => {
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