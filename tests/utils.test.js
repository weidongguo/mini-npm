import { describe, it } from "node:test"
import assert from 'node:assert'

import Utils from "../lib/utils.js"

import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
const __filename = fileURLToPath(import.meta.url); // Current file path 
const __dirname = dirname(__filename); // Current directory this file is in

describe("Test Utils", () => {
  it('parseCommandLineArgumentForPackageNameAndVersion', () => {
    const parseCommandLineArgumentForPackageNameAndVersion = Utils.parseCommandLineArgumentForPackageNameAndVersion;
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen@1.0.0"), { name: "is-thirteen", version: "1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen@^1.0.0"), { name: "is-thirteen", version: "^1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("is-thirteen"), { name: "is-thirteen", version: ""})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion(""), { name: "", version: ""})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("@1.0.0"), { name: "", version: "1.0.0"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("mocha@10.3.4"), { name: "mocha", version: "10.3.4"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("@mocha@10.3.4"), { name: "@mocha", version: "10.3.4"})
    assert.deepStrictEqual(parseCommandLineArgumentForPackageNameAndVersion("@babel/helper@10.3.4"), { name: "@babel/helper", version: "10.3.4"})
  });

  it('shasum', async() => {
    const sha1sum = await Utils.shasum(`${__dirname}/unit-test-sample-file.tgz`);
    assert.deepEqual(sha1sum, "0ae6414b6d7de3b6d85055cd2a920c1a0d61ad6e");
  });
});