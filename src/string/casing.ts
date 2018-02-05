import * as CaseConverter from "case";
import { EnumUtility } from "../enum/utility";

export enum StringCase {
    Camel,
    Kebab,
    Pascal,
    Same,
    Snake,
}

export namespace StringCase {
    export function isValid(value: StringCase) {
        return EnumUtility.isValid(value, StringCase);
    }
}

export function convertCase(value: string, casing: StringCase): string {
    switch (casing) {
        case StringCase.Camel:
            return CaseConverter.camel(value);
        case StringCase.Pascal:
            return CaseConverter.pascal(value);
        case StringCase.Snake:
            return CaseConverter.snake(value);
        case StringCase.Kebab:
            return CaseConverter.kebab(value);
    }

    return value;
}
