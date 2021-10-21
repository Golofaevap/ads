function getAllTargetCountries(countriesStr) {
    var _tragetedCountriesListTemp = countriesStr.split(";");
    var _tragetedCountriesList = [];
    for (var i = 0; i < _tragetedCountriesListTemp.length; i++) {
        _tragetedCountriesListTemp[i] = _tragetedCountriesListTemp[i].trim().toLowerCase();
        if (_tragetedCountriesListTemp[i]) {
            _tragetedCountriesList.push(_tragetedCountriesListTemp[i]);
        }
    }

    var countriesList = {
        canada: 2124,
        belgium: 2056,
        australia: 2036,
        "united kingdom": 2826,
        switzerland: 2756,
        sweden: 2752,
        spain: 2724,
        norway: 2578,
        "new zeland": 2554,
        netherlands: 2528,
        austria: 2040,
        cyprus: 2196,
        czechia: 2203,
        germany: 2276,
        greece: 2300,
        hungary: 2348,
        italy: 2380,
        poland: 2616,
        portugal: 2620,
        romania: 2642,
        slovakia: 2703,
        spain: 2724,
        "canary islands": 20277,
        russia: 2643,
        "united states": 2840,
        ukraine: 2804,
        belarus: 2112,
        india: 2356,
        kazakhstan: 2398,
        ukraine: 2804,
        denmark: 2208,
        finland: 2246,
        france: 2250,
        ireland: 2372,
        luxembourg: 2442,
    };
    var retObj = { ok: false };
    var array = [];
    var clKeys = Object.keys(countriesList);
    // console.log(_tragetedCountriesList, clKeys);
    for (var i = 0; i < clKeys.length; i++) {
        // console.log(_tragetedCountriesList.includes(clKeys[i]), clKeys[i], countriesList[clKeys[i]]);
        if (_tragetedCountriesList.includes(clKeys[i])) {
            array.push(countriesList[clKeys[i]]);
        }
    }
    if (array) {
        retObj.ok = true;
        retObj.array = array;
        retObj.list = _tragetedCountriesList;
        retObj.str = countriesStr;
    }
    return retObj;
}
function getAllCountries() {
    return [
        2012, 2024, 2031, 2032, 2036, 2040, 2044, 2048, 2050, 2051, 2052, 2056, 2064, 2068, 2070, 2072, 2076, 2084,
        2090, 2096, 2100, 2104, 2108, 2112, 2116, 2120, 2124, 2132, 2140, 2144, 2148, 2152, 2156, 2158, 2162, 2166,
        2170, 2174, 2178, 2180, 2184, 2188, 2191, 2196, 2203, 2204, 2208, 2212, 2214, 2218, 2222, 2226, 2231, 2232,
        2233, 2239, 2242, 2246, 2250, 2258, 2260, 2262, 2266, 2268, 2270, 2275, 2276, 2288, 2296, 2300, 2308, 2316,
        2320, 2324, 2328, 2332, 2334, 2336, 2340, 2348, 2352, 2356, 2360, 2368, 2372, 2376, 2380, 2384, 2388, 2392,
        2398, 2400, 2404, 2410, 2414, 2417, 2418, 2422, 2426, 2428, 2430, 2434, 2438, 2440, 2442, 2446, 2450, 2454,
        2458, 2462, 2466, 2470, 2478, 2480, 2484, 2492, 2496, 2498, 2499, 2504, 2508, 2512, 2516, 2520, 2524, 2531,
        2534, 2535, 2540, 2548, 2554, 2558, 2562, 2566, 2570, 2574, 2578, 2580, 2581, 2583, 2584, 2585, 2586, 2591,
        2598, 2600, 2604, 2608, 2612, 2616, 2620, 2624, 2626, 2630, 2634, 2642, 2643, 2646, 2654, 2659, 2662, 2666,
        2670, 2674, 2678, 2682, 2686, 2688, 2690, 2694, 2702, 2703, 2704, 2705, 2706, 2710, 2716, 2724, 2740, 2748,
        2752, 2756, 2762, 2764, 2768, 2772, 2776, 2780, 2784, 2788, 2792, 2795, 2798, 2800, 2804, 2807, 2818, 2826,
        2831, 2832, 2834, 2840, 2854, 2858, 2860, 2862, 2876, 2882, 2887, 2894, 20277, 2528,
    ];
}

