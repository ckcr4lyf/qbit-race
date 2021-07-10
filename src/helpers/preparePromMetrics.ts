import { TransferInfo } from "../interfaces"

export const makeMetrics = (transferInfo: TransferInfo) => {
    let result = '';
    result += `qbit_dl_bytes ${transferInfo.dl_info_data}\n`;
    result += `qbit_dl_rate_bytes ${transferInfo.dl_info_speed}\n`;
    result += `qbit_ul_bytes ${transferInfo.up_info_data}\n`;
    result += `qbit_ul_rate_bytes ${transferInfo.up_info_speed}\n`;
    result += `up 1\n`;
    return result;
}