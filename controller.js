//not really a controller, but it helps to think of it this way

var doReset = function(){
    paper.updateOurCanvas(true);
};

var doNewStart = function(){
    //just a wrapper for refresh
    document.location.reload(true);
};

var doLoadWeights = function(){
    //nothing for now
};

var doSaveWeights = function(){
    //nothing for now
    //this would require a server
};

//start the training stuff
var setTrainOptions = function(){
    paper.updateOurCanvas(false);
};

var doTrainStop = function(){
    paper.updateOurCanvas(false);
};

var doTrainRun = function(){
    paper.updateOurCanvas(false);
};

var doTrainStep = function(){
    paper.updateOurCanvas(false);
};
//end the training stuff

//start the testing stuff
var setTestOptions = function(){
    paper.updateOurCanvas(false);
};

var doTestStop = function(){
    paper.updateOurCanvas(false);
};

var doTestRun = function(){
    paper.updateOurCanvas(false);
};

var doTestStep = function(){
    paper.updateOurCanvas(false);
};
//end the testing stuff
