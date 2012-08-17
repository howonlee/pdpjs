
var pool = function(name, count, type, copy_from){
    var obj = {};
    obj.name = name;
    obj.unit_count = count;
    tempSize = [];
    for (var i = 0; i < count; i++){
        tempSize.push(0);
    }
    obj.error = $M(tempSize);
    obj.error_reset_value = $M(tempSize);
    obj.target = $M(tempSize);
    obj.delta = $M(tempSize);
    obj.delta_reset_value = $M(tempSize);
    obj.clamped_activation = 0;//0 no, 1 soft, 2 hard
    obj.activation = $M(tempSize);
    obj.activation_reset_value = $M(tempSize);
    obj.net_input = $M(tempSize);
    obj.net_input_reset_value = $M(tempSize);
    obj.activation_history = $M(tempSize);
    obj.activation_function = "logistic";
    obj.error_history = $M(tempSize);
    obj.extern_input = $M(tempSize);
    obj.excitation = $M(tempSize);
    obj.inhibition = $M(tempSize);
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
            obj.activation = 1;
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
