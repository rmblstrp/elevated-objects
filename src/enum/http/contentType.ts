import { EnumUtility } from "../utility";

export enum ContentType {
    ApplicationJson = "application/json",
    WwwFormUrlEncoded = "application/x-www-form-urlencoded",
    TextPlain = "text/plain",
}

export namespace ContentType {
    export function isValid(value: ContentType) {
        return EnumUtility.isValid(value, ContentType);
    }
}
