module.exports = QueryRunner;

function QueryRunner(sql, connection_list, callback) {
    this._raw_sql = sql;
    this._connection_list = connection_list;

    this._number_of_connections = Object.keys(this._connection_list).length;
    this._query_processed = 0;

    this._errors = {};
    this._results = {}; // (result :object) or (rows :array, columns :array)

    this._is_get_query_type = false;
    this._is_action_query_type = false;
    this._inconsitent_query_type_error = 'Inconsistent query type';

    this._callback = callback;
}

QueryRunner.prototype.runQuery = function () {

    for (var k in this._connection_list) {
        this._connection_list[k].query(this._raw_sql, function (index, err) {
            // overloaded args, either (err, result :object) or (err, rows :array, columns :array)
            if (err) {
                this._errors[index] = err;
            } else {
                var query_type = '';
                if (Array.isArray(arguments[2])) {
                    // response to a 'select', 'show' or similar
                    this._results[index] = {
                        rows: arguments[2],
                        columns: arguments[3]
                    };

                    this._is_get_query_type = true;
                } else {
                    // response to an 'insert', 'update' or 'delete'
                    this._results[index] = {
                        result: arguments[2]
                    };

                    this._is_action_query_type = true;
                }

                if (this._is_get_query_type === this._is_action_query_type) {
                    // we got mixed result
                    this._errors[index] = this._inconsitent_query_type_error;
                }
            }

            if (++this._query_processed === this._number_of_connections) {
                this._resultParser();
            }
            //
            //// or (err, rows :array, columns :array)
            //if (Array.isArray(arguments[1])) {
            //    // response to a 'select', 'show' or similar
            //    var rows = arguments[1], columns = arguments[2];
            //    conn.writeTextResult(rows, columns);
            //} else {
            //    // response to an 'insert', 'update' or 'delete'
            //    var result = arguments[1];
            //    conn.writeOk(result);
            //}
        }.bind(this, k));
    }
};

QueryRunner.prototype._resultParser = function () {
    if (this._is_get_query_type == this._is_action_query_type) {
        this._callback.call(
            null,
            {0: this._inconsitent_query_type_error},
            undefined
        );
    } else if (Object.keys(this._errors).length) {
        this._callback.call(
            null,
            this._errors,
            undefined
        );
    } else {
        var result = {};

        if (this._is_get_query_type) {
            result = this._resultParserForGetQueryType(this._results);
        } else {
            result = this._resultParserForActionQuery(this._results);
        }

        this._callback.call(
            null,
            undefined,
            result
        );
    }
};

QueryRunner.prototype._resultParserForGetQueryType = function (raw_result) {
    var result = {type: 'get_query', columns: [], rows: []},
        column_names = [];

    result.columns.push({
        catalog: 'def',
        schema: '',
        name: 'shard',
        orgName: 'shard',
        table: '',
        orgTable: '',
        characterSet: 33,
        columnLength: 384,
        columnType: 253,
        flags: 20485,
        decimals: 0
    });

    for (var c in raw_result) {
        for (var l in raw_result[c].columns) {
            if (-1 == column_names.indexOf(raw_result[c].columns[l].name)) {
                column_names.push(raw_result[c].columns[l].name);
                console.log(raw_result[c].columns[l]);
                result.columns.push(raw_result[c].columns[l]);
            }
        }
    }

    for (var cc in raw_result) {
        for (var ll in raw_result[cc].rows) {
            var row = {};
            row = raw_result[cc].rows[ll];
            row['shard'] = cc;
            //console.log(row);
            result.rows.push(row);
        }
    }

    //console.log(result.rows);
    return result;
};


QueryRunner.prototype._resultParserForActionQuery = function (raw_result) {
    var result = {type: 'action_query', result: {}};
};