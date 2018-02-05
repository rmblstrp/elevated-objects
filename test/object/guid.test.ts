import { expect } from "chai";
import { Guid } from "../../src/object/guid";

const uuidv4 = require("uuid/v4");
const bytesToUuid = require("uuid/lib/bytesToUuid");

describe("Guid Class", () => {

    it("Parse string with dashes", async () => {
        const guid = "123e4567-e89b-12d3-a456-426655440000";
        const result = Guid.parse(guid);
        const bytes: number[] = [103, 69, 62, 18, 155, 232, 211, 18, 164, 86, 66, 102, 85, 68, 0, 0];

        expect(result).be.instanceOf(Guid);
        expect(result.toByteArray()).to.have.members(bytes).and.to.have.lengthOf(16);
        expect(result.toString()).to.equal(guid);
    });

    it("Parse string with no style", async () => {
        const guid = "123e4567e89b12d3a456426655440000";
        const result = Guid.parse(guid);
        const bytes: number[] = [103, 69, 62, 18, 155, 232, 211, 18, 164, 86, 66, 102, 85, 68, 0, 0];

        expect(result).be.instanceOf(Guid);
        expect(result.toByteArray()).to.have.members(bytes).and.to.have.lengthOf(16);
        expect(result.toString()).to.equal("123e4567-e89b-12d3-a456-426655440000");
    });

    it("Generate valid version 4 UUID using a byte array", async () => {
        const bytes: number[] = uuidv4("binary");
        const guid = bytesToUuid(bytes).toLowerCase();
        const result = new Guid(bytes);

        expect(result).be.instanceOf(Guid);
        expect(result.toByteArray()).to.have.members(bytes).and.to.have.lengthOf(16);
        expect(result.toString()).to.equal(guid);
    });

    it("Generate valid version 4 UUID using Guid.newGuid()", async () => {
        const result = Guid.newGuid();
        expect(result).be.instanceOf(Guid);

        const bytes: number[] = result.toByteArray();
        const guid = bytesToUuid(bytes).toLowerCase();

        expect(result.toString()).to.equal(guid);
    });
});
