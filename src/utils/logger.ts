import { Logger, LOGLEVEL } from "@ckcr4lyf/logger";
import { getFilePathInConfigDir } from "./configV2.js";

type getLoggerOptions = {
    skipFile: boolean,
}

export const getLoggerV3 = (options?: getLoggerOptions): Logger => {
    // Hardcoded to DEBUG.
    // In future get from user's settings or env var
    const logFilename = getFilePathInConfigDir('logs.txt');

    if (options !== undefined){
        if (options.skipFile === true){
            return new Logger({
                loglevel: LOGLEVEL.DEBUG,
            });    
        }
    }

    return new Logger({
        loglevel: LOGLEVEL.DEBUG,
        filename: logFilename
    });
    
}