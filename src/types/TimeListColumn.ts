
import type { Time } from "./Time"
export interface TimeListColumn {
    label: string,
    data: string,
    placement?: boolean,
    width: string,
    classes: string,
    link?: ((value: Time) => string),
    format?: ((value: string) => string) | ((value: number) => string)
}