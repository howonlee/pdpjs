$(document).ready(function(){
    //show all the stuff that's going on in the neural network
    var paper = new Raphael(document.getElementById("raphbase"), 800, 800);

    var expsquare = paper.rect(10, 10, 50, 50)
                         .attr({fill: "red"})
                         .data("pool", currbp.pools)
                         .click(function(){
                            alert(this.data("pool"));
                         });
});
