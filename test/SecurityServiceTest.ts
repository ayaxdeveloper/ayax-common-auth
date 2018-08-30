import { expect } from "chai";
import "mocha";
import { SecurityService } from "../src/Services/Security/SecurityService";

const ACCESSRULES = {
    BaseRead: "TEST_READ",
    ReadAll: "TEST_READ_ALL",
    WriteAll: "TEST_WRITE_ALL"
};

class SecurityServiceTest extends SecurityService {
    GetAccessRules(name: string): string[] {
        return [ACCESSRULES.ReadAll.toLocaleLowerCase(), ACCESSRULES.WriteAll.toLocaleLowerCase()];
    }
}
describe("Security Service", () => {
    it("UserHasAccessRule", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAccessRule(ACCESSRULES.ReadAll)).to.equal(true);
    });
    
    it("UserHasAccessRule", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAccessRule("111")).to.equal(false);
    });

    it("UserHasAnyAccessRule", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAnyAccessRule([ACCESSRULES.ReadAll, ACCESSRULES.WriteAll])).to.equal(true);
    });

    it("UserHasAnyAccessRule", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAnyAccessRule(["111"])).to.equal(false);
    });

    it("UserHasAccessRuleStartsWith", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAccessRuleStartsWith(ACCESSRULES.BaseRead)).to.equal(true);
    });

    it("UserHasAccessRuleStartsWith", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAccessRuleStartsWith("111")).to.equal(false);
    });

    it("UserHasAnyAccessRuleStartsWith", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAnyAccessRuleStartsWith([ACCESSRULES.BaseRead])).to.equal(true);
    });

    it("UserHasAnyAccessRuleStartsWith", () => {
        const service = new SecurityServiceTest();
        expect(service.UserHasAnyAccessRuleStartsWith(["111"])).to.equal(false);
    });
});