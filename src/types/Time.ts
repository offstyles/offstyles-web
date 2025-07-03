export interface Time {
    _id: string;
    map: string;
    steamid: string;
    name: string;
    time: number;
    sync: number;
    strafes: number;
    jumps: number;
    date: number;
    tickrate: number;
    replay: number | null;
    style: number;
    server: object;  
}