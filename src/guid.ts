// Ported to Typescript from Microsoft CoreFX C# source code
// https://github.com/dotnet/corefx/blob/master/src/Common/src/CoreLib/System/Guid.cs

import { isString } from "lodash";
const uuidv4 = require("uuid/v4");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

enum GuidStyles {
    None = 0x00000000,
    AllowParenthesis = 0x00000001, // Allow the guid to be enclosed in parens
    AllowBraces = 0x00000002, // Allow the guid to be enclosed in braces
    AllowDashes = 0x00000004, // Allow the guid to contain dash group separators
    AllowHexPrefix = 0x00000008, // Allow the guid to contain {0xdd,0xdd}
    RequireParenthesis = 0x00000010, // Require the guid to be enclosed in parens
    RequireBraces = 0x00000020, // Require the guid to be enclosed in braces
    RequireDashes = 0x00000040, // Require the guid to contain dash group separators
    RequireHexPrefix = 0x00000080, // Require the guid to contain {0xdd,0xdd}

    HexFormat = RequireBraces | RequireHexPrefix, /* X */
    NumberFormat = None, /* N */
    DigitFormat = RequireDashes, /* D */
    BraceFormat = RequireBraces | RequireDashes, /* B */
    ParenthesisFormat = RequireParenthesis | RequireDashes, /* P */

    Any = AllowParenthesis | AllowBraces | AllowDashes | AllowHexPrefix,
}

enum GuidParseThrowStyle {
    None = 0,
    All = 1,
    AllButOverflow = 2
}

enum ParseFailureKind {
    None = 0,
    ArgumentNull = 1,
    Format = 2,
    FormatWithParameter = 3,
    NativeException = 4,
    FormatWithInnerException = 5
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This will store the result of the parsing.  And it will eventually be used to construct a Guid instance.
class GuidResult {
    public parsedGuid: Guid;
    public throwStyle: GuidParseThrowStyle;

    public failure: ParseFailureKind;
    public failureMessageID: string;
    public failureMessageFormatArgument: any;
    public failureArgumentName: string;
    public innerException: Error;

    public init(canThrow: GuidParseThrowStyle): void {
        this.parsedGuid = new Guid(new Array<number>(16));
        this.throwStyle = canThrow;
    }

    public setNativeFailure(nativeException: Error): void {
        this.failure = ParseFailureKind.NativeException;
        this.innerException = nativeException;
    }

    public setFailure(failure: ParseFailureKind,
                      failureMessageID: string,
                      failureMessageFormatArgument: any = undefined,
                      failureArgumentName: string = undefined,
                      innerException: Error = undefined): void {
        this.failure = failure;
        this.failureMessageID = failureMessageID;
        this.failureMessageFormatArgument = failureMessageFormatArgument;
        this.failureArgumentName = failureArgumentName;
        this.innerException = innerException;
        if (this.throwStyle !== GuidParseThrowStyle.None) {
            throw this.GetGuidParseException();
        }
    }

