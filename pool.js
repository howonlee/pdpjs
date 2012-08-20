
var pool = function(name, count, type, copy_from){
    var obj = {};
    obj.name = name;
    obj.unit_count = count;
    obj.error = Matrix.Zero(1, count);
    obj.error_reset_value = Matrix.Zero(1, count);
    obj.target = Matrix.Zero(1, count);
    obj.delta = Matrix.Zero(1, count);
    obj.delta_reset_value = Matrix.Zero(1, count);
    obj.clamped_activation = 0;//0 no, 1 soft, 2 hard
    obj.activation = Matrix.Zero(1, count);
    obj.activation_reset_value = Matrix.Zero(1, count);
    obj.net_input = Matrix.Zero(1, count);
    obj.net_input_reset_value = Matrix.Zero(1, count);
    obj.activation_history = Matrix.Zero(1, count);
    obj.activation_function = "logistic";
    obj.error_history = Matrix.Zero(1, count);
    obj.extern_input = Matrix.Zero(1, count);
    obj.excitation = Matrix.Zero(1, count);
    obj.inhibition = Matrix.Zero(1, count);
    obj.projections = [];//normal js arrays for these
    obj.outgoing_projections = [];
    obj.noise = 0;
    obj.type = "hidden";
    obj.copy_from = undefined;
    obj.copyback = false;
    if (type) { obj.type = type }
    if (copy_from) { 
        obj.clamped_activation = 2;
        temp = [];
        for (var i = 0; i < count; i++){ temp.push(0.5); }
        obj.activation = $M(temp)
        obj.copy_from = copy_from;
        obj.copyback = true;
    }
    switch (obj.type){
        case "input":
            obj.clamped_activation = 2;
            break;
        case "output":
            obj.clamped_error = true;
            break;
        case "bias":
            obj.clamped_activation = 2;
            obj.activation = 1;//note that this is NOT a matrix
            break;
        case "connection":
            break;
        case "hidden":
            break;
        case "copyback":
            break;
    }

    obj.connect = function(obj, send_pool, proj_varORtype, con){
        var proj = projection(obj, send_pool);
        if (typeof(proj_varORtype) === "string") {
            proj.constraint_type = proj_varORtype;
            if (con){
                proj.constraint = con;
            } else {
                proj = proj_varORtype;
            }
        }
        obj.projections.push({"from": send_pool, "using" : proj});
        send_pool.outgoing_projections.push({"to" : obj, "using" : proj});
        return proj;
    }

    obj.get_error = function(){ return obj.error; }
    return obj;

}
