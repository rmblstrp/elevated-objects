export class EnumUtility {
    public static getName(type: any, value: any): string {
        for (const key of Object.keys(type)) {
            if (type[key] === value) {
                return key;
            }
        }

        return `(enum name not found for value: ${value})`;
    }

    public static isValid(value: any, type: any): boolean {
        for (const name of Object.keys(type)) {
            if (type[name] === value) {
                return true;
            }
        }

        return false;
    }
}