// var codes = {};
// for (var i = 0; i < allcountries.length; i++) {
//     codes[countryCode[i]] = 1;
// }
// for (var i = 0; i < allcountries.length; i++) {
//     codes[allcountries[i]] = 1;
// }

// var allCodes = Object.keys(codes);
// var str = "";

// for (var i = 0; i < allCodes.length; i++) {
//     str += `${allCodes[i]}, `;
// }
// console.log(allcountries.length, allCodes.length);
// console.log(str);

// var countryStr =
//     "australia;austria;belgium;canada;denmark;finland;france;germany;ireland;italy;luxembourg;netherlands;new zeland;norway;spain;sweden;switzerland;united kingdom;united states";
// var countryArray = countryStr.split(";");
// console.log(countryArray);

// for (var i = 0; i < countryArray.length; i++) {
//     console.log(countryArray.length, countryArray[i], countryCode[countryArray[i]]);
// }

function getCountriesExclusion(targetedCountries) {
    var _c = [];
    var allCountriesCodes = getAllCountries();
    // console.log(allCountriesCodes.length);
    // var counter = 1;
    for (var i = 0; i < allCountriesCodes.length; i++) {
        var _code = allCountriesCodes[i];
        if (!targetedCountries.array.includes(_code)) {
            _c.push(_code);
        }
    }
    return _c;
}

