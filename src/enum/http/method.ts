import { EnumUtility } from "../utility";

export enum HttpMethod {
    Delete = "DELETE",
    Get = "GET",
    Head = "HEAD",
    Options = "OPTIONS",
    Patch = "PATCH",
    Post = "POST",
    Purge = "PURGE",
    Put = "PUT",
    Trace = "TRACE",
}

export namespace HttpMethod {
    export function isValid(value: HttpMethod) {
        return EnumUtility.isValid(value, HttpMethod);
    }
}
