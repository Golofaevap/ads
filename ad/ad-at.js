function main() {
    //
    //

    const url__ = ""; //
    //
    // 
    //
    // var bgt = Math.random() * 700 + 290;
    var bgt = Math.random() * 100 + 190;
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    const opts = {
        cOpts: {
            name: "Display - 1",
            budget: bgt,
            geo: "Austria",
            lang: "de", //it;es;pt
            type: "Display",
            strategy: "Maximize conversions",
            status: "Paused",
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: "1",
        },
        aOpts2: {
            h1: "Mehr als 3 mal pro Nacht",
            h2: "Jetzt habe ich stundenlang sex",
            h3: "Super Power und 3 Stunden sex",
            d1: "Tun Sie dies 15 Minuten vor dem xes und es wird 4 mal länger sein",
            d2: "45 Minuten vor dem Geschlechtsverkehr mit einem großen Glas Wasser trinken.",
            url: url__,
        },
        aOpts: {
            h1: "Jetzt mache stundenlang Liebe", 
            h2: "Frauen sind begeistert",
            h3: "Die Wirkung hält 6 Monate an",
            d1: "Wiederherstellung der Poten für 1 Kurs",
            d2: "Mein Mann hat die Ausdauer eines Pferdes",
            url: url__,
        },
    };

    _updateItalyAd(opts);
    UrlFetchApp.fetch("ya.ru");
    //showAllPlacementExclusions(opts.cOpts.name);
}

function _updateItalyAd(opts) {
    var campResult = _createDisplayCampaigns(opts.cOpts);
    if (!campResult.ok) {
        Logger.log("Problem! createDisplayCampaigns");
        return 0;
    }
    Utilities.sleep(5000);
    var adGroupResult = _addGroupToDisplay(opts.cOpts.name, opts.gOpts);
    if (!adGroupResult.ok) {
        Logger.log("Problem! addGroupToDisplay");
        return 0;
    }

    Utilities.sleep(5000);
    var adReustlt = _addExpandedTextAd(opts.cOpts.name, opts.gOpts.name, opts.aOpts);
    if (!adReustlt.ok) {
        Logger.log("Problem! addExpandedTextAd");
        return 0;
    }

    Utilities.sleep(2000);
    _excludePlacements(opts.cOpts.name, opts.gOpts.name);
    Utilities.sleep(2000);
    _excludeTopics(opts.cOpts.name);
    Utilities.sleep(2000);
    _includeTopics(opts.cOpts.name, opts.gOpts.name);

    Logger.log("All was done! ! !");
}

function _createDisplayCampaigns(cOpts) {
    try {
        var columns = ["Campaign", "Budget", "Networks", "Language", "Location", "Bid Strategy type", "Campaign type", "Campaign Status"];

        var upload = AdWordsApp.bulkUploads().newCsvUpload(columns, {
            moneyInMicros: false,
        });

        upload.append({
            Campaign: cOpts.name || "Display - 1.",
            Budget: cOpts.budget,
            "Budget type": "Daily",
            Location: cOpts.geo,
            Networks: "Display Network",
            Language: cOpts.lang,
            "Campaign type": cOpts.type,
            "Ad rotation": "Optimize for clicks",
            "Bid Strategy type": cOpts.strategy,
            "Campaign Status": cOpts.status,
        });
        // Use upload.apply() to make changes without previewing.
        upload.apply();
        return { ok: true };
    } catch (e) {
        Logger.log(e);
        return { ok: false };
    }
    return { ok: false };
}

function _addGroupToDisplay(campaignName, gOpts) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + campaignName + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
        var adGroup = adGroupOperation.getResult();
        return { adGroup: adGroup, campaign: campaign, ok: true };
    }
    return { ok: false };
}

function _addExpandedTextAd(campaignName, adGroupName, aOpts) {
    try {
        var adGroupIterator = AdsApp.adGroups()
            .withCondition('Name = "' + adGroupName + '"')
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();

        if (adGroupIterator.hasNext()) {
            var adGroup = adGroupIterator.next();
            var adOperation = adGroup
                .newAd()
                .expandedTextAdBuilder()
                .withHeadlinePart1(aOpts.h1)
                .withHeadlinePart2(aOpts.h2)
                .withHeadlinePart3(aOpts.h3)
                .withDescription1(aOpts.d1)
                .withDescription2(aOpts.d2)
                .withFinalUrl(aOpts.url)
                .build();

            var ad = adOperation.getResult();
            return {
                ok: true,
                adGroup: adGroup,
                ad: ad,
            };
        }
    } catch (e) {
        Logger.log(e);
        return { ok: false };
    }
    return { ok: false };
}