function getProximityExclusion() {
    return [
        { latitude: 11.938898, longitude: 24.420256, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 18.539222, longitude: 31.11093, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 20.449822, longitude: -76.281528, radius: 150, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 21.598353, longitude: -79.972934, radius: 150, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 22.087835, longitude: -83.00516, radius: 150, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 23.679232, longitude: -14.027486, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 26.973479, longitude: 60.881687, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 3.849069, longitude: -53.22128, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 33.387874, longitude: 53.416112, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 34.879166, longitude: 66.666354, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 37.102356, longitude: 42.194673, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 40.079088, longitude: 20.14889, radius: 50, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 40.881299, longitude: 20.104945, radius: 50, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 41.94223, longitude: 20.006068, radius: 50, radiusUnits: "MILES", bidModifier: 0.1 },
        { latitude: 8.783627, longitude: 32.330412, radius: 500, radiusUnits: "MILES", bidModifier: 0.1 },
    ];
}
function getProximity(targetedCountries) {
    console.log("function getProximity(targetedCountries) {");
    var targetProximities = {
        "united states": [
            //1
            { latitude: 30.44763, longitude: -92.56161, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 31.277516, longitude: -82.38827, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 33.942355, longitude: -105.129969, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 37.648075, longitude: -76.082118, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 38.753139, longitude: -116.731532, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 38.753139, longitude: -93.330653, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 43.67272, longitude: -66.752955, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 43.799727, longitude: -84.133326, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 45.611041, longitude: -100.920436, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 46.586126, longitude: -119.509303, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
        ],
        canada: [
            //2
            { latitude: 46.618429, longitude: -69.248622, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 48.165278, longitude: -86.079677, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 49.094659, longitude: -56.065028, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 50.232377, longitude: -105.942958, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 51.123453, longitude: -123.8287, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 55.077674, longitude: -68.633388, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 55.378422, longitude: -92.407802, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 58.538963, longitude: -108.184169, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 61.480181, longitude: -127.827724, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
        ],
        austria: [
            //3
            { latitude: 47.001908, longitude: 11.169824, radius: 120, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 47.84184, longitude: 15.102929, radius: 120, radiusUnits: "MILES", bidModifier: 1 },
        ],
        australia: [
            // 4
            { latitude: -16.974868, longitude: 133.144702, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -17.436632, longitude: 143.603687, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -21.414232, longitude: 125.4323, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -23.445129, longitude: 116.753101, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -24.8087, longitude: 132.639331, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -26.708346, longitude: 140.549487, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -28.190203, longitude: 150.019702, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -30.450591, longitude: 120.268726, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -33.065788, longitude: 133.496265, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: -38.481135, longitude: 146.262378, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
        ],
        belgium: [
            // 5
            { latitude: 50.379593, longitude: 4.802881, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
        ],
        denmark: [
            // 6
            { latitude: 55.835174, longitude: 10.568438, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
        ],
        finland: [
            // 7
            { latitude: 61.944072, longitude: 25.49138, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 64.890887, longitude: 28.39177, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 67.945739, longitude: 25.842942, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
        ],
        france: [
            // 8
            { latitude: 46.489448, longitude: 2.270628, radius: 400, radiusUnits: "MILES", bidModifier: 1 },
        ],
        germany: [
            // 9
            { latitude: 51.246908, longitude: 10.318127, radius: 300, radiusUnits: "MILES", bidModifier: 1 },
        ],
        ireland: [
            // 10
            { latitude: 53.178502, longitude: -8.174986, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
        ],
        italy: [
            // 11
            { latitude: 37.912285, longitude: 15.174539, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 40.416152, longitude: 16.086405, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 40.849699, longitude: 9.071634, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 43.055383, longitude: 12.158792, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 44.710185, longitude: 8.796976, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 45.961212, longitude: 11.47764, radius: 150, radiusUnits: "MILES", bidModifier: 1 },
        ],
        luxembourg: [
            // 12
            { latitude: 49.807216, longitude: 6.097279, radius: 30, radiusUnits: "MILES", bidModifier: 1 },
        ],
        netherlands: [
            // 13
            { latitude: 51.488459, longitude: 5.983865, radius: 60, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 51.79526, longitude: 4.544656, radius: 60, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 52.763119, longitude: 6.412332, radius: 60, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 52.802989, longitude: 4.940164, radius: 60, radiusUnits: "MILES", bidModifier: 1 },
        ],
        "new zeland": [
            // 14
            { latitude: -41.27848, longitude: 172.578636, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
        ],
        norway: [
            // 15
            { latitude: 60.651961, longitude: 8.649067, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 65.385414, longitude: 9.176411, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 69.271935, longitude: 14.010396, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 70.988558, longitude: 25.831685, radius: 200, radiusUnits: "MILES", bidModifier: 1 },
        ],
        spain: [
            // 16
            { latitude: 40.206167, longitude: -3.947912, radius: 450, radiusUnits: "MILES", bidModifier: 1 },
        ],
        sweden: [
            // 17
            { latitude: 57.371578, longitude: 14.703752, radius: 170, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 59.842615, longitude: 15.494768, radius: 170, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 62.99317, longitude: 17.032854, radius: 170, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 66.712126, longitude: 19.274065, radius: 170, radiusUnits: "MILES", bidModifier: 1 },
        ],
        switzerland: [
            // 18
            { latitude: 46.962386, longitude: 8.101063, radius: 120, radiusUnits: "MILES", bidModifier: 1 },
        ],
        "united kingdom": [
            // 19
            { latitude: 51.311626, longitude: -2.121658, radius: 190, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 54.922311, longitude: -4.055252, radius: 190, radiusUnits: "MILES", bidModifier: 1 },
            { latitude: 57.85197, longitude: -4.340896, radius: 190, radiusUnits: "MILES", bidModifier: 1 },
        ],
    };
    var prox = [];
    for (var i = 0; i < targetedCountries.list.length; i++) {
        prox = prox.concat(targetProximities[targetedCountries.list[i]]);
    }
    return prox;
}

function test() {
    var countriesStr =
        "australia;austria;belgium;canada;denmark;finland;france;germany;ireland;italy;luxembourg;netherlands;new zeland;norway;spain;sweden;switzerland;united kingdom;united states";
    //     "spain;sweden;switzerland;united kingdom;united states";
    // var countriesStr = "united states";
    var targetedCountries = getAllTargetCountries(countriesStr);
    console.log(targetedCountries);
    if (!targetedCountries.ok) return;

    var countriesExclusions = getCountriesExclusion(targetedCountries);
    var proximities = getProximityExclusion();
    proximities = proximities.concat(getProximity(targetedCountries));

    console.log(proximities.length);
}

test();
