import { describe, it } from "node:test"
import assert from 'node:assert'

import Utils from "../lib/utils.js"

import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
const __filename = fileURLToPath(import.meta.url); // Current file path 
const __dirname = dirname(__filename); // Current directory this file is in

describe("Test Utils", () => {
  it('parseForPackageNameAndVersion', () => {
    const parseForPackageNameAndVersion = Utils.parseForPackageNameAndVersion;
    assert.deepStrictEqual(parseForPackageNameAndVersion("is-thirteen@1.0.0"), { name: "is-thirteen", version: "1.0.0"})
    assert.deepStrictEqual(parseForPackageNameAndVersion("is-thirteen@^1.0.0"), { name: "is-thirteen", version: "^1.0.0"})
    assert.deepStrictEqual(parseForPackageNameAndVersion("is-thirteen"), { name: "is-thirteen", version: ""})
    assert.deepStrictEqual(parseForPackageNameAndVersion(""), { name: "", version: ""})
    assert.deepStrictEqual(parseForPackageNameAndVersion("@1.0.0"), { name: "", version: "1.0.0"})
    assert.deepStrictEqual(parseForPackageNameAndVersion("mocha@10.3.4"), { name: "mocha", version: "10.3.4"})
    assert.deepStrictEqual(parseForPackageNameAndVersion("@mocha@10.3.4"), { name: "@mocha", version: "10.3.4"})
    assert.deepStrictEqual(parseForPackageNameAndVersion("@babel/helper@10.3.4"), { name: "@babel/helper", version: "10.3.4"})
  });

  it('shasum', async() => {
    const sha1sum = await Utils.shasum(`${__dirname}/unit-test-sample-file.tgz`);
    assert.deepEqual(sha1sum, "0ae6414b6d7de3b6d85055cd2a920c1a0d61ad6e");
  });

  it('deriveFilenameFromUrl', async() => {
    assert.deepEqual(Utils.deriveFilenameFromUrl('https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz'), 'safe-buffer-5.2.1.tgz');
    assert.deepEqual(Utils.deriveFilenameFromUrl(''), '');
    assert.deepEqual(Utils.deriveFilenameFromUrl('abcd/efg'), 'efg');
  })

  it('normalizeVersionRange', () => {
    assert.deepEqual(Utils.normalizeVersionRange('wrap-ansi-cli', "npm:wrap-ansi@^7.0.0"), { normalizedName: 'wrap-ansi', normalizedVersionRange: '^7.0.0'});
    assert.deepEqual(Utils.normalizeVersionRange('wrap-ansi-cli', "wrap-ansi@^7.0.0"), { normalizedName: 'wrap-ansi', normalizedVersionRange: '^7.0.0'});
  });
});