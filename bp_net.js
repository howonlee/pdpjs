//everything is mutable, basically
//you MUST set environment immediately after constructor. I don't get it, either
var bp_net = function (pools) {
    "use strict";
    var obj = JSON.parse(JSON.stringify(bp_net_obj));//copy constructor
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

    //TESTED
    obj.reset_weights = function(){
        console.log("resetting weights...");
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                switch (obj.pools[i].projections[j].using.constraint_type){
                    case "random":
                        console.log("doing random");
                        obj.pools[i].projections[j].using.weights =
                            goog.math.Matrix.map(obj.pools[i].projections[j].using.weights,
                                    function(x) {
                                        return(Math.random() - 0.5) * obj.train_options.wrange;
                                    });
                        break;
                    case "scalar":
                        console.log("doing scalar");
                        obj.pools[i].projections[j].using.weights =
                            goog.math.Matrix.map( obj.pools[i].projections[j].using.weights,
                                    function(x, i, j){
                                        return (x + 1) * obj.pools[i].projections[j].using.constraint.getValueAt(i, j);
                                    });
                        break;
                }
            }
        }
    };

    //TESTED
    obj.reset_net_input = function(){
        console.log("resetting net inputs...");
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].net_input = new goog.math.Matrix(1,obj.pools[i].net_input.getSize().width);
        }
    };

    //TESTED
    obj.reset_net = function(){
        console.log("resetting net...");
        obj.epochno = 0;
        obj.patno = 0;
        obj.next_patno = 0;
        obj.next_epochno = 0;
        obj.tss = 0;
        obj.pss = 0;
        obj.gcor = 0;
        obj.css = 0;
        for (var i = 1; i < obj.pools.length; i++){//start from 1 
            obj.pools[i].activation = obj.pools[i].activation_reset_value;
        }
        obj.reset_net_input();
        obj.reset_weights();
        obj.environment.sequence_index = obj.next_patno;
        obj.clamp_pools();
    };

    //TESTED
    obj.clip = function(num){
        if (num === 1) { return 0.99999988; }
        if (num === 0) { return 0.00000012; }
        return num;
    }

    //NOT TESTED
    obj.clamp_pools = function(){
        console.log("clamping pools...");
        console.log("pools:");
        console.log(obj.pools);
        console.log("patterns:");
        console.log(obj.environment.current_patterns);
        for (var i = 0; i < obj.pools.length; i++){
            obj.pools[i].target = null;
        }
        var pooli = -1;
        for (var i = 0; i < obj.environment.current_patterns.length; i++){
            if (!obj.environment.current_patterns[i].pool){
                if (obj.environment.current_patterns[i].type === "T"){
                    pooli = obj.pools.length - 1;
                } else {
                    pooli = 1; //first non-bias pool
                }
            }
            console.log("pooli:");
            console.log(pooli);
            switch (obj.environment.current_patterns[i].type){
                case "H":
                    obj.pools[pooli].activation = new goog.math.Matrix(Array(obj.environment.current_patterns[i].pattern));
                    obj.pools[pooli].activation = goog.math.Matrix.map(obj.pools[pooli].activation, obj.clip);
                    var act = obj.pools[pooli].activation.array_;
                    var tempnetinput = [];
                    for (var k = 0; k < act.length; k++){
                        tempnetinput.push(Math.log(act[0][k] /(1 - act[0][k])));
                    }
                    obj.pools[pooli].net_input = new goog.math.Matrix(Array(tempnetinput));
                    obj.pools[pooli].clamped_activation = 2;
                    break;
                case "S":
                    obj.pools[pooli].net_input = new goog.math.Matrix(Array(obj.environment.current_patterns[i].pattern));
                    obj.pools[pooli].clamped_activation = 1;
                    break;
                case "T":
                    obj.pools[pooli].target = obj.environment.current_patterns[i].pattern;
                    obj.pools[pooli].clamped_error = true;
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
                console.log("From is : ");
                console.log(from);
                console.log("Current pools' net_input:");
                console.log(obj.pools[i].net_input);
                //gotta transpose this stuff!
                var currWeights = obj.pools[i].projections[j].using.weights.getTranspose();
                console.log("Current projection weights:");
                console.log(currWeights);
                if (typeof from.activation != "number"){
                    obj.pools[i].net_input = obj.pools[i].net_input.add(
                            from.activation.multiply(currWeights)
                            );
                } else {
                    obj.pools[i].net_input = obj.pools[i].net_input.add(
                            currWeights.multiply(from.activation)
                            );
                }
                console.log("checkpoint 2");
                console.log("net_input is: ");
                console.log(obj.pools[i].net_input);
            }
            switch (obj.pools[i].activation_function){
                case "logistic":
                    console.log("try logistic");
                    var currInput = goog.math.Matrix.map(obj.pools[i].net_input, obj.logistic);
                    obj.pools[i].activation = obj.pools[i].activation.add(currInput);
                    console.log("activation is:");
                    console.log(obj.pools[i].activation);
                    break;
                case "linear":
                    console.log("try linear");
                    obj.pools[i].activation = obj.pools[i].activation.add(obj.pools[i].net_input);
                    break;
            }
        }
        console.log("checkpoint 3, the output is computed");
    };

    //NOT TESTED
    obj.compute_error = function(){
        console.log("computing error...");
        for (var i = obj.pools.length - 1; i >= 0; i--){
            obj.pools[i].delta = obj.pools[i].delta_reset_value;
            obj.pools[i].error = obj.pools[i].error_reset_value;
            console.log("checkpoint 1: reset error");
            if (obj.pools[i].target){
                obj.pools[i].error = obj.pools[i].error
                    //.add(obj.pools[i].target[0])//not sure how this works
                    .subtract(obj.pools[i].activation);
            }
            //note that the above will never happen
            console.log("checkpoint 2: adjusted error if pool was target");
            switch (obj.train_options.errmeas){
                case "cee":
                    obj.pools[i].delta = obj.pools[i].error;
                    break;
                case "sse":
                    if (typeof obj.pools[i].activation != "number"){
                        obj.pools[i].delta = goog.math.Matrix.map(
                                obj.pools[i].error,
                                function(x, k, l){
                                    var act = obj.pools[i].activation.getValueAt(k, l);
                                    return x * act * (1 - act);
                                });
                    } else {
                        obj.pools[i].delta = goog.math.Matrix.map(
                                obj.pools[i].error,
                                function(x, k, l){
                                    var act = obj.pools[i].activation;
                                    return x * act * (1 - act);
                                }
                                );
                    }
                    break;
            }
            console.log("checkpoint 3: adjusted delta with error");
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                console.log("delta:");
                console.log(obj.pools[i].delta);
                console.log("weights:");
                console.log(obj.pools[i].projections[j].using.weights);
                console.log("newerrordelta:");
                var newerrordelta = obj.pools[i].delta.multiply(
                            obj.pools[i].projections[j].using.weights
                        );
                console.log(newerrordelta);
                console.log("currerror:");
                console.log(obj.pools[i].projections[j].from.error);
                obj.pools[i].projections[j].from.error =
                    obj.pools[i].projections[j].from.error
                    .add(newerrordelta);
            }
            console.log("checkpoint 4: adjusted projection errors");
            if (obj.pools[i].type === "connection"){
                obj.pools[i].error_reset_value =
                    obj.pools[i].error_reset_value.add(obj.pools[i].error);
            }
            console.log("checkpoint 5: computed errors");
        }
    };

    //NOT TESTED
    obj.compute_weds = function(){
        console.log("computing weds...");
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                console.log("current delta:");
                console.log(obj.pools[i].delta);
                obj.pools[i].projections[j].using.weds =
                    obj.pools[i].projections[j].using.weds
                    .add( obj.pools[i].delta
                            .getTranspose()
                            .multiply(obj.pools[i].projections[j].from.activation)
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
        console.log("checkpoint 1: set up temp vars");
        var mo = obj.train_options.momentum;
        var decay = obj.train_options.wdecay;
        for (var i = 0; i < obj.pools.length; i++){
            for (var j = 0; j < obj.pools[i].projections.length; j++){
                var proj = obj.pools[i].projections[j].using;
                var lr = null;
                if (!proj.lr){
                    lr = obj.train_options.lrate;
                } else {
                    lr = proj.lr; 
                }
                console.log("lr:");
                console.log(lr);
                obj.pools[i].projections[j].using.weight_deltas =
                    obj.pools[i].projections[j].using.weight_deltas.multiply(lr)
                    .subtract(obj.pools[i].projections[j].using.weights.multiply(decay))
                    .add(obj.pools[i].projections[j].using.weight_deltas.multiply(mo));

                if (obj.train_options.follow){
                    var sqwd = obj.pools[i].projections[j].using.weds
                        .multiply(obj.pools[i].projections[j].using.weds);
                    goog.math.Matrix.forEach(proj.weds, function(x){
                        obj.css += x;
                    });
                    var dpprod = proj.weds.map(function(x, k, l){
                        return x * proj.prev_weds.getValueAt(k, l);
                    });
                }
                obj.pools[i].projections[j].using.prev_weds =
                    obj.pools[i].projections[j].using.weds;
                obj.pools[i].projections[j].using.weights =
                    obj.pools[i].projections[j].using.weights
                    .add(obj.pools[i].projections[j].using.weight_deltas);
                obj.pools[i].projections[j].using.weds =
                    obj.pools[i].projections[j].using.weds.multiply(0);//to all zeroes
            }
        }
        console.log("checkpoint 2: changed weights");
        if (obj.train_options.follow){
            var den = p_css * obj.css;
            if (den > 0){
                obj.gcor = dp / (Math.sqrt(den));
            } else {
                obj.gcor = 0;
            }
        }
        console.log("checkpoint 3: changed following");
    };

    //NOT TESTED
    obj.sumstats = function(){
        console.log("summing stats....");
        obj.pss = 0.0;
        obj.pce = 0.0;
        var ce = 0;
        if (obj.patno === 0){ obj.tss = 0.0; }
        for (var i = 0; i < obj.pools.length; i++){
            if (obj.pools[i].type !== "output"){ continue; }
            if (!obj.pools[i].target) { continue; }
            if (obj.pools[i].target[0] < 0) { continue; }
            console.log("summing stats actually");//we never get here
            goog.math.Matrix.forEach(obj.pools[i].error, function(num){
                obj.pss += (num * num);
            });
            goog.math.Matrix.forEach(obj.pools[i].activation, function(num){
                if (obj.pools[i].target[0] === 1) {
                    ce += Math.log(num);
                } else if (obj.pools[i].target[0] === 0){
                    ce += Math.log(1 - num);
                }
            });
            obj.pce -= ce;
        }
        obj.tss += obj.pss;
        obj.tce += obj.pce;
    };

    //NOT TESTED
    obj.train = function(){
        console.log("training...");
        //var epoch_limit = (Math.floor(obj.epochno / obj.train_options.nepochs) + 1) * obj.train_options.nepochs;
        //the below seems to make more sense
        var epoch_limit = obj.train_options.nepochs;
        console.log("Epoch limit: " + epoch_limit);
        while (obj.next_epochno < epoch_limit){
            obj.epochno = obj.next_epochno;
            console.log("CURR EPOCH: " + obj.epochno);
            while (obj.next_patno < obj.environment.sequences.length){
                obj.patno = obj.next_patno;
                obj.next_patno += 1;
                obj.environment.sequence_index = obj.patno;
                console.log("current pattern number:");
                console.log(obj.patno);
                obj.environment.current_patterns = 
                    obj.environment.sequences[obj.patno].intervals.clamps;
                obj.clamp_pools();
                obj.compute_output();
                obj.compute_error();
                obj.sumstats();
                obj.compute_weds();
                if (obj.train_options.lgrain === "pattern") {
                    obj.change_weights();
                }
                if (obj.done_updating_patno){
                    return false;
                }
                //just for debugging
                if (obj.epochno == 2){
                    return false;
                }
            }
            if (obj.train_options.lgrain === "epoch"){ obj.change_weights(); }
            obj.next_patno = 0;
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
            console.log("current pattern number:");
            console.log(obj.patno);
            obj.environment.current_patterns = 
                obj.environment.sequences[obj.patno].intervals.clamps;
            obj.clamp_pools();
            obj.compute_output();
            obj.compute_error();
            obj.sumstats();
            obj.next_patno = obj.patno + 1;
            if (obj.done_updating_patno) { return false; }
        }
        obj.next_patno = 0;
        obj.tss = 0;
    };

    //NOT TESTED
    obj.set_environment = function(value){
        console.log("setting environment...");
        obj.environment = value;
        obj.clamp_pools();
    };

    //INITIAL SETUP
    obj.type = "bp";
    obj.pools = new Array(pool("bias", 1, "bias"));
    obj.pools = obj.pools.concat(pools);
    console.log(obj.pools);
    if (!obj.manual_bias){
        obj.add_bias_projections(obj);
    }
    obj.reset_weights(); 
    obj.set_environment(xorenv);
    return obj;
};
