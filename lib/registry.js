import semver from 'semver';
import Utils from './utils.js';

// Use the user defined registry if defined in the environment variable.
// Otherwise, uses the default npm registry
const NPM_REGISTRY = process.env["NPM_REGISTRY"] ?? "https://registry.npmjs.org"

class Registry {
  #npmRegistry

  constructor(npmRegistry) {
    this.#npmRegistry = npmRegistry
  }

  /**
   * Given a package name, get its meta data 
   * @param {String} name Package name
   * @returns {Promise<Object>} Promise resolves to the object representing the meta data for the package
   */
  async #getPackageMetaData(name) {
    const response = await fetch(`${this.#npmRegistry}/${name}`)
    return response.json();
  }

  /**
   * Get the max satisfying version of a particular package.
   * @param {String} name Package name
   * @param {String} versionRange e.g. ^1.1.0 means keep major version, ~1.1.0 means keeps major & minor version
   * @returns {Promise<String>} Promise resolves to the satisfying version
   */
  async #getPackageMaxSatisfyingVersion(name, versionRange) {
    const metadata = await this.#getPackageMetaData(name);
    const versions = Object.keys(metadata.versions);
    const normalizedVersionRange = Utils.normalizeVersionRange(versionRange);
    return semver.maxSatisfying(versions, normalizedVersionRange);
  }

  /**
   * Given a package name and version range, get its download URL
   * and all of its dependencies's download URLs
   * @param {String} name Package name
   * @param {String} versionRange semantic versioning. See https://semver.org/
   * @param {{ <fullyQualifiedPackage>: { url, shasum }}} outputURLs The output of the function containing this package's download URL and all
   *  of it's depedencies' URLs
   */
  async getPackageAndItsDependenciesDownloadURLs(name, versionRange, outputURLs) {
    const version = await this.#getPackageMaxSatisfyingVersion(name, versionRange)
    if(!version) {
      throw `No matching version found for ${versionRange}`;
    }

    const fullyQualifiedPackage = `${name}@${version}`
    if(outputURLs[fullyQualifiedPackage]) {
      // if it has already been processed, don't recurse further to avoid a cyclic reference
      console.debug(`Cylic reference detected for ${fullyQualifiedPackage}. Skipped`);
      return;
    }

    const response = await fetch(`${this.#npmRegistry}/${name}/${version}`)
    const metadata = await response.json();

    if(!metadata["dist"]) {
      throw `Failed to get download URL for package ${name}@${version}`
    }

    // Get download URL for the package

    const url = metadata["dist"]["tarball"];
    const shasum = metadata["dist"]["shasum"];
    if(!url) {
      throw `Failed to get download URL for package ${name}@${version}`
    }

    outputURLs[fullyQualifiedPackage] = { url, shasum, versionRange }; // versioRange is optional here but added for logging purpose

    // Recurse to get download URLs for its dependencies

    const { dependencies } = metadata;
    if(!dependencies) {
      return;
    }

    const promises = Object.entries(dependencies).map(([dependencyName, dependencyVersionRange]) => {
      return this.getPackageAndItsDependenciesDownloadURLs(dependencyName, dependencyVersionRange, outputURLs);
    });

    // Allow fetching in parallel
    return Promise.all(promises);
  }

  /**
   * Get the latest version of a given package
   * @param {String} name Package name
   * @returns {Promise<String>} Resolves to the latest version
   */
  async getPackageLatestVersion(name) {
    try {
      const metadata = await this.#getPackageMetaData(name)

      if(metadata.error) {
        throw `Package '${name}' ${metadata.error}`;
      }

      if(!metadata["dist-tags"]) {
        return ""
      }

      return metadata["dist-tags"]["latest"] ?? "";
    } catch(err) {
      console.error(err);
      return ""
    }
  }
}

export default new Registry(NPM_REGISTRY);