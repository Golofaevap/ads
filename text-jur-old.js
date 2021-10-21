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
    h1: "ᗷa͏м 3a͏численᴏ" + sum[0] + "",
    h2: "ᗷa͏м 3a͏численᴏ" + sum[1] + "",
    h3: "ᗷa͏м 3a͏численᴏ" + sum[2] + "",
    d1: "Чтᴏбы пoлучuть ᗷa͏шu" + sum[3] + "Пepeйдuтe пᴏ ccылкe.",
    d2: "Чтᴏбы пoлучuть ᗷa͏шu" + sum[4] + "",
};
// const aOpts2 = {
//     h1: cyr(aOpts.h1.trim(), 2),
//     h2: cyr(aOpts.h2.trim(), 2),
//     h3: cyr(aOpts.h3.trim(), 2),
//     d1: cyr(aOpts.d1.trim().replace("  ", " "), 3),
//     d2: cyr(aOpts.d2.trim().replace("  ", " "), 2),
// };
console.log("h1\n", aOpts.h1);
console.log("h2\n", aOpts.h2);
console.log("h3\n", aOpts.h3);
console.log("d1\n", aOpts.d1);
console.log("d2\n", aOpts.d2);
