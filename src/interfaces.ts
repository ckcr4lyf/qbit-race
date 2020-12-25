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
}
