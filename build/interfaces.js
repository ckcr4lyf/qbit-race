"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorrentState = void 0;
var TorrentState;
(function (TorrentState) {
    TorrentState["error"] = "error";
    TorrentState["missingFiles"] = "missingFiles";
    TorrentState["uploading"] = "uploading";
    TorrentState["pausedUP"] = "pausedUP";
    TorrentState["queuedUP"] = "queuedUP";
    TorrentState["stalledUP"] = "stalledUP";
    TorrentState["checkingUP"] = "checkingUP";
    TorrentState["forcedUP"] = "forcedUP";
    TorrentState["allocating"] = "allocating";
    TorrentState["downloading"] = "downloading";
    TorrentState["metaDL"] = "metaDL";
    TorrentState["pausedDL"] = "pausedDL";
    TorrentState["queuedDL"] = "queuedDL";
    TorrentState["stalledDL"] = "stalledDL";
    TorrentState["checkingDL"] = "checkingDL";
    TorrentState["forcedDL"] = "forcedDL";
    TorrentState["checkingResumeData"] = "checkingResumeData";
    TorrentState["moving"] = "moving";
    TorrentState["unknown"] = "unknown";
})(TorrentState = exports.TorrentState || (exports.TorrentState = {}));
//# sourceMappingURL=interfaces.js.map