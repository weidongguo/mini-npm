import crypto from "node:crypto";
import fs from "node:fs";
import zlib from 'node:zlib';
import { extract } from 'tar'

export default class Utils {
  /**
   * Given a string in the following format, parse for name and string
   * e.g. react@1.0.0 should yields { name: 'react', version: '1.0.0' }
   * 
   * @param {String} argument
   * @returns {Object} obj 
   *  obj.name: {String} package name
   *  obj.version: {String} sematic version the format of major.minor.patch
   */
  static parseForPackageNameAndVersion(str) {
    // We do last index of @ because a package name can actually starts with @
    // e.g. @babel/helper@10.3.4
    const index = str.lastIndexOf("@")

    if(index == -1) { // no version provided
      return {
        name: str,
        version: ''
      }
    }

    return {
      name: str.slice(0, index),
      version: str.slice(index+1)
    }
  }

  /**
   * Compute the shasum of the given file
   * @param {String} filePath Path to the file
   * @param {String} algorithm Default is 'sha1'. Other options are 'sha256', 'sha512', etc
   * @returns The shasum of the given file
   */
  static async shasum(filePath, algorithm='sha1') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);

      stream.on("data", (chunk) => {
        hash.update(chunk);
      });

      stream.on("end", () => {
        resolve(hash.digest('hex'));
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a directory if it isn't already there
   * @param {string} directory 
   * @returns Promise<string | undefined> See return type of fs.promises.mkdir for details
   */
  static createDirectoryIfDoestNotExist(directory) {
    return fs.promises.mkdir(directory, { recursive: true });
  }

  /**
   * Unpack a tgz file (i.e. tar and gzipped)
   * @param {string} filePath The file to be unpack
   * @param {string} outputPath The destination
   * @returns {Promise<void>}
   */
  static async unpackTgz(filePath, outputPath) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .pipe(extract({ cwd: outputPath}))
        .on('error', (err) => reject(err))
        .on('finish', () => resolve())
    });
  }

  /**
   * Asynchronously remove a file
   * @param {string} path Path to the file
   */
  static async removeFile(path) {
    fs.unlink(path, (err) => {
      if(err) {
        console.error(`Failed to remove ${path}`, err);
      }
    });    
  }

  /**
   * Retrive the last part of a URL
   *
   * e.g. https://registry.npmjs.org/sha.js/-/sha.js-2.4.11.tgz would return sha.js-2.4.11.tgz
   * @param {String} url 
   * @returns {string} last part of the url as filename
   */
  static deriveFilenameFromUrl(url) {
    const chunks = url.split("/")
    return chunks[chunks.length-1];
  }

  /**
   * Occasionally, the version range can have prefix such as npm.
   * This indicates that the package should be installed from npm registry.
   * e.g. "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0" has version range "npm:wrap-ansi@^7.0.0"
   * we want to normalize it and just extract ^7.0.0 out
   * 
   * @param {string} versionRange 
   * @returns {string} normalized version range, so make sure no prefix
   */
  static normalizeVersionRange(versionRange) {
    const tokens = versionRange.split('@');
    if (tokens.length > 1) {
      const prefix = tokens[0]
      
      return tokens[1]
    }

    if (tokens.length == 1) {
      return tokens[0]
    }
  }
}