    public GetGuidParseException(): Error {
        switch (this.failure) {
            case ParseFailureKind.ArgumentNull:
                return new Error(`ArgumentNullException(${this.failureArgumentName}, ${this.failureMessageID})`);

            case ParseFailureKind.FormatWithInnerException:
                return new Error(`FormatException(${this.failureMessageID}, ${this.innerException})`);

            case ParseFailureKind.FormatWithParameter:
                return new Error(`FormatException(${this.failureMessageID}, ${this.failureMessageFormatArgument})`);

            case ParseFailureKind.Format:
                return new Error(`FormatException(${this.failureMessageID}`);

            case ParseFailureKind.NativeException:
                return this.innerException;

            default:
                return new Error("FormatException(\"Format_GuidUnrecognized\")");
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class Guid {
    public static readonly empty: Guid = new Guid(new Array<number>(16));

    ////////////////////////////////////////////////////////////////////////////////
    //  Member variables
    ////////////////////////////////////////////////////////////////////////////////
    private _a: number;
    private _b: number;
    private _c: number;
    private _d: number;
    private _e: number;
    private _f: number;
    private _g: number;
    private _h: number;
    private _i: number;
    private _j: number;
    private _k: number;

    ////////////////////////////////////////////////////////////////////////////////
    //  Constructors
    ////////////////////////////////////////////////////////////////////////////////

    // Creates a new guid from an array of bytes.
    //
    constructor(b: number[]) {
        if (!(b instanceof Array)) {
            throw new Error("ArgumentNullException: b");
        }
        if (b.length !== 16) {
            throw new Error("ArgumentException: b must have 16 elements");
        }

        this._a = (b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3];
        this._b = (b[4] << 8) | b[5];
        this._c = (b[6] << 8) | b[7];
        this._d = b[8];
        this._e = b[9];
        this._f = b[10];
        this._g = b[11];
        this._h = b[12];
        this._i = b[13];
        this._j = b[14];
        this._k = b[15];
    }

    // Returns an unsigned byte array containing the GUID.
    public toByteArray(): number[] {
        const g = new Array<number>(16);

        g[0] = (this._a >>> 24) & 0xff;
        g[1] = (this._a >>> 16) & 0xff;
        g[2] = (this._a >>> 8) & 0xff;
        g[3] = this._a & 0xff;
        g[4] = (this._b >>> 8) & 0xff;
        g[5] = this._b & 0xff;
        g[6] = (this._c >>> 8) & 0xff;
        g[7] = this._c & 0xff;
        g[8] = this._d;
        g[9] = this._e;
        g[10] = this._f;
        g[11] = this._g;
        g[12] = this._h;
        g[13] = this._i;
        g[14] = this._j;
        g[15] = this._k;

        return g;
    }

    public valueOf() {
        return this.toString();
    }

    public toJSON() {
        return this.toString();
    }

    public toString(): string {
        const first: string = Guid.intToHex(this._a);
        const second: string = Guid.shortToHex(this._b);
        const third: string = Guid.shortToHex(this._c);
        const fourth: string = Guid.byteToHex(this._d) + Guid.byteToHex(this._e);
        const fifth: string = (
            Guid.byteToHex(this._f) +
            Guid.byteToHex(this._g) +
            Guid.byteToHex(this._h) +
            Guid.byteToHex(this._i) +
            Guid.byteToHex(this._j) +
            Guid.byteToHex(this._k)
        );

        return `${first}-${second}-${third}-${fourth}-${fifth}`.toLowerCase();
    }

    public static newGuid(): Guid {
        return new Guid(uuidv4("binary"));
    }

    public static parse(input: string): Guid {
        if (!isString(input)) {
            throw new Error("ArgumentNullException: input");
        }

        const result = new GuidResult();
        result.init(GuidParseThrowStyle.AllButOverflow);
        if (Guid.tryParseGuid(input, GuidStyles.Any, result)) {
            return result.parsedGuid;
        }
        else {
            throw result.GetGuidParseException();
        }
    }

    private static tryParseGuid(g: string, flags: GuidStyles, result: GuidResult): boolean {
        if (!isString(g)) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
            return false;
        }
        const guidString = g.trim();  // Remove Whitespace

        if (guidString.length === 0) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
            return false;
        }

        // Check for dashes
        const dashesExistInString: boolean = (guidString.indexOf("-", 0) >= 0);

        if (dashesExistInString) {
            if ((flags & (GuidStyles.AllowDashes | GuidStyles.RequireDashes)) === 0) {
                // dashes are not allowed
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }
        else {
            if ((flags & GuidStyles.RequireDashes) !== 0) {
                // dashes are required
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }

        // Check for braces
        const bracesExistInString: boolean = (guidString.indexOf("{", 0) >= 0);

        if (bracesExistInString) {
            if ((flags & (GuidStyles.AllowBraces | GuidStyles.RequireBraces)) === 0) {
                // braces are not allowed
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }
        else {
            if ((flags & GuidStyles.RequireBraces) !== 0) {
                // braces are required
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }

        // Check for parenthesis
        const parenthesisExistInString: boolean = (guidString.indexOf("(", 0) >= 0);

        if (parenthesisExistInString) {
            if ((flags & (GuidStyles.AllowParenthesis | GuidStyles.RequireParenthesis)) === 0) {
                // parenthesis are not allowed
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }
        else {
            if ((flags & GuidStyles.RequireParenthesis) !== 0) {
                // parenthesis are required
                result.setFailure(ParseFailureKind.Format, "Format_GuidUnrecognized");
                return false;
            }
        }

        try {
            // let"s get on with the parsing
            if (dashesExistInString) {
                // Check if it"s of the form [{|(]dddddddd-dddd-dddd-dddd-dddddddddddd[}|)]
                return Guid.tryParseGuidWithDashes(guidString, result);
            }
            else if (bracesExistInString) {
                // Check if it"s of the form {0xdddddddd,0xdddd,0xdddd,{0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd}}
                return Guid.tryParseGuidWithHexPrefix(guidString, result);
            }
            else {
                // Check if it"s of the form dddddddddddddddddddddddddddddddd
                return Guid.tryParseGuidWithNoStyle(guidString, result);
            }
        }
        catch (ex) {
            result.setFailure(ParseFailureKind.FormatWithInnerException, "Format_GuidUnrecognized", undefined, undefined, ex);
            return false;
        }
    }

    // Check if it"s of the form {0xdddddddd,0xdddd,0xdddd,{0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd,0xdd}}
    private static tryParseGuidWithHexPrefix(guidString: string, result: GuidResult): boolean {
        let numStart: number;
        let numLen: number;

        // Eat all of the whitespace
        guidString = Guid.eatAllWhitespace(guidString);

        // Check for leading "{"
        if (!isString(guidString) || guidString.length === 0 || guidString[0] !== "{") {
            result.setFailure(ParseFailureKind.Format, "Format_GuidBrace");
            return false;
        }

        // Check for "0x"
        if (!Guid.isHexPrefix(guidString, 1)) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidHexPrefix", "{0xdddddddd, etc}");
            return false;
        }

        // Find the end of this hex number (since it is not fixed length)
        numStart = 3;
        numLen = guidString.indexOf(",", numStart) - numStart;
        if (numLen <= 0) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidComma");
            return false;
        }

        if (!Number.isInteger(parseInt(guidString.substr(numStart, numLen), 16) /*first DWORD*/)) {
            return false;
        }

        // Check for "0x"
        if (!Guid.isHexPrefix(guidString, numStart + numLen + 1)) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidHexPrefix", "{0xdddddddd, 0xdddd, etc}");
            return false;
        }
        // +3 to get by ",0x"
        numStart = numStart + numLen + 3;
        numLen = guidString.indexOf(",", numStart) - numStart;
        if (numLen <= 0) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidComma");
            return false;
        }

        // Read in the number
        if (!Number.isInteger(parseInt(guidString.substr(numStart, numLen), 16) /*first DWORD*/)) {
            return false;
        }

        // Check for "0x"
        if (!Guid.isHexPrefix(guidString, numStart + numLen + 1)) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidHexPrefix", "{0xdddddddd, 0xdddd, 0xdddd, etc}");
            return false;
        }
        // +3 to get by ",0x"
        numStart = numStart + numLen + 3;
        numLen = guidString.indexOf(",", numStart) - numStart;
        if (numLen <= 0) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidComma");
            return false;
        }

        // Read in the number
        if (!Number.isInteger(parseInt(guidString.substr(numStart, numLen), 16) /*first DWORD*/)) {
            return false;
        }

        // Check for "{"
        if (guidString.length <= numStart + numLen + 1 || guidString[numStart + numLen + 1] !== "{") {
            result.setFailure(ParseFailureKind.Format, "Format_GuidBrace");
            return false;
        }

        // Prepare for loop
        numLen++;
        const bytes = new Array<number>(8);

        for (let i = 0; i < 8; i++) {
            // Check for "0x"
            if (!Guid.isHexPrefix(guidString, numStart + numLen + 1)) {
                result.setFailure(ParseFailureKind.Format, "Format_GuidHexPrefix", "{... { ... 0xdd, ...}}");
                return false;
            }

            // +3 to get by ",0x" or "{0x" for first case
            numStart = numStart + numLen + 3;

            // Calculate number length
            // first 7 cases
            if (i < 7) {
                numLen = guidString.indexOf(",", numStart) - numStart;
                if (numLen <= 0) {
                    result.setFailure(ParseFailureKind.Format, "Format_GuidComma");
                    return false;
                }
            }
            // last case ends with "}", not ","
            else {
                numLen = guidString.indexOf("}", numStart) - numStart;
                if (numLen <= 0) {
                    result.setFailure(ParseFailureKind.Format, "Format_GuidBraceAfterLastNumber");
                    return false;
                }
            }

            // Read in the number
            const value = parseInt(guidString.substr(numStart, numLen), 16);
            // check for overflow
            if (value > 255) {
                result.setFailure(ParseFailureKind.Format, "Overflow_Byte");
                return false;
            }
            bytes[i] = value;
        }

        result.parsedGuid._d = bytes[0];
        result.parsedGuid._e = bytes[1];
        result.parsedGuid._f = bytes[2];
        result.parsedGuid._g = bytes[3];
        result.parsedGuid._h = bytes[4];
        result.parsedGuid._i = bytes[5];
        result.parsedGuid._j = bytes[6];
        result.parsedGuid._k = bytes[7];

        // Check for last "}"
        if (numStart + numLen + 1 >= guidString.length || guidString[numStart + numLen + 1] !== "}") {
            result.setFailure(ParseFailureKind.Format, "Format_GuidEndBrace");
            return false;
        }

        // Check if we have extra characters at the end
        if (numStart + numLen + 1 !== guidString.length - 1) {
            result.setFailure(ParseFailureKind.Format, "Format_ExtraJunkAtEnd");
            return false;
        }

        return true;
    }

