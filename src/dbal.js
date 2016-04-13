var mysql = require('mysql2'),
    QueryRunner = require('./query_runner');

module.exports = DbAL;

function DbAL(shards) {
    undefined != shards || console.error('No shard configuration!');
    this._shards_configs = shards;
    this._connections = {};

    this._connect();
};

DbAL.prototype._connectionName = function (shard_config) {
    return undefined != shard_config.name ? shard_config.name : shard_config.host + ':' + shard_config.pool;
};

DbAL.prototype._connect = function () {
    for (var k in this._shards_configs) {
        this._connections[this._connectionName(this._shards_configs[k])] = mysql.createConnection({
            host:       this._shards_configs[k].host,
            user:       this._shards_configs[k].user,
            password:   this._shards_configs[k].password,
            database:   this._shards_configs[k].database,
            port:       this._shards_configs[k].port
        });
    }
};

DbAL.prototype.processQuery = function (sql, callback) {
    new QueryRunner(sql, this._connections, callback).runQuery();
};
