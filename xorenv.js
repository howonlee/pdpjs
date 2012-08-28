//this is a simple environment specifically for testing
//I need to make this all generated-like later
//but for now, YAGNI

var xorenv = {
    using_sequence_names: false,
    interval_index: 1,
    sequences: [{
        name: '1',
        weight: 1,
        intervals: {
            name: 'p01',
            clamps: [{
                pool: null,
                type: "H",
                pattern: [0, 0]
            }, {
                pool: null,
                type: "T",
                pattern: [0]
            }]
        }
    }, {
        name: '2',
        weight: 1,
        intervals: {
            name: 'p02',
            clamps: [{
                pool: null,
                type: "H",
                pattern: [0, 1]
            }, {
                pool: null,
                type: "T",
                pattern: [1]
            }]
        }
    }, {
        name: '3',
        weight: 1,
        intervals: {
            name: 'p03',
            clamps: [{
                pool: null,
                type: "H",
                pattern: [1, 0]
            }, {
                pool: null,
                type: "T",
                pattern: [1]
            }]
        }
    }, {
        name: '4',
        weight: 1,
        intervals: {
            name: 'p04',
            clamps: [{
                pool: null,
                type: "H",
                pattern: [1, 1]
            }, {
                pool: null,
                type: "T",
                pattern: [0]
            }]
        }
    }],
        sequence_index: 0,
        trainmode: 's',
        ordering: [2, 0, 1, 3],
        current_patterns : [
        {
            pool : null,
            type : "H",
            pattern : [0,0]
        }, {
            pool : null,
            type : "T",
            pattern: [0]
        }
    ]
};
