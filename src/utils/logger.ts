import { Logger, LOGLEVEL } from "@ckcr4lyf/logger";

export const getLoggerV3 = (): Logger => {
    // Hardcoded to DEBUG.
    // In future get from user's settings or env var
    return new Logger(LOGLEVEL.DEBUG);
}