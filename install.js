import registry from './lib/registry.js';
import downloader from './lib/downloader.js';
import Recipe from './lib/recipe.js';
import Utils from './lib/utils.js';
import fs from 'node:fs';

const INSTALLATION_DIRECTORY = "./node_modules2"

/**
 * Get all download URLs of the dependencies defined
 * in the recipe, package.json.
 * 
 * @returns {Object} obj
 *  obj['<package@version>'] = { url, shasum }
 */
async function getAllDependenciesUrls() {
  const dependencies = Recipe.getDependencies();
  const urls = {}
  for(const name in dependencies) {
    const version = dependencies[name];
    await registry.getPackageAndItsDependenciesDownloadURLs(name, version, urls);
  }
  return urls;
}

function deriveFilenameFromUrl(url) {
  const chunks = url.split("/")
  return chunks[chunks.length-1];
}

function download(url, destination, shasum) {
  return downloader.addTask(url, destination).then((sha1sum) => {
    if(sha1sum != shasum) {
      return Promise.reject(`${destination} is downloaded but it's corrupted`);
    }
  })
}

async function expand(tgzPath, outputDirectory) {
  return Utils.unpackTgz(tgzPath, outputDirectory) 
}

async function remove(path) {
  fs.unlink(path, (err) => {
    if(err) {
      console.error(`Failed to remove ${path}`, err);
    }
  });    
}

async function main() {
  await Utils.createDirectoryIfDoestNotExist(INSTALLATION_DIRECTORY);
  const urls = await getAllDependenciesUrls();  

  for(const fullyQualifiedPackage in urls) {
    const { url, shasum } = urls[fullyQualifiedPackage];
    const { name } = Utils.parseCommandLineArgumentForPackageNameAndVersion(fullyQualifiedPackage); 
    const outputDirectory = `${INSTALLATION_DIRECTORY}/${name}`
    await Utils.createDirectoryIfDoestNotExist(outputDirectory);
    const filename = deriveFilenameFromUrl(url);
    const destination = `${outputDirectory}/${filename}`

    download(url, destination, shasum)
      .then(async () => {
        await expand(destination, outputDirectory)
        remove(destination) // remove archive after it's exapnded
      })
      .catch((err) => {
        console.error(err)
      });
  }
}

main();