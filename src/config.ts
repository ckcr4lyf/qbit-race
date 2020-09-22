import * as dotenv from 'dotenv'
import * as path from 'path';

dotenv.config({
    path: path.join(__dirname, '../.env')
});

const QBIT_HOST = process.env.QBIT_HOST;
const QBIT_WEB_UI_PORT = process.env.QBIT_WEB_UI_PORT;
const QBIT_USERNAME = process.env.QBIT_USERNAME;
const QBIT_PASSWORD = process.env.QBIT_PASSWORD;

export { QBIT_WEB_UI_PORT, QBIT_PASSWORD, QBIT_USERNAME }