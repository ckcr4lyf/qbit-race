"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The server for serving prometheus metrics
const fastify_1 = require("fastify");
const config_1 = require("../config");
const logger_1 = require("../helpers/logger");
const preparePromMetrics_1 = require("../helpers/preparePromMetrics");
const api_1 = require("../qbittorrent/api");
const auth_1 = require("../qbittorrent/auth");
const server = (0, fastify_1.default)();
const logger = (0, logger_1.getLogger)(`prom-exporter`);
// For this application, set the API log to prom-exporter
(0, config_1.setLogfile)('prom-exporter.log');
server.get('/metrics', async (request, reply) => {
    await (0, auth_1.login)();
    const transferInfo = await (0, api_1.getTransferInfo)();
    const torrents = await (0, api_1.getTorrents)();
    let finalMetrics = '';
    finalMetrics += (0, preparePromMetrics_1.makeMetrics)(transferInfo);
    finalMetrics += (0, preparePromMetrics_1.stateMetrics)(torrents);
    reply.status(200).headers({
        'Content-Type': 'text/plain'
    }).send(finalMetrics);
});
server.listen(config_1.PROM_PORT, config_1.PROM_IP, (err, address) => {
    if (err) {
        logger.error(`Failed to bind to ${config_1.PROM_IP}:${config_1.PROM_PORT}. Exiting...`);
        process.exit(1);
    }
    logger.info(`Server started at ${config_1.PROM_IP}:${config_1.PROM_PORT}`);
});
//# sourceMappingURL=app.js.map