const clientConnect = require("./client-connect");
const { validateDatasourceConfig } = require("./config-validation");

class MongoDbDataSource {
  /**
   * The constructor of the DataSource takes two parameters:
   *    config  : the value of 'config' from the `dataSources` configuration in
   *    ranvier.json
   *
   *    example :
   *    {
   *      host: "192.168.1.1",
   *      name: "myDatabase",
   *      user: "myUser",
   *      pass: "password",
   *    }
   *
   *    warning : see the ranvier website for security information concerning
   *    using .env files and ranvier.conf.js to protect your database information.
   *
   *    https://ranviermud.com/extending/entity_loaders/#sensitive-data
   */
  constructor(config = {}) {
    this.config = config;
    validateDatasourceConfig(this.config);
    this.client = clientConnect(this.uri);
  }

  get uri() {
    const user = encodeURIComponent(this.config.user);
    const password = encodeURIComponent(this.config.pass);
    const host = this.config.host;
    const authMechanism = "DEFAULT";
    const db = this.config.name;
    return `mongodb://${user}:${password}@${host}/?authMechanism=${authMechanism}&authSource=${db}`;
  }

  replaceCollection(config, data, callback) {
    this.client.catch(callback).then((client) => {
      const collection = this.clientCollection(client, config);
      collection
        // build filter without id, to capture other stuff in same
        // bundle/area only...
        .deleteMany(this.buildIdFilter(config))
        // eat the errors, important errors like connection issues
        // will be thrown with the insert
        .catch(() => {})
        .finally(() => {
          data.forEach((v) => (v._id = this.buildIdentity(config, v.id)));
          collection.insertMany(data, {}, callback);
        });
    });
  }

  replaceObject(config, id, data, callback) {
    this.client.catch(callback).then((client) => {
      const collection = this.clientCollection(client, config);
      if (data) {
        data._id = this.buildIdentity(config, id);
        collection.replaceOne(
          { _id: data._id },
          data,
          { upsert: true },
          callback
        );
      } else {
        collection.deleteOne(this.buildIdFilter(config, id), callback);
      }
    });
  }

  findCollection(config, callback) {
    this.client.catch(callback).then((client) => {
      this.clientCollection(client, config)
        .find(this.buildIdFilter(config))
        .toArray(callback);
    });
  }

  findObject(config, id, callback) {
    this.client.catch(callback).then((client) => {
      this.clientCollection(client, config).findOne(
        this.buildIdFilter(config, id),
        {},
        callback
      );
    });
  }

  clientCollection(client, config) {
    if (!config.collection) {
      throw new Error("No collection configured for MongoDbDatasource");
    }

    const db = client.db(this.config.name);
    return db.collection(config.collection);
  }

  close() {
    this.client
      .catch((err) => {
        throw new Error(err);
      })
      .then((client) => {
        if (client && client.isConnected()) {
          client.close();
        }
      });
  }

  buildIdentity(config, id) {
    const identity = {};
    if (id || id === 0) {
      identity.id = !isNaN(id) ? id : id.toString().toUpperCase();
    }
    if (config && config.bundle) {
      identity.bundle = config.bundle;
    }
    if (config && config.area) {
      identity.area = config.area;
    }
    return identity;
  }

  buildIdFilter(config, id) {
    const identity = this.buildIdentity(config, id);
    const filter = {};
    if (identity.id) {
      filter["_id.id"] = identity.id;
    }
    if (identity.area) {
      filter["_id.area"] = identity.area;
    }
    if (identity.bundle) {
      filter["_id.bundle"] = identity.bundle;
    }
    return filter;
  }
}

module.exports = MongoDbDataSource;
