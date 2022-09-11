import axios, { AxiosResponse } from 'axios';

export const sendMessageV2 = (webnook: string, body: any): Promise<AxiosResponse> => {
    return axios.post(webnook, body);
}