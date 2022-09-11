export enum TorrentState {
    error = 'error',
    missingFiles = 'missingFiles',
    uploading = 'uploading',
    pausedUP = 'pausedUP',
    queuedUP = 'queuedUP',
    stalledUP = 'stalledUP',
    checkingUP = 'checkingUP',
    forcedUP = 'forcedUP',
    allocating = 'allocating',
    downloading = 'downloading',
    metaDL = 'metaDL',
    pausedDL = 'pausedDL',
    queuedDL = 'queuedDL',
    stalledDL = 'stalledDL',
    checkingDL = 'checkingDL',
    forcedDL = 'forcedDL',
    checkingResumeData = 'checkingResumeData',
    moving = 'moving',
    unknown = 'unknown',
}

export const SEEDING_STATES = [TorrentState.uploading, TorrentState.stalledUP, TorrentState.forcedUP];

// Just type the important fields
export interface torrentFromApi {
    name: string;
    hash: string;
    state: TorrentState;
    added_on: number; //Unix timestamp
    ratio: number;
    category: string; // "" or single category
    tags: string; // "" or CSV of multiple tags
    size: number;
}

export enum TrackerStatus {
    WORKING = 2,
}

export type TransferInfo = {
    connection_status: string;
    dht_nodes: number;
    dl_info_data: number;
    dl_info_speed: number;
    up_info_data: number;
    up_info_speed: number;
}