#!/usr/bin/env node

import registry from './lib/registry.js';
import downloader from './lib/downloader.js';
import recipe from './lib/recipe.js';
import Utils from './lib/utils.js';

const INSTALLATION_DIRECTORY = "./node_modules"

/**
 * Get all download URLs of the dependencies defined
 * in the recipe (i.e. package.json) as well as their dependencies'
 *
 * @returns {Promise<Object<string, { url: string, shasum: string }>>} Resolves to a dictionary of URLs
 */
async function getAllDependenciesUrlsPerRecipe() {
  const dependencies = recipe.getDependencies();
  const urls = {}

  const promises = Object.entries(dependencies).map(([name, version]) => registry.getPackageAndItsDependenciesDownloadURLs(name, version, urls));
  await Promise.all(promises);

  return urls;
}

/**
 * Download the archive specified by the URL. It's no-op if it was already downloaded.
 * @param {string} url The remote URL for fetching the archive 
 * @param {string} destination Where to store the downloaded archive
 * @param {string} shasum Expected sha1 sum of the archive
 * @returns Promise resolves to true if newly downloaded. False if no-op due to cache. Rejects if any error occurs
 */
async function downloadIfNotCached(url, destination, shasum) {
  // Check if it's already downloaded
  if(downloader.isDownloaded(destination)) {
    return true
  }

  return downloader.addTask(url, destination).then((sha1sum) => {
    if(sha1sum != shasum) {
      return Promise.reject(`${destination} is downloaded but it's corrupted`);
    }
    return false
  })
}

/**
 * Download all packages specified in the urls collection
 * @param {Object<string, { url: string, shasum: string }>} urls 
 */
async function batchDownload(urls) {
  await Utils.createDirectoryIfDoestNotExist(INSTALLATION_DIRECTORY);

  for(const fullyQualifiedPackage in urls) {
    const { url, shasum } = urls[fullyQualifiedPackage];
    const { name } = Utils.parseForPackageNameAndVersion(fullyQualifiedPackage); 
    const outputDirectory = `${INSTALLATION_DIRECTORY}/${name}`
    await Utils.createDirectoryIfDoestNotExist(outputDirectory);
    const filename = Utils.deriveFilenameFromUrl(url);
    const destination = `${outputDirectory}/${filename}`

    downloadIfNotCached(url, destination, shasum)
      .then(async (wasCached) => {
        if(wasCached){
          // If reusing cache, no subsequent operation is needed
          console.log(`Found cached package for ${fullyQualifiedPackage}`);
          return
        }
        
        console.log(`Downloaded ${fullyQualifiedPackage}`)

        // Otherwise, it's newly downloaded. Unpack the archive and then remove it.
        await Utils.unpackTgz(destination, outputDirectory);
        Utils.removeFile(destination)
      })
      .catch((err) => {
        console.error(err)
      });
  }
}

async function main() {
  try {
    const urls = await getAllDependenciesUrlsPerRecipe();  

    // Show packages that we're about to download as a table
    if(Object.entries(urls).length > 0) {
      console.table(urls)
    }

    await batchDownload(urls);
  } catch (err) {
    console.error(err);
  }
}

main();