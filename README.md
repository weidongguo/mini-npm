# mini-npm
This mini npm is not meant to be perfect as it's more like an exercise for how a node package manager can be implemented.

It supports the basic feature of adding a dependency to the package reciple (i.e. `package.json`). And then installing the dependencies
based on what's specified in recipe.

## Installation
To install this package as executable in your OS, run
```
npm install
npm link
```
at this project's directory. This will make the executable `mini-npm-add` and `mini-npm-install` available to used globally
in your OS.


## Use Cases
### Basic
#### Add
To add a dependecy to the recipe (i.e. package.json), run
```
mini-npm-add <depedencyName>[@version]
```
For example, `mini-npm-add is-thirteen@2.0.0`

If version is omitted, it will add the latest one. For example, `mini-npm-add add is-thirteen`

After running the command above, you should expect a `package.json` generated
by content similar to 
```
{
  "dependencies": {
    "is-thirteen": "2.0.0"
  }
}
```

#### Install
To install the dependencies as specified in the recipe, run
```
mini-npm-install
```

### Advanced
* Validation: How can you verify that an installation of a package is correct?
  * It's resolved through comparing the expected shasum of the archive (.tgz) with the computed shasum of the downloaded .tgz
  * Computing shasum of the downloaed file is done in line 24 in donwloader.js
  * Comparing the computed shasum with the expected shasum is done at line 41 in install.js

* Circular dependencies: What happens if there is a dependency graph like A → B → C → A?
  * This is avoided by keeping track of a dictionary of packages that we've recursed through thus far. If we've seen it before already,
  skip recursing down for that one.
  * This is implemented from line 53-56 in registry.js
* Caching:
  * Check if the package is already there. If so, no need to redownload.
    * The official npm determines there's no need to download if the following criteria is satisfied
      * A directory with the same package name
      * There's a package.json in that directory
    * Implemented the same for our mini-npm at line 37-40 in downloader.js

### Future Improvements
* Dependency conflict resolution: what happens if two dependencies require different versions of another dependency?
  * No action is taken to handle this at the moment. The current behavior is that the first downloaded one stays due to how each package is cached because any subsequent downloads even with different
  version would think that it's already downloaded. Please note that when we store packages in node_modules, the directory name doesn't have version information.

* Lock file: How can you make sure that installs are deterministic?

* Fun animation
