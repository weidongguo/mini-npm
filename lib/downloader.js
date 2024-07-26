import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import Utils from "./utils.js";

class Downloader {
  /**
   * Add a downloading task
   * 
   * After downloaded, it will automatically gunzip if it's a .tgz file
   *
   * @param {String} url The URL to download the file
   * @param {String} destination Path where the file will be saved
   * @param {Promise} resolves to the shasum of the file after it's downloaded at the specified destination
   */
  async addTask(url, destination) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination);

      const request = https.get(url, (response) => {
        response.pipe(file); 

        response.on("end", async () => {
          resolve(Utils.shasum(destination))
        })
      });

      request.on('error', (err) => {
        reject(err);
      });

      request.on('finish', async () => {
      });
    });
  }

  isDownloaded(destination) {
    const directory = path.dirname(destination)
    return fs.existsSync(`${directory}/package/package.json`)
  }
}

export default new Downloader();