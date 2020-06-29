const MongoClient = require("mongodb").MongoClient;

/*
  Saving singleton clients by Url...
  MongoDb apparently prefers a single connection, that you make
  multiple queries against. This is why we use singleton client.
  I suspect most people will only have 1 database, but just in
  case someone needs multiple connections we store clients in an
  object by uri instead of having a single client.
 */
let _singletonClients = {};
module.exports = clientConnect = async (uri) => {
  if (!uri) {
    return Promise.reject("No Url Provided for MongoDbDatasource Connection");
  }
  const isConnected =
    _singletonClients[uri] && _singletonClients[uri].isConnected();
  if (isConnected) {
    return Promise.resolve(_singletonClients[uri]);
  }
  return new Promise((resolve, reject) => {
    MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        _singletonClients[uri] = null;
        reject(err);
      }
      _singletonClients[uri] = client;
      resolve(_singletonClients[uri]);
    });
  });
};
