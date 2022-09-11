import axios from 'axios';
export const sendMessageV2 = (webnook, body) => {
    return axios.post(webnook, body);
};
//# sourceMappingURL=api.js.map