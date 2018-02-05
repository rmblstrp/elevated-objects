import { EnumUtility } from "../utility";

export enum HttpHeader {
    Accept = "Accept",
    ContentType = "Content-Type",
}

export namespace HttpHeader {
    export function isValid(value: HttpHeader) {
        return EnumUtility.isValid(value, HttpHeader);
    }
}
