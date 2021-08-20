"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The server for serving prometheus metrics
const fastify_1 = require("fastify");
const config_1 = require("../config");
const logger_1 = require("../helpers/logger");
const preparePromMetrics_1 = require("../helpers/preparePromMetrics");
const api_1 = require("../qbittorrent/api");
const auth_1 = require("../qbittorrent/auth");
const server = fastify_1.default();
const logger = logger_1.getLogger(`prom-exporter`);
// For this application, set the API log to prom-exporter
config_1.setLogfile('prom-exporter.log');
server.get('/metrics', async (request, reply) => {
    await auth_1.login();
    const transferInfo = await api_1.getTransferInfo();
    reply.status(200).headers({
        'Content-Type': 'text/plain'
    }).send(preparePromMetrics_1.makeMetrics(transferInfo));
});
server.listen(config_1.PROM_PORT, config_1.PROM_IP, (err, address) => {
    if (err) {
        logger.error(`Failed to bind to ${config_1.PROM_IP}:${config_1.PROM_PORT}. Exiting...`);
        process.exit(1);
    }
    logger.info(`Server started at ${config_1.PROM_IP}:${config_1.PROM_PORT}`);
});
//# sourceMappingURL=app.js.map