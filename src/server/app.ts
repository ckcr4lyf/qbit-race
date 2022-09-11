// The server for serving prometheus metrics
import fastify from 'fastify';
import { makeMetrics, stateMetrics } from '../helpers/preparePromMetrics.js';
import { getTransferInfo, QbittorrentApi } from '../qbittorrent/api.js';
import { loginV2 } from '../qbittorrent/auth.js';
import { loadConfig, makeConfigIfNotExist } from '../utils/configV2.js';
import { getLoggerV3 } from '../utils/logger.js';

const server = fastify();
const logger = getLoggerV3({ logfile: 'prometheus-exporter-logs.txt'});

makeConfigIfNotExist();
const config = loadConfig();

let api: QbittorrentApi;

try {
    api = await loginV2(config.QBITTORRENT_SETTINGS);
} catch (e){
    logger.error(`Failed to login: ${e}`);
    process.exit(1);
}

server.get('/metrics', async (request, reply) => {
    const transferInfo = await getTransferInfo();
    const torrents = await api.getTorrents();

    let finalMetrics = '';

    finalMetrics += makeMetrics(transferInfo);
    finalMetrics += stateMetrics(torrents);

    reply.status(200).headers({
        'Content-Type': 'text/plain'
    }).send(finalMetrics);
});

const PROM_PORT = config.PROMETHEUS_SETTINGS.port;
const PROM_IP = config.PROMETHEUS_SETTINGS.ip;

server.listen(PROM_PORT, PROM_IP, (err, address) => {
    if (err){
        logger.error(`Failed to bind to ${PROM_IP}:${PROM_PORT}. Exiting...`)
        process.exit(1);
    }

    logger.info(`Server started at ${PROM_IP}:${PROM_PORT}`);
});