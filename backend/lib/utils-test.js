const { expect } = require("chai");

describe("backend/lib/utils", () => {
  const subject = require("./utils");

  it("exists", () => {
    expect(subject).to.not.be.undefined;
  });
});