function _excludeTopics(campaignName) {
    var games = 8;
    var jobAndEducation = 958;
    var reference = 533;
    var science = 174;

    var campaign = AdsApp.campaigns()
        .withCondition("Name = '" + campaignName + "'")
        .get()
        .next();

    campaign.display().newTopicBuilder().withTopicId(games).exclude();

    campaign.display().newTopicBuilder().withTopicId(jobAndEducation).exclude();

    campaign.display().newTopicBuilder().withTopicId(reference).exclude();

    campaign.display().newTopicBuilder().withTopicId(science).exclude();
}
function _excludePlacements(campaignName, adGroupName) {
    var campaign = AdsApp.campaigns()
        .withCondition("Name = '" + campaignName + "'")
        .get()
        .next();

    campaign.display().newPlacementBuilder().withUrl("anonymous.google").exclude();

    campaign.display().newPlacementBuilder().withUrl("youtube.com").exclude();

    //Logger.log('Placement with id = %s and url = %s was created.',
    //placement.getId(), placement.getUrl());
}

function showAllPlacementExclusions(campaignName) {
    var campaign = AdsApp.campaigns()
        .withCondition("Name = '" + campaignName + "'")
        .get()
        .next();

    var exPl = campaign.display().excludedPlacements().get();
    while (exPl.hasNext()) {
        var ex = exPl.next();
        Logger.log(ex.getUrl());
    }
}

function _includeTopics(campaignName, adGroupName) {
    var health = 45;
    var news = 16;

    var adGroup = AdsApp.adGroups()
        .withCondition("Name = '" + adGroupName + "'")
        .withCondition('CampaignName = "' + campaignName + '"')
        .get()
        .next();

    adGroup.display().newTopicBuilder().withTopicId(health).build();

    adGroup.display().newTopicBuilder().withTopicId(news).build();
}

