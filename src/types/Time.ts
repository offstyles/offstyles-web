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
    replay_ref?: number | null;
    style: number;
    is_invalid: boolean;
    is_banned: boolean;
    invalid_ref?: number | null;
    server: {
        ip:string;
        server:string;
        internal_server_id:string;
    };  
    rank: number;
}