    // Check if it"s of the form [{|(]dddddddd-dddd-dddd-dddd-dddddddddddd[}|)]
    private static tryParseGuidWithDashes(guidString: string, result: GuidResult) {
        let startPos = 0;
        let temp: number;
        let templ: number;
        let str: string;
        let currentPos: number;

        // check to see that it"s the proper length
        if (guidString[0] === "{") {
            if (guidString.length !== 38 || guidString[37] !== "}") {
                result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
                return false;
            }
            startPos = 1;
        }
        else if (guidString[0] === "(") {
            if (guidString.length !== 38 || guidString[37] !== ")") {
                result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
                return false;
            }
            startPos = 1;
        }
        else if (guidString.length !== 36) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
            return false;
        }

        if (guidString[8 + startPos] !== "-" ||
            guidString[13 + startPos] !== "-" ||
            guidString[18 + startPos] !== "-" ||
            guidString[23 + startPos] !== "-") {
            result.setFailure(ParseFailureKind.Format, "Format_GuidDashes");
            return false;
        }

        currentPos = startPos;

        str = guidString.substr(currentPos, 8);
        temp = parseInt(str, 16) & 0xffffffff;
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._a = temp;
        currentPos += str.length + 1; // Increment past the "-";

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16) & 0xffff;
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._b = temp;
        currentPos += str.length + 1; // Increment past the "-";

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16) & 0xffff;
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._c = temp;
        currentPos += str.length + 1; // Increment past the "-";

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16);
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        currentPos += str.length + 1; // Increment past the "-";
        startPos = currentPos;

        str = guidString.substr(currentPos, 12);
        templ = parseInt(str, 16);
        if (!Number.isInteger(templ) /*first DWORD*/) {
            return false;
        }
        currentPos += str.length;

        if (currentPos - startPos !== 12) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
            return false;
        }

        result.parsedGuid._d = (temp >>> 8) & 0xff;
        result.parsedGuid._e = temp & 0xff;
        result.parsedGuid._f = parseInt(str.substr(0, 2), 16) & 0xff;
        result.parsedGuid._g = parseInt(str.substr(2, 2), 16) & 0xff;
        result.parsedGuid._h = parseInt(str.substr(4, 2), 16) & 0xff;
        result.parsedGuid._i = parseInt(str.substr(6, 2), 16) & 0xff;
        result.parsedGuid._j = parseInt(str.substr(8, 2), 16) & 0xff;
        result.parsedGuid._k = parseInt(str.substr(10, 2), 16) & 0xff;

        return true;
    }

    // Check if it"s of the form dddddddddddddddddddddddddddddddd
    private static tryParseGuidWithNoStyle(guidString: string, result: GuidResult): boolean {
        let startPos = 0;
        let temp: number;
        let templ: number;
        let currentPos = startPos;
        let str: string;

        if (guidString.length !== 32) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
            return false;
        }

        for (const char of guidString) {
            if (char >= "0" && char <= "9") {
                continue;
            }
            else {
                const upperCaseCh = char.toLocaleUpperCase();
                if (upperCaseCh >= "A" && upperCaseCh <= "F") {
                    continue;
                }
            }

            result.setFailure(ParseFailureKind.Format, "Format_GuidInvalidChar");
            return false;
        }

        str = guidString.substr(currentPos, 8);
        temp = parseInt(str, 16);
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._a = temp;
        currentPos += str.length;

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16);
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._b = temp;
        currentPos += str.length;

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16);
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        result.parsedGuid._c = temp;
        currentPos += str.length;

        str = guidString.substr(currentPos, 4);
        temp = parseInt(str, 16);
        if (!Number.isInteger(temp) /*first DWORD*/) {
            return false;
        }
        currentPos += str.length;
        startPos = currentPos;

        str = guidString.substr(currentPos, 12);
        templ = parseInt(str, 16);
        if (!Number.isInteger(templ) /*first DWORD*/) {
            return false;
        }
        currentPos += str.length;

        if (currentPos - startPos !== 12) {
            result.setFailure(ParseFailureKind.Format, "Format_GuidInvLen");
            return false;
        }

        result.parsedGuid._d = (temp >>> 8) & 0xff;
        result.parsedGuid._e = temp & 0xff;
        result.parsedGuid._f = parseInt(str.substr(0, 2), 16) & 0xff;
        result.parsedGuid._g = parseInt(str.substr(2, 2), 16) & 0xff;
        result.parsedGuid._h = parseInt(str.substr(4, 2), 16) & 0xff;
        result.parsedGuid._i = parseInt(str.substr(6, 2), 16) & 0xff;
        result.parsedGuid._j = parseInt(str.substr(8, 2), 16) & 0xff;
        result.parsedGuid._k = parseInt(str.substr(10, 2), 16) & 0xff;

        return true;
    }

    private static eatAllWhitespace(str: string): string {
        let newLength = 0;
        const chArr = new Array<string>(str.length);

        // Now get each char from str and if it is not whitespace add it to chArr
        for (const char of str) {
            if (!(/\S/.test(char))) {
                chArr[newLength++] = char;
            }
        }

        // Return a new string based on chArr
        return chArr.join("");
    }

    private static isHexPrefix(str: string, i: number): boolean {
        return (str.length > i + 1) && (str[i] === "0") && (str[i + 1].toLowerCase() === "x");
    }

    // Converts a byte value to a properly padded hex string
    private static byteToHex(byte: number): string {
        return Guid.numberToHex(byte & 0xff, 0x100);
    }

    // Converts a short value to a properly padded hex string
    private static shortToHex(short: number): string {
        return Guid.byteToHex(short >>> 8) + Guid.byteToHex(short);
    }

    // Converts an int value to a properly padded hex string
    private static intToHex(int: number): string {
        return Guid.shortToHex(int >>> 16) + Guid.shortToHex(int);
    }

    private static numberToHex(value: number, length: number): string {
        return (value + length).toString(16).substr(1);
    }
}

export type UUID = Guid | string;
