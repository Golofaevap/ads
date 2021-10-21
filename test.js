

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
// for (let i in headers) {
//   const h = headers[i];
//   const h1 = (h.prefix + sum[0] + h.suffix).trim();
//   const h2 = (h.prefix + sum[1] + h.suffix).trim();
//   const h3 = (h.prefix + sum[2] + h.suffix).trim();
//   const aOpts = {
//     h1: h1,
//     h2: h2,
//     h3: h3,
//     d1: "Чтᴏбы пoлучuть ᗷa͏шu " + sum[3] + "Пepeйдuтe пᴏ ccылкe.",
//     d2: "Чтᴏбы пoлучuть ᗷa͏шu " + sum[4] + "",
//     url: "",
//   };
var h = _generateHeader();
const h1 = (h.prefix + sum[0] + h.suffix).trim();
h = _generateHeader();
const h2 = (h.prefix + sum[1] + h.suffix).trim();
h = _generateHeader();
const h3 = (h.prefix + sum[2] + h.suffix).trim();
var d = _generateDesc();
const d1 = (d.prefix + sum[3] + d.suffix).trim();
d = _generateDesc();
const d2 = (d.prefix + sum[4] + d.suffix).trim();

const aOpts = {
  h1: h1,
  h2: h2,
  h3: h3,
  d1: d1,
  d2: d2,
  url: "",
};

console.log(aOpts);
console.log(aOpts.h1.length);
console.log(aOpts.h2.length);
console.log(aOpts.h3.length);
console.log("==== ==== ====");

// }



