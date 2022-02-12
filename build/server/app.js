// The server for serving prometheus metrics
import fastify from 'fastify';
import { PROM_IP, PROM_PORT, setLogfile } from '../config';
import { getLogger } from '../helpers/logger';
import { makeMetrics, stateMetrics } from '../helpers/preparePromMetrics';
import { getTorrents, getTransferInfo } from '../qbittorrent/api';
import { login } from '../qbittorrent/auth';
const server = fastify();
const logger = getLogger(`prom-exporter`);
// For this application, set the API log to prom-exporter
setLogfile('prom-exporter.log');
server.get('/metrics', async (request, reply) => {
    await login();
    const transferInfo = await getTransferInfo();
    const torrents = await getTorrents();
    let finalMetrics = '';
    finalMetrics += makeMetrics(transferInfo);
    finalMetrics += stateMetrics(torrents);
    reply.status(200).headers({
        'Content-Type': 'text/plain'
    }).send(finalMetrics);
});
server.listen(PROM_PORT, PROM_IP, (err, address) => {
    if (err) {
        logger.error(`Failed to bind to ${PROM_IP}:${PROM_PORT}. Exiting...`);
        process.exit(1);
    }
    logger.info(`Server started at ${PROM_IP}:${PROM_PORT}`);
});
//# sourceMappingURL=app.js.map