"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
exports.sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
};
//# sourceMappingURL=utilities.js.map