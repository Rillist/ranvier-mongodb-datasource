const ERR_MSG = {
  NULL_DATASOURCE_CONFIG: "Null MongoDbDatasource config",
  NULL_HOST: "Invalid MongoDbDatasource config: 'host' (ip:port) is required.",
  NULL_NAME:
    "Invalid MongoDbDatasource config: 'name' (database name) is required.",
  NULL_USER:
    "Invalid MongoDbDatasource config: 'user' (user name) is required.",
  NULL_PASS:
    "Invalid MongoDbDatasource config: 'pass' (user password) is required.",
};

module.exports = {
  validateDatasourceConfig(config) {
    _err = [];
    if (!config) {
      _err.push(ERR_MSG.NULL_DATASOURCE_CONFIG);
    } else {
      if (!config.host) {
        _err.push(ERR_MSG.NULL_HOST);
      }
      if (!config.name) {
        _err.push(ERR_MSG.NULL_NAME);
      }
      if (!config.user) {
        _err.push(ERR_MSG.NULL_USER);
      }
      if (!config.pass) {
        _err.push(ERR_MSG.NULL_PASS);
      }
    }
    if (_err.length > 0) {
      throw new Error(_err);
    }
  },
};
