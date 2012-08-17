//everything is mutable, basically
//you MUST set environment immediately after constructor. I don't get it, either
var bp_net = function (pools) {
    "use strict";
    var obj = bp_net_obj;
    obj.logistic = function (val) {
        console.log("Logistic function with input val " + val);
        var retval = val;
        if (retval > 15.935773974) { retval = 15.935773974; }
        if (retval < -15.935773974) { retval = -15.935773974; }
        return (1.0 / (1.0 + Math.exp(-1 * retval)));
    };
    obj.add_bias_projections = function () {
        console.log("adding bias projections...");
        if (obj.pools) {
            if (obj.pools.length > 1) {
                for (var i = 1; i < obj.pools.length; i++){
                    var type = obj.pools[i].type;
                    if (type === "input" || type === "bias"){
                        continue;
                    }
                    obj.pools[i].connect(obj.pools[i], obj.pools[1]);
                }
            }
        }
    };
    obj.type = "bp";
    console.log(pools);
    obj.pools = new Array(pool("bias", 1, "bias"))
    obj.pools = obj.pools.concat(pools);
    console.log(obj.pools);
    if (!obj.manual_bias){
        obj.add_bias_projections(obj);
    }
    console.log(obj);
    obj.reset_weights = function(){
        console.log("resetting weights...");
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                switch (obj.pools[i].projections[j].using.constraint_type){
                    /*case "random":
                      var len = obj.pools[i].projections[j].using.weights.length;
                      obj.pools[i].projections[j].using.weights =
                      Matrix.Random(len, len);
                      obj.pools[i].projections[j].using.weights =
                      obj.pools[i].projections[j].using.weights.map(
                      function(x) {
                      return(x - 0.5) * obj.train_options.wrange;
                      });
                      break;
                      case "scalar":
                      var len = obj.pools[i].projections[j].using.weights.length;
                      obj.pools[i].projections[j].using.weights = Matrix.Zero(len, len);
                      obj.pools[i].projections[j].using.weights =
                      obj.pools[i].projections[j].using.weights.map(
                      function(x){
                      return x + 1;//gotta return inner product
                      });
                      break;*/
                }
            }
        }
    };
    obj.reset_weights(); //call

    obj.reset_net_input = function(){
        console.log("resetting net inputs...");
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].net_input = Matrix.Zero(1, obj.pools[i].net_input.length);
        }
    };

    obj.reset_net = function(){
        console.log("resetting net...");
        obj.epochno = 0;
        obj.patno = 0;
        obj.next_patno = 1;
        obj.next_epochno = 1;
        obj.tss = 0;
        obj.pss = 0;
        obj.gcor = 0;
        obj.css = 0;
        for (var i = 1; i < obj.pools.length; i++){//start from 1
            obj.pools[i].activation = obj.pools[i].activation_reset_value;
        }
        obj.reset_net_input();
        obj.reset_weights();
        obj.environment.sequence_index = obj.net_patno;
        obj.clamp_pools();
    };

    obj.clamp_pools = function(){
        console.log("clamping pools...");
        var pat = obj.environment.current_patterns;
    };
    obj.compute_output = function(){
        console.log("computing output...");
    };
    obj.compute_error = function(){
        console.log("computing error...");
    };
    obj.compute_weds = function(){
        console.log("computing weds...");
    };
    obj.change_weights = function(){
        console.log("changing weights...");
    };
    obj.sumstats = function(){
        console.log("summing stats....");
    };
    obj.train = function(){
        console.log("training...");
    };
    obj.test = function(){
        console.log("testing...");
    };

    obj.set_environment = function(value){
        console.log("setting environment...");
        obj.environment = value;
        obj.clamp_pools();
    };
    return obj;
};
