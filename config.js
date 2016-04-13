var Config = {
    shards: [
        {
            user: 'root',
            database: 'getresponse',
            host: 'mysql.virgo.deve.l',
            password: 'root',
            port: 3307,
            name: 'shard1'
        },
        {
            user: 'root',
            database: 'getresponse',
            host: 'mysql.virgo.deve.l',
            password: 'root',
            port: 3308,
            name: 'shard2'
        },
        {
            user: 'root',
            database: 'getresponse',
            host: 'mysql.virgo.deve.l',
            password: 'root',
            port: 3309,
            name: 'shard3'
        },
        {
            user: 'root',
            database: 'getresponse',
            host: 'mysql.virgo.deve.l',
            password: 'root',
            port: 3310,
            name: 'shard3'
        }
    ]
};

module.exports = Config;