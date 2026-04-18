import type { Time } from "./Time"

export interface TimeListColumn {
    label: string,
    data: keyof Time,
    placement?: boolean,
    col: number,
    colSpan?: number,
    row?: number,
    rowSpan?: number,
    colMobile?: number,
    colSpanMobile?: number,
    rowMobile?: number,
    rowSpanMobile?: number,
    width?: string,
    widthMobile?: string,
    classes?: string,
    alignmentClasses?: string,
    link?: ((value: Time) => string),
    numFormat?: (value: number) => string
}
