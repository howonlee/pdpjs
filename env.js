var env = function(epochs){
    //parse the whitespace yourself: assumes input of arrays of tokened lines
    obj = {};
    temp = [];
    obj.parse_epoch = function(lines){
        obj.sequence_index = 1;
        obj.interval_index = 1;
        obj.using_sequence_names = 
    }
    obj.parse_epoch(epochs);
    for (var i = 0; i < obj.sequences.length; i++){
        temp.push(i);
    }
    obj.ordering = [];
    for (var i = 0; i < obj.sequences.length; i++){
        //fischer-yates shuffle
        var tempi = Math.floor(Math.random()*temp.length);
        obj.ordering.push(temp[tempi]);
        temp = temp.splice(tempi, 1);
    }
    obj.sequence_index = 1;
    obj.interval_index = 1;
}
