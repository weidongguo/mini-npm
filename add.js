import registry from './lib/registry.js';
import Recipe from './lib/recipe.js';
import Utils from './lib/utils.js'

/**
 * Get the argument for add.js from command line.
 * 
 * E.g. For command "node add.js is-thirteen",
 * "is-thirteen" is returned. If argument is not supplied, emtpy string
 * is returned.
 * 
 * @returns {String} The argument for add.js
 */
function getCommandLineArgument() {
  return process.argv[2] ?? ""
}

/**
 * Get package name and version from command line
 *
 * @returns {
 *  name: {String} // package name. Empty string if not provided
 *  version: {String} // package version. Empty string if not provided
 * }
 */
function getPackageNameFromCommandLine() {
  const argument = getCommandLineArgument();
  return Utils.parseForPackageNameAndVersion(argument) ;
}

/**
 * Get package name and version. If version is not supplied by the
 * user, we'll fetch the latest one from npm registry
 * @returns 
 */
async function getPackageName() {
  let { name, version } = getPackageNameFromCommandLine() 

  if(!version) {
    version = await registry.getPackageLatestVersion(name)
  }

  return { name, version }
}

async function main() {
  const { name, version } = await getPackageName();
  if(!name) {
    console.error("Skipped. Package name is not provided")
    return
  }

  if(!version) {
    console.error("Skipped. Invalid version")
    return
  }

  Recipe.addDependency(name, version)
}

main();