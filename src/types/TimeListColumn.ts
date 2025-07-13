
import type { Time } from "./Time"
export interface TimeListColumn {
    label: string,
    data: 
    "_id" |
    "map" |
    "steamid" |
    "name" |
    "time" |
    "sync" |
    "strafes" |
    "jumps" |
    "date" |
    "replay_ref" |
    "style" |
    "is_invalid" |
    "is_banned" |
    "invalid_ref" |
    "server" |
    "rank",
    placement?: boolean,
    width? : string,
    classes?: string,
    link?: ((value: Time) => string),
    numFormat?: (value: number) => string
}