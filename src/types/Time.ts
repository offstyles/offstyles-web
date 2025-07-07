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
    replay: number;
    style: number;
    server: {
        ip:string;
        server:string;
        internal_server_id:string;
    };  
}