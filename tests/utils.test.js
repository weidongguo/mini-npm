import { describe, it } from "node:test"
import assert from 'node:assert'

import Utils from "../lib/utils.js"

describe("Test Utils", () => {
  it('parseCommandLineArgumentForPackageNameAndVersion', () => {
    const parseCommandLineArgumentForPackageNameAndVersion = Utils.parseCommandLineArgumentForPackageNameAndVersion;
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen@1.0.0"), { name: "is-thirteen", version: "1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen@^1.0.0"), { name: "is-thirteen", version: "^1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen"), { name: "is-thirteen", version: ""})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion(""), { name: "", version: ""})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("@1.0.0"), { name: "", version: "1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("mocha@10.3.4"), { name: "mocha", version: "10.3.4"})
  });
});