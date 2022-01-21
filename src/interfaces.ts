import { EVENTS } from "./helpers/constants.js";

export interface config_t {
    QBIT_HOST: string,
    QBIT_PORT: string,
    QBIT_USERNAME: string,
    QBIT_PASSWORD: string
}

// Just type the important fields
export interface torrentFromApi {
    name: string;
    hash: string;
    state: string;
    added_on: number; //Unix timestamp
    ratio: number;
    category: string; // "" or single category
    tags: string; // "" or CSV of multiple tags
    size: number;
    downloaded: number;
    uploaded: number;
}

export interface torrentStatusEvent {
    infohash: string;
    size: number;
    name: string;
    trackers: string[];
    timestamp: number;
    uploaded: number;
    downloaded: number;
    ratio: number;
    eventType: EVENTS;
}

export interface torrentDbInfo {
    infohash: string;
    size: number;
    name: string;
    trackers: string[];
}

export type TransferInfo = {
    connection_status: string;
    dht_nodes: number;
    dl_info_data: number;
    dl_info_speed: number;
    up_info_data: number;
    up_info_speed: number;
}