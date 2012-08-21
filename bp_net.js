//everything is mutable, basically
//you MUST set environment immediately after constructor. I don't get it, either
var bp_net = function (pools) {
    "use strict";
    var obj = bp_net_obj;
    //TESTED
    obj.logistic = function (val) {
        console.log("Logistic function with input val " + val);
        var retval = val;
        if (retval > 15.935773974) { retval = 15.935773974; }
        if (retval < -15.935773974) { retval = -15.935773974; }
        return (1.0 / (1.0 + Math.exp(-1 * retval)));
    };
    //TESTED
    obj.add_bias_projections = function () {
        console.log("adding bias projections...");
        if (obj.pools) {
            if (obj.pools.length > 1) {
                for (var i = 1; i < obj.pools.length; i++){
                    var type = obj.pools[i].type;
                    if (type === "input" || type === "bias"){
                        continue;
                    }
                    obj.pools[i].connect(obj.pools[i], obj.pools[0]);
                }
            }
        }
    };
    obj.type = "bp";
    obj.pools = new Array(pool("bias", 1, "bias"))
    obj.pools = obj.pools.concat(pools);
    console.log(obj.pools);
    if (!obj.manual_bias){
        obj.add_bias_projections(obj);
    }
    console.log(obj);
    //NOT TESTED
    obj.reset_weights = function(){
        console.log("resetting weights...");
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                switch (obj.pools[i].projections[j].using.constraint_type){
                    case "random":
                        console.log("doing random");
                        var len = obj.pools[i].projections[j].using.weights.elements.length;
                        obj.pools[i].projections[j].using.weights =
                                Matrix.Random(len, len);
                        obj.pools[i].projections[j].using.weights =
                            obj.pools[i].projections[j].using.weights.map(
                                    function(x) {
                                        return(x - 0.5) * obj.train_options.wrange;
                                    });
                        break;
                    case "scalar":
                        console.log("doing scalar");
                        var len = obj.pools[i].projections[j].using.weights.elements.length;
                        obj.pools[i].projections[j].using.weights = Matrix.Zero(len, len);
                        obj.pools[i].projections[j].using.weights =
                            obj.pools[i].projections[j].using.weights.map(
                                    function(x, i, j){
                                        return (x + 1) * obj.pools[i].projections[j].using.constraint.e(i, j);
                                    });
                        break;
                }
            }
        }
    };
    obj.reset_weights(); 

    //NOT TESTED
    obj.reset_net_input = function(){
        console.log("resetting net inputs...");
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].net_input = Matrix.Zero(1, obj.pools[i].net_input.length);
        }
    };

    //NOT TESTED
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

    //NOT TESTED
    obj.clamp_pools = function(){
        console.log("clamping pools...");
        var pat = obj.environment.current_patterns;
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].target = obj.pools[i].target.map(function(x) {
                return null;
            });
        }
        //currently, this whole damn thing will do jack shit
        //because of locality of variables
        //I make a curr_pool, it does nothing to anything
        //we go on the glorious principle of "make it work goddammit" now
        var curr_pool = null;
        for (var i = 0; i < pat.length; i++){
            if (!pat[i].pool){
                if (pat[i].type === "T"){
                    curr_pool = obj.pools[obj.pools.length];
                } else {
                    curr_pool = obj.pools[1]; //first non-bias pool
                }
            }
            switch (pat[i].type){
                case "H":
                    curr_pool.activation = pat[i].pattern;
                    var act = curr_pool.activation;
                    var net_input = [];
                    for (var i = 0; i < act.length; i++){
                        if (act[i] === 1){ act[i] = 0.99999988; }
                        if (act[i] === 0){ act[i] = 0.00000012; }
                        net_input.push(Math.log(act[i] /(1 - act[i])));
                    }
                    curr_pool.clamped_activation = 2;
                    break;
                case "S":
                    curr_pool.net_input = pat[i].pattern;
                    curr_pool.clamped_activation = 1;
                    break;
                case "T":
                    curr_pool.target = pat[i].pattern;
                    curr_pool.clamped_error = true;
                    break;
            }
        }
    };

    //NOT TESTED
    obj.compute_output = function(){
        console.log("computing output...");
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].net_input = obj.pools[i].net_input_reset_value;
            if (obj.pools[i].clamped_activation === 2) { continue; }
            obj.pools[i].activation = obj.pools[i].activation_reset_value;
            console.log("checkpoint 1");
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                var from = obj.pools[i].projections[j].from;
                console.log(from);
                if (typeof from.activation === "number"){
                    //aka, from is a bias pool
                    //fill in here
                } else {
                    //fill in here  
                }
                obj.pools[i].net_input = obj.pools[i].net_input.add(from.activation.x(obj.pools[i].projections[j].using.weights));
                console.log("checkpoint 2");//and we never get here
            }
            switch (obj.pools[i].activation_function){
                case "logistic":
                    obj.pools[i].activation = obj.pools[i].activation.map(function(x, i, j) { return x + obj.logistic(obj.pools[i].net_input.e(i, j));})
                    break;
                case "linear":
                    obj.pools[i].activation = obj.pools[i].activation.add(obj.pools[i].net_input);
                    break;
            }
        }
    };

    //NOT TESTED
    obj.compute_error = function(){
        console.log("computing error...");
        for (var i = obj.pools.length; i > 0; i--){
            obj.pools[i].delta = obj.pools[i].delta_reset_value;
            obj.pools[i].error = obj.pools[i].error_reset_value;
            if (obj.pools[i].target){
                obj.pools[i].error = obj.pools[i].error
                                    .add(obj.pools[i].target)
                                    .subtract(obj.pools[i].activation);
            }
            switch (obj.train_options.errmeas){
                case "cee":
                    obj.pools[i].delta = obj.pools[i].error;
                    break;
                case "sse":
                    obj.pools[i].delta = obj.pools[i].error
                        .map(function(x, i, j){
                            var act = obj.pools[i].activation.e(i, j);
                            return x * act * (1 - act);
                        });
                    break;
            }
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                obj.pools[i].projections[j].from.error =
                    obj.projections[j].from.error
                        .add(obj.pools[i].delta.x(obj.pools[i].projections[j].using.weights));
            }
            if (obj.pools[i].type === "connection"){
                obj.pools[i].error_reset_value =
                    obj.pools[i].error_reset_value.add(obj.pools[i].error);
            }

        }
    };

    //NOT TESTED
    obj.compute_weds = function(){
        console.log("computing weds...");
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                obj.pools[i].projections[j].using.weds =
                    obj.pools[i].projections[j].using.weds
                        .add( obj.pools[i].delta
                                .transpose()
                                .x(obj.pools[i].projections[j].from.activation)
                            );
            }
        }
    };

    //NOT TESTED
    obj.change_weights = function(){
        console.log("changing weights...");
        var p_css = 0;
        var dp = 0;
        if (obj.train_options.follow){
            p_css = obj.css;
            obj.css = 0;
        }

        var mo = obj.train_options.momentum;
        var decay = obj.train_options.wdecay;
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                var lr = null;
                if (!obj.pools[i].projections[j].using.lr){
                    lr = obj.train_options.lrate;
                } else {
                    lr = obj.pools[i].projections[j].using.lr; 
                }
                obj.pools[i].projections[j].using.weight_deltas =
                    obj.pools[i].projections[j].using.weight_deltas.x(lr)
                    .subtract(obj.pools[i].projections[j].using.weights.x(decay))
                    .add(obj.pools[i].projections[j].using.weight_deltas.x(mo));

                if (obj.train_options.follow){
                    //fill in here
                }
                obj.pools[i].projections[j].using.prev_weds =
                    obj.pools[i].projections[j].using.weds;
                obj.pools[i].projections[j].using.weights =
                    obj.pools[i].projections[j].using.weights
                    .add(obj.pools[i].projections[j].using.weight_deltas);
                obj.pools[i].projections[j].using.weds =
                    obj.pools[i].projections[j].using.weds.x(0);//to all zeroes
            }
        }

        if (obj.train_options.follow){
            var den = p_css * obj.css;
            if (den > 0){
                obj.gcor = dp / (Math.sqrt(den));
            } else {
                obj.gcor = 0;
            }
        }
    };

    //NOT TESTED
    obj.sumstats = function(){
        console.log("summing stats....");
        obj.pss = 0.0;
        obj.pce = 0.0;
        if (obj.patno === 1){ obj.tss = 0.0; }
        //fill in here
    };

    //NOT TESTED
    obj.train = function(){
        console.log("training...");
        var epoch_limit = (Math.floor(obj.epochno / obj.train_options.nepochs) + 1) * obj.train_options.nepochs;
        while (obj.net_epochno <= epoch_limit){
            obj.epochno = obj.next_epochno;
            while (obj.next_patno <= obj.environment.sequences.length){
                obj.patno = obj.next_patno;
                obj.environment.sequence_index = obj.patno;
                obj.clamp_pools();
                obj.compute_output();
                obj.compute_error();
                obj.sumstats();
                obj.compute_weds();
                if (obj.train_options.lgrain === "pattern") {
                    obj.change_weights();
                }
                obj.next_patno += 1;
                if (obj.done_updating_patno){
                    return false;
                }
            }
            if (obj.train_options.lgrain === "epoch"){ obj.change_weights(); }
            obj.next_patno = 1;
            obj.epochno = obj.next_epochno;
            obj.next_epochno += 1;
            if (obj.done_updating_epochno) { return false; } 
        }
    };

    //NOT TESTED
    obj.test = function(){
        console.log("testing...");
        while (obj.next_patno < obj.environment.sequences.length){
            obj.patno = obj.next_patno;
            obj.environment.sequence_index = obj.patno;
            obj.clamp_pools();
            obj.compute_output();
            obj.compute_error();
            obj.sumstats();
            obj.next_patno = obj.patno + 1;
            if (obj.done_updating_patno) { return false; }
        }
        obj.next_patno = 1;
        obj.tss = 0;
    };

    //NOT TESTED
    obj.set_environment = function(value){
        console.log("setting environment...");
        obj.environment = value;
        obj.clamp_pools();
    };
    return obj;
};
