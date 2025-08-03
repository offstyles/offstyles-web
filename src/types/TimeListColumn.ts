import type { Time } from "./Time"

export interface TimeListColumn {
    label: string,
    data: keyof Time,
    placement?: boolean,
    width?: string,
    classes?: string,
    alignmentClasses?: string,
    link?: ((value: Time) => string),
    numFormat?: (value: number) => string
}