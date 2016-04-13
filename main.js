var mysql = require('mysql2'),
    DbAL = require('./src/dbal'),
    Config = require('./config'),
    server = mysql.createServer();

server.listen(3307);
server.on('connection', function (conn) {

    //var remote = mysql.createConnection({
    //    user: 'root',
    //    database: 'getresponse',
    //    host: 'mysql.virgo.deve.l',
    //    password: 'root',
    //    port: 3307
    //});

    conn.serverHandshake({
        protocolVersion: 10,
        serverVersion: 'node.js rocks',
        connectionId: 1234,
        statusFlags: 2,
        characterSet: 8,
        capabilityFlags: 0xffffff
    });

    var pool = new DbAL(Config.shards);
console.log(conn);
    conn.on('field_list', function (table, fields) {
        conn.writeEof();
    });

    conn.on('query', function (sql) {

        //console.log(pool);

        pool.processQuery(sql, function (errors, result) {
            //console.log(errors);
            //console.log(result.rows);
            conn.writeTextResult(result.rows, result.columns);
            //conn.writeOk();
        });

        //remote.query(sql, function (err) { // overloaded args, either (err, result :object)
        //    // or (err, rows :array, columns :array)
        //    if (Array.isArray(arguments[1])) {
        //        // response to a 'select', 'show' or similar
        //        var rows = arguments[1], columns = arguments[2];
        //        conn.writeTextResult(rows, columns);
        //    } else {
        //        // response to an 'insert', 'update' or 'delete'
        //        var result = arguments[1];
        //        conn.writeOk(result);
        //    }
        //});
    });

    conn.on('end', function () {
        conn._closing = true;
        //remote.end();
    });

    conn.on('quit', function () {
        conn._closing = true;
        //remote.end();
    });
});