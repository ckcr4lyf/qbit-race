/**
 * Expose a function that could be called from the binary
 */

import fastify from "fastify";
import { makeMetrics, stateMetrics } from "../helpers/preparePromMetrics.js";
import { QbittorrentApi } from "../qbittorrent/api.js";
import { Settings } from "../utils/config.js";
import { getLoggerV3 } from "../utils/logger.js";

export const startMetricsServer = (config: Settings, api: QbittorrentApi) => {
    const server = fastify();
    const logger = getLoggerV3({ logfile: 'prometheus-exporter-logs.txt'});

    server.get('/metrics', async (request, reply) => {
        const transferInfo = await api.getTransferInfo();
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
}