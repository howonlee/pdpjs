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

    obj.weights = new goog.math.Matrix(rec.unit_count, send.unit_count);//want to be ones
    obj.weights = goog.math.Matrix.map(obj.weights, function(x){ return x + 1; });
    obj.weds = new goog.math.Matrix(rec.unit_count, send.unit_count);
    obj.pre_weds = new goog.math.Matrix(rec.unit_count, send.unit_count);
    obj.weight_deltas = new goog.math.Matrix(rec.unit_count, send.unit_count);
    return obj;
}
