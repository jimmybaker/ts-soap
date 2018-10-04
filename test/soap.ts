import { expect } from "chai";

// import Soap from "../lib";

describe("soap", () => {
  it("makes you clean", () => {
    const soap = new Soap();
    expect(soap).to.not.be.undefined;
  });
});
