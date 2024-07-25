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
  static parseCommandLineArgumentForPackageNameAndVersion(str) {
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

  static createDirectoryIfDoestNotExist(directory) {
    return fs.promises.mkdir(directory, { recursive: true });
  }

  static async unpackTgz(filePath, outputPath) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .pipe(extract({ cwd: outputPath}))
        .on('error', (err) => reject(err))
        .on('finish', () => resolve())
    });
  }
}