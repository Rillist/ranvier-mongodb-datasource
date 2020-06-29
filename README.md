# Description

A set of MongoDb datasources for Ranvier MUD that uses The official [MongoDB](https://www.mongodb.com/) [Driver for Node.js](https://github.com/mongodb/node-mongodb-native).

# Prerequisites

1. You must have a MongoDb database setup and ready to accept connections.

   1. Free Cloud Hosting with [MongoDb Atlas](https://www.mongodb.com/cloud/atlas)
   2. Locally Hosted [Installation Guide](https://docs.mongodb.com/manual/installation/)

2. You must have a Ranvier Mud project created that you intend to add the datasources to.
   1. [Get Started](https://ranviermud.com/get_started/)

## DataSources

- **MongoDbArrayDatasource**: For use with all entities expected to return an array from `fetchAll()` like: rooms, items, npcs, and quests.
- **MongoDbObjectDatasource**: For use with all entities expected to return an object (dictionary) from `fetchAll()` like: accounts, players, help, and areas.

### Registration in ranvier.json

Each datasource requires a config containing the database connection information inside the `dataSources` section of `ranvier.json`. And each entitySource requires a config containing the collection name to be used.

**Note**: You should never store your database connection in the ranvier.json file, see the [Ranvier Docs](https://ranviermud.com/extending/entity_loaders/#sensitive-data) for instructions on how to use a `.env` file and `ranvier.conf.js` to secure sensitive data.

**Note**: The collection name does not support any token insertion, collection names like `[AREA]-rooms` will not be changed. The datasources already handle bundle and area filtering, so all entities of the same type can be stored in the same collection. See the [Developer's Note](#developers-note-about-mongodbs-_id-field) below.

###### Example:

```js
{
  "dataSources": {
    "MongoDbArray": {
      require: "ranvier-mongodb-datasource.MongoDbArrayDatasource",
      config: {
        host: '<domain:port>',
        user: '<username>',
        pass: '<password>',
        name: '<database-name>',
      },
    },
    "MongoDbObject": {
      require: "ranvier-mongodb-datasource.MongoDbArrayDatasource",
      config: {
        host: '<domain:port>',
        user: '<username>',
        pass: '<password>',
        name: '<database-name>',
      },
    }
  },
  "entitySources": {
    "areas": {
      "source": "MongoDbObject",
      "config": {
        "collection": "areas"
      }
    },
    "rooms": {
      "source": "MongoDbArray",
      "config": {
        "collection": "rooms"
      }
    },
  }
}
```

## Developer's Note about MongoDb's \_id Field

MongoDb requires that all documents have a primary key field named `_id`. The datasource will populate this field with the entity `id` (converted to uppercase if string), area name, and bundle name provided by the Ranvier engine.

###### Example:

```js
{
  bundle: "bundle-example-areas",
  area: "limbo",
  id: "WHITE",
}
```

For entities which would not be part of an area (help), or which would not be part of a bundle (players, accounts), those fields will be omitted from the `_id` object. The datasources are aware of this schema, and will apply the appropriate bundle and area filters when querying for entities.
