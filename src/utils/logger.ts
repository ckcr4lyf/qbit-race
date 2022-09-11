import { Logger, LOGLEVEL } from "@ckcr4lyf/logger";
import { getFilePathInConfigDir, makeConfigDirIfNotExist } from "./configV2.js";

type getLoggerOptions = {
    skipFile?: boolean,
    logfile?: string,
}

export const getLoggerV3 = (options?: getLoggerOptions): Logger => {
    // Hardcoded to DEBUG.
    // In future get from user's settings or env var
    const logFilename = getFilePathInConfigDir(options?.logfile || 'logs.txt');

    if (options !== undefined){
        if (options.skipFile === true){
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
}