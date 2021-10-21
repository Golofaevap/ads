function getOptions() {
    var bid = 1.9;

    return {
        exLoc: [2356],
        keywords: [
            { word: "wallet matic network", cpc: bid },
            { word: '"wallet matic network"', cpc: bid },
            { word: "[wallet matic network]", cpc: bid },
            { word: "wallet matic", cpc: bid },
            { word: '"wallet matic"', cpc: bid },
            { word: "[wallet matic]", cpc: bid },
            { word: "polygon wallet", cpc: bid },
            { word: '"polygon wallet"', cpc: bid },
            { word: "[polygon wallet]", cpc: bid },
            { word: "ｍａｔic", cpc: bid },
            { word: '"ｍａｔic"', cpc: bid },
            { word: "[ｍａｔic]", cpc: bid },
        ],
        _keywords: [
            { word: "ｗａｌlｅｔ mａｔic nｅｔwｏrk", cpc: bid },
            { word: '"ｗａｌlｅｔ mａｔic nｅｔwｏrk"', cpc: bid },
            { word: "[ｗａｌlｅｔ mａｔic nｅｔwｏrk]", cpc: bid },
            { word: "ｗａｌlｅt mａｔic", cpc: bid },
            { word: '"ｗａｌlｅt mａｔic"', cpc: bid },
            { word: "[ｗａｌlｅt mａｔic]", cpc: bid },
            { word: "ｐｏｌygｏn ｗａｌlｅｔ", cpc: bid },
            { word: '"ｐｏｌygｏn ｗａｌlｅｔ"', cpc: bid },
            { word: "[ｐｏｌygｏn ｗａｌlｅｔ]", cpc: bid },
            { word: "matic", cpc: bid },
            { word: '"matic"', cpc: bid },
            { word: "[matic]", cpc: bid },
        ],
    };
}

function modifyKey(key) {
    var library = {
        p: "ｐ",
        o: "ｏ",
        l: "ｌ",
        y: "ｙ",
        g: "ｇ",
        n: "ｎ",
        w: "ｗ",
        a: "ａ",
        e: "ｅ",
        t: "ｔ",
        m: "ｍ",
        i: "i",
        r: "ｒ",
        c: "ｃ",
        k: "ｋ",
    };
    var newKey = ""
    // console.log(key, library);
    for (var i = 0; i < key.length; i++) {
        var probability = Math.random();
        // console.log(probability, library[key[i]], key[i]);
        if (probability > 0.5 && library[key[i]]) {
          newKey+= library[key[i]];
        }
        else{
          newKey+= key[i];
        }
    }

    return newKey;
}
function main() {
    var opts = getOptions();
    addKeywords(opts);
    removeLocations();
    excludeLocations(opts);
    removeLangs();
}

function addKeywords(opts) {
    var keywords = opts.keywords;

    var adGroupIter = AdsApp.adGroups().get();

    while (adGroupIter.hasNext()) {
        var group = adGroupIter.next();
        for (var i = 0; i < keywords.length; i++) {
            group.newKeywordBuilder().withText(modifyKey(keywords[i].word)).withCpc(keywords[i].cpc).build();
            Utilities.sleep(2000);
        }
    }
}

function removeLocations() {
    var campIter = AdsApp.campaigns().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        var locationIter = camp.targeting().targetedLocations().get();
        while (locationIter.hasNext()) {
            var loc = locationIter.next();
            loc.remove();
        }
    }
}

function excludeLocations(opts) {
    var exLoc = opts.exLoc;
    var campIter = AdsApp.campaigns().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        for (var i = 0; i < exLoc.length; i++) {
            camp.excludeLocation(exLoc[i]);
            Utilities.sleep(2000);
        }
    }
}

function removeLangs() {
    var campIter = AdsApp.campaigns().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        var langIter = camp.targeting().languages().get();
        while (langIter.hasNext()) {
            var lang = langIter.next();
            lang.remove();
        }
    }
}
// console.log(modifyKey("polygon"));
