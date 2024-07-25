import fs from 'node:fs';

const FILE_PATH_PACKAGE_DOT_JSON = "./package2.json"

export default class Recipe {
  /**
   * Get the content of package.json in the current directory
   * 
   * For detailed specification for the file, see
   * https://docs.npmjs.com/cli/v10/configuring-npm/package-json 
   * 
   * @returns Content of package.json as a JavaScript object. If doesn't exist, null
   */
  static #getExistingPackageRecipe() {
    try {
      const data = fs.readFileSync(FILE_PATH_PACKAGE_DOT_JSON, 'utf8');
      return JSON.parse(data)
    } catch (err) {
      if(err.code === 'ENOENT') { // No such file
        // Meaning we don't have an existing one yet.
        // Not logging it as error because we do have fallback behavior
        return null
      }

      console.error(err)
    }
  }

  /**
   * Set the content of package.json in the current directory
   */
  static #setPackageRecipe(recipe) {
    try {
      const content = JSON.stringify(recipe, null, 2) // Pretty print with 2-space indentation
      fs.writeFileSync(FILE_PATH_PACKAGE_DOT_JSON, content)
    } catch(err) {
      console.error(err);
    }
  }

  static getDependencies() {
    const { dependencies }  = this.#getExistingPackageRecipe() ?? {}
    if(!dependencies) {
      return {} 
    }

    return dependencies;
  }

  /**
   * Add a depdendency to package.json
   * @param {String} name Name of the package
   * @param {String} version Version of the package
   */
  static addDependency(name, version) {
    let recipe = Recipe.#getExistingPackageRecipe()

    // If there's not a package.json yet, no problem, start fresh
    if(!recipe) {
      recipe = {}
    }

    if(!recipe.dependencies) {
      recipe.dependencies = {}
    }

    recipe.dependencies[name] = version
    
    Recipe.#setPackageRecipe(recipe)
  }
}
