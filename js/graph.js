'use strict'

let started = false;
let currentPos = 0;
let iterator = 1;

let inputFunc;
let compiledFunc;
let derivative;

let demoIter = 0;
let demoFunc = 'x^2';
let demoCompiled = math.compile(demoFunc);
let demoDeriv = math.derivative(demoFunc, 'x');
const demoDefault = 0;
let demoPos = demoDefault;
const demoRate = 0.25;

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
    data: [
        {
            fn: 'x^2+x',
            derivative: {
                fn: '2 * x + 1',
                x0: 2
            },
            attr: { "stroke-width": 3 }
        }
    ]
}

let demoOptions = {
    target: '#demo-graph',
    title: "set up your gradient descent!",
    xAxis: {
        label: 'x - axis',
        domain: [-10, 10]
    },
    yAxis: {
        label: 'y - axis',
        domain: [-50, 100]
    },
    data: [
        {
            fn: 'x^2',
            derivative: {
                fn: '2 * x',
                x0: demoDefault
            },
            attr: { "stroke-width": 3 }
        }
    ]
}

const badJSONDeepCopy = obj => {
    return JSON.parse(JSON.stringify(obj))
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
        }
        else{
            options.data[1].points.push(pointsDiff);
        }
    }
    
    functionPlot(options);
}

const updatePos = (current, deriv, learning) => {
    return current + (-1 * deriv.evaluate({x: current}) * learning);
}

const handleStartClick = () => {
    // console.log("start")
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
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
};
    
const handleUpdateClick = () => {
    // console.log("update")
    if (!started) { return; }
    let learningRate = document.getElementById("learning-rate").value;
    if (isNaN(learningRate)) { return; }

    iterator++;
    currentPos = updatePos(currentPos, derivative, learningRate)

    document.getElementById("current-pos").innerHTML = currentPos;
    redrawPlot(g1options, inputFunc, derivative.toString(), currentPos, iterator, [currentPos, compiledFunc.evaluate({x: currentPos})]);
};

let setFnInputVal = (val, start = 4) => {
    document.getElementById("function-input").value = val;
    document.getElementById("initial-start").value = start;
}



const randomStart = () => {
    return Math.random()*64 - 32;
}


const advanceDemo = () => {
    if (Math.abs(demoPos) < 0.01){
        let newStart = randomStart();
        demoOptions.data = [
            {
                fn: 'x^2',
                derivative: {
                    fn: '2 * x',
                    x0: newStart
                },
                attr: { "stroke-width": 3 }
            }
        ]
        demoIter = 0;
        demoPos = newStart;
        document.getElementById("demo-start").innerHTML = newStart.toFixed(2);
    }
    else{
        demoIter++;
    }
    demoPos = updatePos(demoPos, demoDeriv, demoRate);
    document.getElementById("demo-current").innerHTML = demoPos.toFixed(2);

    redrawPlot(demoOptions, demoFunc, demoDeriv.toString(), demoPos, demoIter, [demoPos, demoCompiled.evaluate({x: demoPos})]);
}

setInterval(() => advanceDemo(), 500);

functionPlot(g1options);
advanceDemo()

document.getElementById("fn-x-2").addEventListener("click", () => setFnInputVal("x^2"));
document.getElementById("fn-x-3").addEventListener("click", () => setFnInputVal("x^3"));
document.getElementById("fn-sin-x").addEventListener("click", () => setFnInputVal("sin(x)", 2));
document.getElementById("fn-1-x").addEventListener("click", () => setFnInputVal("1/x", 0.5));
document.getElementById("fn-poly-x").addEventListener("click", () => setFnInputVal("x + 2 * (x^2) + (0.4) * x^3", 2));
document.getElementById("update-button").addEventListener("click", handleUpdateClick)
document.getElementById("start-button").addEventListener("click", handleStartClick);