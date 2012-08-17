var projection = function(rec, send, type, con){
    var obj = {};
    obj.constraint_type = "random";
    obj.constraint = [];
    obj.lr = [];
    if (type){
        obj.constraint_type = type;
        if (con){
            obj.constraint = con;
        }
    }

    obj.weights = Matrix.Zero(rec.unit_count, send.unit_count);
    obj.weights = obj.weights.map(function(x) { return x + 1; });
    obj.weds = Matrix.Zero(rec.unit_count, send.unit_count);
    obj.prev_weds = obj.weds;
    obj.weight_deltas = Matrix.Zero(rec.unit_count, send.unit_count);
    return obj;
}
