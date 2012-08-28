//not really a view, but it helps to think of it this way

$(document).ready(function(){
    paper = new Raphael(document.getElementById("raphbase"), 800, 800);
    //made this available, I commit a multitude of sins
    var grid = function(num){ return 30 + (30 * num);};
    var rectSize = 30;

    var getColor = function(number){
        if (number > 0){
            //red
        } else {
            //blue
        }
        return {"stroke": "#FFF", "fill": "rgb(66%, 66%, 66%)"};
    };

    //labels start here
    var epochlabel = paper.text(grid(0), grid(0), "epochno");//edit automajically
    var tsslabel = paper.text(grid(6), grid(0), "tss");
    var gcorlabel = paper.text(grid(6), grid(1), "gcor");

    var cpnamelabel = paper.text(grid(12), grid(0), "cpname");
    var psslabel = paper.text(grid(12), grid(1), "pss");

    var labelset = paper.set();
    labelset.push(epochlabel, tsslabel, gcorlabel, cpnamelabel, psslabel);
    labelset.attr({"text-anchor": "start"});

    var senderactslabel = paper.text(grid(0), grid(2), "sender acts:");
    var weightslabel = paper.text(grid(0), grid(4), "weights:");

    var squarelabels = paper.set();
    squarelabels.push( 
        paper.text(grid(8), grid(3), "bias"),
        paper.text(grid(10), grid(3), "net"),
        paper.text(grid(12), grid(3), "act"),
        paper.text(grid(14), grid(3), "tar"),
        paper.text(grid(16), grid(3), "del")
        );
    squarelabels.attr({"text-anchor": "start"});

    //labels end here
    //squares start here
    var senderacts = paper.set();
    senderacts.push(
            paper.rect(grid(2), grid(2), rectSize, rectSize),
            paper.rect(grid(3), grid(2), rectSize, rectSize),
            paper.rect(grid(5), grid(2), rectSize, rectSize),
            paper.rect(grid(6), grid(2), rectSize, rectSize)
            );
    senderacts.attr(getColor(0));

    var proj1 = paper.set();
    proj1.push(
            paper.rect(grid(2), grid(4), rectSize, rectSize),
            paper.rect(grid(3), grid(4), rectSize, rectSize),
            paper.rect(grid(2), grid(5), rectSize, rectSize),
            paper.rect(grid(3), grid(5), rectSize, rectSize)
            );
    proj1.attr(getColor(0));

    //is this weights? gotta look this up
    var proj2 = paper.set();
    proj2.push(
            paper.rect(grid(5), grid(6), rectSize, rectSize),
            paper.rect(grid(6), grid(6), rectSize, rectSize)
            )
    proj2.attr(getColor(0));

    var biases = paper.set(); 
    biases.push(
            paper.rect(grid(8), grid(4), rectSize, rectSize),
            paper.rect(grid(8), grid(5), rectSize, rectSize),
            paper.rect(grid(8), grid(6), rectSize, rectSize)
            );
    biases.attr(getColor(0));

    var nets = paper.set();
    nets.push(
            paper.rect(grid(10), grid(4), rectSize, rectSize),
            paper.rect(grid(10), grid(5), rectSize, rectSize),
            paper.rect(grid(10), grid(6), rectSize, rectSize)
            );
    nets.attr(getColor(0));

    var acts = paper.set();
    acts.push(
            paper.rect(grid(12), grid(4), rectSize, rectSize),
            paper.rect(grid(12), grid(5), rectSize, rectSize),
            paper.rect(grid(12), grid(6), rectSize, rectSize)
            );
    acts.attr(getColor(0));

    var tars = paper.set();
    tars.push(
            paper.rect(grid(14), grid(4), rectSize, rectSize),
            paper.rect(grid(14), grid(5), rectSize, rectSize),
            paper.rect(grid(14), grid(6), rectSize, rectSize)
            );
    tars.attr(getColor(0));

    var dels = paper.set();
    dels.push(
            paper.rect(grid(16), grid(4), rectSize, rectSize),
            paper.rect(grid(16), grid(5), rectSize, rectSize),
            paper.rect(grid(16), grid(6), rectSize, rectSize)
            );
    dels.attr(getColor(0));

    paper.updateOurCanvas = function(isReset){
        if (isReset){
            senderacts.attr(getColor(0));
            proj1.attr(getColor(0));
            proj2.attr(getColor(0));
            biases.attr(getColor(0));
            nets.attr(getColor(0));
            acts.attr(getColor(0));
            tars.attr(getColor(0));
            dels.attr(getColor(0));
            
            proj1.attr(getColor(0));
            proj2.attr(getColor(0));
            biases.attr(getColor(0));
            nets.attr(getColor(0));
            acts.attr(getColor(0));
            tars.attr(getColor(0));
            dels.attr(getColor(0));
            epochlabel.attr({"text": "epochno"});
            tsslabel.attr({"text": "tss"});
            gcorlabel.attr({"text": "gcor"});
            cpnamelabel.attr({"text": "cpname"});
            psslabel.attr({"text": "pss"});
        } else {
            epochlabel.attr({"text": "epochno " + currnet.epochno});
            tsslabel.attr({"text": "tss " + currnet.tss});
            gcorlabel.attr({"text": "gcor " + currnet.gcor});
            cpnamelabel.attr({"text": "cpname " + currnet.cpname});
            psslabel.attr({"text": "pss " + currnet.pss});
        }
    };
});
