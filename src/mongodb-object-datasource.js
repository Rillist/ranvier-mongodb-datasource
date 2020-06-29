const MongoDbArrayDataSource = require("./mongodb-array-datasource");

class MongoDbObjectDataSource extends MongoDbArrayDataSource {
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
        /* Data should output as a dictionary, convert from array. */
        const resultsDictionary =
          (results &&
            results.reduce((output, result) => {
              output[result.id] = result;
              return output;
            }, {})) ||
          {};
        resolve(resultsDictionary);
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
      /* Data should come in as a dictionary, convert to array. */
      const dataArray = Object.values(data);
      this.replaceCollection(config, dataArray, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.ops);
      });
    });
  }
}

module.exports = MongoDbObjectDataSource;
