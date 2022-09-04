import axios, { AxiosResponse } from 'axios';

import { DISCORD_WEBHOOK } from '../config.js';
import { logger } from '../helpers/logger.js';

export const sendMessage = (body: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        axios.post(DISCORD_WEBHOOK!, body).then(response => {
            logger.info(`Message sent successfully!`);
            resolve();
        }).catch(error => {
            logger.error(`sendMessage failed with error code ${error.response.status}`);
            reject();
        })
    })
}

export const sendMessageV2 = (webnook: string, body: any): Promise<AxiosResponse> => {
    return axios.post(webnook, body);
}