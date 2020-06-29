const MongoDbDataSource = require("./mongodb-datasource");

class MongoDbArrayDataSource extends MongoDbDataSource {
  /**
   * The constructor of the DataSource takes two parameters:
   *   config: the value of 'config' from the `dataSources` configuration in
   *           ranvier.json
   *
   *   rootPath: A string representing the project root directory (the same
   *             directory that contains ranvier.json)
   */
  constructor(config = {}, rootPath) {
    super(config, rootPath);
  }

  /*
  The first parameter of each method from here on will be the config defined in
  the the 'entityLoaders' entry. For example:

    "entityLoaders": {
      "items": {
        "source": "MongoDb",
        "config": {
          "table": "items"
        },
      }
    }

    `config` would equal `{ collection: "items" }`

    Each method also returns a `Promise`
  */

  /**
   * Returns whether or not the configured collection has records
   *
   * @param {object} config
   * @return {Promise<boolean>}
   */
  hasData(config = {}) {
    return new Promise((resolve, reject) => {
      this.findCollection(config, (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results && results.length > 0) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  /**
   * Returns all entries for a given config.
   * @param {object} config
   * @return {Promise<any>}
   */
  fetchAll(config = {}) {
    return new Promise((resolve, reject) => {
      this.findCollection(config, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  /**
   * Gets a specific record by id for a given config
   * @param {Object} config
   * @param {string} id
   * @return {Promise<any>}
   */
  fetch(config = {}, id) {
    return new Promise((resolve, reject) => {
      this.findObject(config, id, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  /**
   * Perform a full replace of all data for a given config. This is the write
   * version of fetchAll
   * @param {Object} config
   * @param {any} data
   * @return {Promise}
   */
  replace(config = {}, data) {
    return new Promise((resolve, reject) => {
      this.replaceCollection(config, data, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.ops);
      });
    });
  }

  /**
   * Update specific record. Write version of `fetch`
   * @param {Object} config
   * @param {string} id
   * @param {any} data
   * @return {Promise}
   */
  update(config = {}, id, data) {
    return new Promise((resolve, reject) => {
      this.replaceObject(config, id, data, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
}

module.exports = MongoDbArrayDataSource;
