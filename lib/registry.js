// Use the user defined registry if defined in the environment variable.
// Otherwise, uses the default npm registry
const NPM_REGISTRY = process.env["NPM_REGISTRY"] ?? "https://registry.npmjs.org"

class Registry {
  #npmRegistry

  /* If npm registry is not specified, it will use NPM_REGISTRY */
  constructor(npmRegistry=NPM_REGISTRY) {
    this.#npmRegistry = npmRegistry
  }

  /**
   * Given a package, get its meta data 
   * @param {String} name Package name
   */
  async #getPackageMetaData(name) {
    const response = await fetch(`${this.#npmRegistry}/${name}`)
    return response.json();
  }

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

export default new Registry();