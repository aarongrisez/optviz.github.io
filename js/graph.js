'use strict'

let started = false;
let currentPos = 0;
let iterator = 1;
let scaling = 1;

let inputFunc;
let compiledFunc;
let derivative;
let gradients;

let g1options = {
    target: '#graph-1',
    title: "set up",
    xAxis: {
        label: 'x - axis',
        domain: [-6, 6]
    },
    yAxis: {
        label: 'y - axis',
        domain: [-18, 36]
    },
    data: [{
        points: [],
        fnType: 'points',
        graphType: 'scatter'
    }]
}

const redrawPlot = (options, fn, deriv, evalAt, iter, pointsDiff = undefined) => {
    // strange quirk to force a title rerender
    delete options.title;
    functionPlot(options);

    options.title = "iteration " + iter;
    options.data[0].fn = fn;
    options.data[0].derivative = {
        fn: deriv,
        x0: evalAt
    }
    if (pointsDiff !== undefined){
        if (options.data.length === 1){
            options.data.push(
                {
                    points: [pointsDiff],
                    fnType: 'points',
                    graphType: 'scatter'
                }
            );
            options.data.push(
                {
                    vector: gradients[0].vector,
                    offset: gradients[0].offset,
                    graphType: 'polyline',
                    fnType: 'vector',
                    color: 'red',
                    attr: { "stroke-width": 1.5 }
                }
            )
        }
        else{
            options.data[1].points.push(pointsDiff);
        }
        options.data.push(
            {
                vector: gradients[gradients.length - 1].vector,
                offset: gradients[gradients.length - 1].offset,
                graphType: 'polyline',
                fnType: 'vector',
                color: 'red',
                attr: { "stroke-width": 1.5 }
            }
        )
    }
    functionPlot(options);
}

const updatePos = (current, deriv, learning) => {
    return current + (-1 * deriv.evaluate({x: current}) * learning);
}

const handleStartClick = () => {
    let inputEval = document.getElementById("initial-start").value;
    let evalAt = Number(inputEval);
    if (isNaN(evalAt)){ return; }

    iterator = 0;
    if (g1options.data.length >= 2){
       g1options.data = [g1options.data[0]];
    }

    started = true;

    currentPos = evalAt;
    document.getElementById("current-pos").innerHTML = evalAt;

    inputFunc = document.getElementById("function-input").value;
    compiledFunc = math.compile(inputFunc);
    
    derivative = math.derivative(inputFunc, 'x');
    const m = derivative.evaluate({x: currentPos})
    const y = compiledFunc.evaluate({x: currentPos})
    const vectorMagnitude = math.sqrt(1 + m ** 2)
    const vector = [-1 *m / vectorMagnitude * scaling, -1 *m ** 2 / vectorMagnitude * scaling]
    gradients = [{offset: [currentPos, y], vector}] 
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
};
    
const handleUpdateClick = () => {
    if (!started) { return; }
    let learningRate = document.getElementById("learning-rate").value;
    if (isNaN(learningRate)) { return; }

    iterator++;
    currentPos = updatePos(currentPos, derivative, learningRate)
    const m = derivative.evaluate({x: currentPos})
    const y = compiledFunc.evaluate({x: currentPos})
    const intercept = y - (m * currentPos)
    const vectorMagnitude = math.sqrt(1 + m ** 2)
    const vector = [-1* m / vectorMagnitude * scaling, -1*m ** 2 / vectorMagnitude * scaling]
    let derivativeFunc
    if (intercept > 0) {
        derivativeFunc = String(m.toFixed(10)) + "x+" + String(intercept.toFixed(10))
    } else {
        derivativeFunc = String(m.toFixed(10)) + "x" + String(intercept.toFixed(10))
    }

    gradients.push({offset: [currentPos, y], vector})
    document.getElementById("current-pos").innerHTML = currentPos;
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
};

let setFnInputVal = (val, start = 4) => {
    document.getElementById("function-input").value = val;
    document.getElementById("initial-start").value = start;
}

functionPlot(g1options);

document.getElementById("fn-x-2").addEventListener("click", () => setFnInputVal("x^2"));
document.getElementById("fn-x-3").addEventListener("click", () => setFnInputVal("x^3"));
document.getElementById("fn-sin-x").addEventListener("click", () => setFnInputVal("sin(x)", 2));
document.getElementById("fn-1-x").addEventListener("click", () => setFnInputVal("1/x", 0.5));
document.getElementById("fn-poly-x").addEventListener("click", () => setFnInputVal("x + 2 * (x^2) + (0.4) * x^3", 2));
document.getElementById("update-button").addEventListener("click", handleUpdateClick)
document.getElementById("start-button").addEventListener("click", handleStartClick);