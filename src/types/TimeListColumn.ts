
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
    "tickrate" |
    "replay" |
    "style" |
    "server",
    placement?: boolean,
    width? : string,
    classes?: string,
    link?: ((value: Time) => string),
    numFormat?: (value: number) => string
}