import timeSince from "../utils/timeSince";
class Time {
    id: number;
    map: string;
    steamId: string;
    name: string;
    time: number;
    sync: number;
    strafes: number;
    jumps: number;
    date: number;
    replay: number;
    styleId: number;
    server: object;
    constructor(response : any) {
        this.id = response.id;
        this.map = response.map;
        this.steamId = response.steamid,
        this.name = response.name,
        this.time = response.time,
        this.sync = response.sync,
        this.strafes = response.strafes,
        this.jumps = response.jumps,
        this.date = response.date,
        this.replay = response.replay,
        this.styleId = response.style,
        this.server = response.server
    }
    get formattedTime(){
        let seconds = Math.floor(this.time);
        let ms = Math.floor((this.time - seconds)*1000);
        let hours = Math.floor(seconds / 3600);
        seconds = Math.floor(seconds % 3600);
        let minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);

        const hoursStr = ("00" + hours).slice(-2);
        const minutesStr = ("00" + minutes).slice(-2);
        const secondsStr = ("00" + seconds).slice(-2);
        const msStr = ("000" + ms).slice(-3);

        return hoursStr + ":" + minutesStr + ":" + secondsStr + "." + msStr;
    }
    get timeSince(){
        return timeSince(this.date);
    }
    get style(){
        switch(this.styleId){
            case 190: return 'Normal';
            case 191: return 'Sideways';
            case 192: return 'W-Only';
            case 193: return 'Legit scroll';
            case 195: return 'Half-Sideways';
            case 196: return 'A/D-Only';
            case 197: return 'Segmented';
            default: return this.styleId;
        }
    }
}

export default Time;