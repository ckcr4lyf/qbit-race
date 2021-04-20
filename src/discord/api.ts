import axios from 'axios';

import { DISCORD_WEBHOOK } from '../config';
import { feedLogger } from '../helpers/logger';

export const sendMessage = (body: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        axios.post(DISCORD_WEBHOOK, body).then(response => {
            feedLogger.log('DISCORD', `Message sent successfully!`);
            resolve();
        }).catch(error => {
            feedLogger.log('DISCORD', `sendMessage failed with error code ${error.response.status}`);
            reject();
        })
    })
}