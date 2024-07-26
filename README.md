# mini-npm
This mini npm is not meant to be perfect as it's more like an exercise for how it can be implemented.

It supports the basic feature of adding a package to the package.json file's dependency. And then installing the dependencies
based on what's specified in package.json

## Implemented features
### Basic
#### Add
To add a dependecy to the recipe (i.e. package.json), run
```
node add <depedencyName>[@version]
```
For example, `node add is-thirteen@2.0.0`

If version is omitted, it will add the latest one. For example, `node add is-thirteen`

#### Install
To install the dependencies as specified in the recipe, run
```
node install
```

### Advanced
* Validation: How can you verify that an installation of a package is correct?
  * It's resolved through comparing the expected shasum of the archive (.tgz) with the computed shasum of the downloaded .tgz
  * Computing shasum of the downloaed file is done in line 23 in donwloader.js
  * Comparing the computed shasum with the expected shasum is done at line 33 in install.js

* Circular dependencies: What happens if there is a dependency graph like A → B → C → A?
  * This is avoided by keeping track of a dictionary of packages that we've recursed through thus far. If we've seen it before already,
  skip recursing down for that one.
  * This is implemented from line 46 - 50 in registry.js
* Caching:
  * Check if the package is already there. If so, no need to redownload.
    * The official npm determines there's no need to download if the following criteria is satisfied
      * A directory with the same package name
      * There's a package.json in that directory
    * I implemented the same for our mini-npm

### TODO
* Dependency conflict resolution: what happens if two dependencies require different versions of another dependency?

* Lock file: How can you make sure that installs are deterministic?

* Fun animation
