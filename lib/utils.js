export default class Utils {
  static parseCommandLineArgumentForPackageNameAndVersion(argument) {
    let [name, version=""] = argument.split("@")
    return { name, version }
  }
}