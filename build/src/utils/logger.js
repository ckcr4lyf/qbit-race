import { Logger, LOGLEVEL } from "@ckcr4lyf/logger";
import { getFilePathInConfigDir, makeConfigDirIfNotExist } from "./configV2.js";
export const getLoggerV3 = (options) => {
    // Hardcoded to DEBUG.
    // In future get from user's settings or env var
    const logFilename = getFilePathInConfigDir(options?.logfile || 'logs.txt');
    if (options !== undefined) {
        if (options.skipFile === true) {
            return new Logger({
                loglevel: LOGLEVEL.DEBUG,
            });
        }
    }
    makeConfigDirIfNotExist();
    return new Logger({
        loglevel: LOGLEVEL.DEBUG,
        filename: logFilename
    });
};
//# sourceMappingURL=logger.js.map