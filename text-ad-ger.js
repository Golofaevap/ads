const cyr = require("../texts/cyr");
const latin = require("../texts/latin");

function _generateRand() {
    const firstNumber = 75 + Math.round(Math.random() * 20);
    const secondNumber = 100 + Math.round(Math.random() * 820);

    const number1 = " " + firstNumber + "." + secondNumber + "р. ";
    const number2 = " " + firstNumber + secondNumber + "р. ";
    const number3 = " " + firstNumber + secondNumber + "р ";
    const number4 = " " + firstNumber + "," + secondNumber + "р. ";
    const number5 = " " + firstNumber + "," + secondNumber + "р. ";

    return [number1, number2, number3, number4, number5];
}

const sum = _generateRand();
const aOpts = {
    h1: "Mehr als 3 mal pro Nacht",
    h2: "Jetzt habe ich stundenlang sеx",
    h3: "Super Power und 3 Stunden sеx",
    d1: "Tun Sie dies 15 Minuten vor dem xes und es wird 4 mal länger sein",
    d2: "45 Minuten vor dem Geschlechtsverkehr mit einem großen Glas Wasser trinken.",
    url: "",
};
const aOpts2 = {
    h1: latin(aOpts.h1.trim(), 2),
    h2: latin(aOpts.h2.trim()),
    h3: latin(aOpts.h3.trim(), 1),
    d1: latin(aOpts.d1.trim().replace("  ", " "), 3),
    d2: latin(aOpts.d2.trim().replace("  ", " "), 2),
};
console.log("h1\n", aOpts2.h1);
console.log("h2\n", aOpts2.h2);
console.log("h3\n", aOpts2.h3);
console.log("d1\n", aOpts2.d1);
console.log("d2\n", aOpts2.d2);
