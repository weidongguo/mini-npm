import fs from 'node:fs';

const FILE_PATH_PACKAGE_DOT_JSON = "./package2.json"

class Recipe {
  #recipeFile

  constructor(recipeFile) {
    this.#recipeFile = recipeFile;
  }
  
  /**
   * Get the content of package.json in the current directory
   * 
   * For detailed specification for the file, see
   * https://docs.npmjs.com/cli/v10/configuring-npm/package-json 
   * 
   * @returns Content of package.json as a JavaScript object. If doesn't exist, null
   */
  #getExistingPackageRecipe() {
    try {
      const data = fs.readFileSync(this.#recipeFile, 'utf8');
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
  #setPackageRecipe(recipe) {
    try {
      const content = JSON.stringify(recipe, null, 2) // Pretty print with 2-space indentation
      fs.writeFileSync(this.#recipeFile, content)
    } catch(err) {
      console.error(err);
    }
  }

  /**
   * Get the dependencies outlined in the recipe (i.e. package.json)
   * @returns {Object<string, string>} An collection of dependencies of (name and version)
   */
  getDependencies() {
    const { dependencies }  = this.#getExistingPackageRecipe() ?? {}
    if(!dependencies) {
      return {} 
    }

    return dependencies;
  }

  /**
   * Add a depdendency to package.json
   * @param {string} name Name of the package
   * @param {string} version Version of the package
   */
  addDependency(name, version) {
    let recipe = this.#getExistingPackageRecipe()

    // If there's not a package.json yet, no problem, start fresh
    if(!recipe) {
      recipe = {}
    }

    if(!recipe.dependencies) {
      recipe.dependencies = {}
    }

    recipe.dependencies[name] = version
    
    this.#setPackageRecipe(recipe)
  }
}

export default new Recipe(FILE_PATH_PACKAGE_DOT_JSON);