function changeText(text, invis) {
    const latin = {
        A: [
            "A" /* lat */,
            "A" /* lat */,
            "A" /* lat */,
            "A" /* lat */,
            "A" /* lat */,
            "A" /* lat */,
            "А" /* cyr */,
            "А" /* cyr */,
            "А" /* cyr */,
            "А" /* cyr */,
            "А" /* cyr */,
            "А" /* cyr */,
            "À",
            "Á",
            "Â",
            "Ã",
            "Ä",
            "Å",
        ],
        B: ["B" /* lat */, "В" /* cyr */, "Ḇ", "Ḅ"],
        C: ["C" /* lat */, "С" /* cyr */, "Ç"],
        D: ["D" /* lat */, "D" /* lat */, "D" /* lat */, "Ḑ", "Ḏ", "Ḋ", "ⅅ"],
        E: ["E" /* lat */, "Е" /* cyr */, "È", "É", "Ê", "Ë"],
        F: ["F" /* lat */, "F" /* lat */, "F" /* lat */, "Ḟ"],
        G: ["G" /* lat */, "G" /* lat */, "G" /* lat */, "Ḡ"],
        H: ["H" /* lat */, "Н" /* cyr */, "H" /* lat */, "Н" /* cyr */, "H" /* lat */, "Н" /* cyr */, "H" /* lat */, "Н" /* cyr */, "Ң"],
        I: ["I" /* lat */, "I" /* lat */, "I" /* lat */, "Ị"],
        J: ["J" /* lat */],
        K: [
            "K" /* lat */,
            "К" /* cyr */,
            "Ҝ",
            "K" /* lat */,
            "К" /* cyr */,
            "Ҝ",
            "K" /* lat */,
            "К" /* cyr */,
            "Ҝ",
            "K" /* lat */,
            "К" /* cyr */,
            "Ҝ",
            "K" /* lat */,
            "К" /* cyr */,
            "Ҝ",
            "Ҟ",
            "Ҡ",
            // "Қ",
        ],
        L: ["L" /* lat */, "L" /* lat */, "L" /* lat */, "Ḷ", "Ḻ"],
        M: ["M" /* lat */, "М" /* cyr */, "M" /* lat */, "М" /* cyr */, "Ṃ"],
        N: ["N" /* lat */, "N" /* lat */, "N" /* lat */, "Ṉ", "Ṇ"],
        O: ["O" /* lat */, "О" /* cyr */, "O" /* lat */, "О" /* cyr */, "Ọ", "Ѳ", "Ѻ"],
        P: ["P" /* lat */, "Р" /* cyr */, "P" /* lat */, "Р" /* cyr */, "Ṗ"],
        Q: ["Q" /* lat */, "Ԛ"],
        R: ["R" /* lat */],
        S: ["S" /* lat */, "S" /* lat */, "S" /* lat */, "Ṣ", "Ṡ"],
        T: ["T" /* lat */, "Т" /* cyr */, "T" /* lat */, "Т" /* cyr */, "Ṯ"],
        U: ["U" /* lat */, "U" /* lat */, "Ụ", "Ṳ"],
        V: ["V" /* lat */, "V" /* lat */, "Ṿ"],
        W: ["W" /* lat */, "W" /* lat */, "Ԝ", "Ẅ"],
        X: ["X" /* lat */, "Х" /* cyr */, "Ẍ"],
        Y: ["Y" /* lat */, "Y" /* lat */, "Ẏ"],
        Z: ["Z" /* lat */, "Z" /* lat */, "Ẕ"],
        a: [
            "a" /* lat */,
            "а" /* cyr */,
            "a" /* lat */,
            "а" /* cyr */,
            "ạ",
            // "ấ",
        ],
        b: ["b" /* lat */, "b" /* lat */, "ḅ", "ḇ"],
        c: ["c" /* lat */, "с" /* cyr */, "c" /* lat */, "с" /* cyr */ /*, "ḉ"*/],
        d: ["d" /* lat */, "d" /* lat */, "d" /* lat */, "ḏ"],
        e: ["e" /* lat */, "е" /* cyr */],
        f: ["f" /* lat */, "f" /* lat */, "ḟ"],
        g: ["g" /* lat */, "g" /* lat */, "g" /* lat */, "ḡ"],
        h: ["h" /* lat */, "h" /* lat */, "h" /* lat */, "ḥ", "ḧ", "ḩ"],
        i: ["i" /* lat */, "i" /* lat */, "i" /* lat */, "ḯ"],
        j: ["j" /* lat */],
        k: ["k" /* lat */, "k" /* lat */, "k" /* lat */, "ḳ", "ḵ"],
        l: ["l" /* lat */, "l" /* lat */, "l" /* lat */, "ḻ", "ḽ"],
        m: ["m" /* lat */, "m" /* lat */, "m" /* lat */, "ṃ", "ḿ"],
        n: ["n" /* lat */, "n" /* lat */, "n" /* lat */, "ṅ", "ṉ"],
        o: ["o" /* lat */, "o" /* lat */, "o" /* lat */, "о" /* cyr */, "օ"],
        p: ["p" /* lat */, "p" /* lat */, "p" /* lat */, "р" /* cyr */],
        q: ["q" /* lat */, "q" /* lat */, "q" /* lat */, "ԛ", "զ"],
        r: ["r" /* lat */, "r" /* lat */, "r" /* lat */, "ṙ", "ṛ", "ṟ"],
        s: ["s" /* lat */, "s" /* lat */, "s" /* lat */, "ṣ"],
        t: ["t" /* lat */, "t" /* lat */, "t" /* lat */, "ṯ"],
        u: ["u" /* lat */, "u" /* lat */, "u" /* lat */, "ṳ"],
        v: ["v" /* lat */, "v" /* lat */, "v" /* lat */, "ṿ"],
        w: ["w" /* lat */, "w" /* lat */, "w" /* lat */, "ԝ", "ẅ"],
        x: ["x" /* lat */, "x" /* lat */, "x" /* lat */, "х" /* cyr */, "ẍ"],
        y: ["y" /* lat */, "y" /* lat */, "y" /* lat */, "у" /* cyr */, "ỵ"],
        z: ["z" /* lat */, "z" /* lat */, "z" /* lat */, "ẕs"],
    };

    var string = "";
    for (var idx = 0; idx < text.length; idx++) {
        //   if (text[i] === " ") {
        //       continue;
        if (!latin[text[idx]]) {
            string += text[idx];
            continue;
        }
        var newLetter = "" + shuffleArray(latin[text[idx]])[0];
        //   Logger.log(newLetter.charCodeAt(0), _.shuffle(latin[text[i]]));
        string += newLetter;
    }
    Logger.log(string);

    if (invis) {
        for (var idx = 0; idx < invis; idx++) {
            var index = Math.round(Math.random() * string.length);
            string = string.slice(0, index) + String.fromCharCode(847) + string.slice(index);
        }
    }
    Logger.log(string);
    return string;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
