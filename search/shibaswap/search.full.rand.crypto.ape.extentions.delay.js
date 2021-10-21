function main() {
    //

    var inputParameters = {
        url__: "",
        trackingUrl__: "",
        countriesStr: "", // australia;austria;belgium;canada;denmark;finland;france;germany;ireland;italy;luxembourg;netherlands;new zealand;norway;spain;sweden;switzerland;united kingdom;united states
        samaraId: "", // Любая строка или число
    };
    //
    //removeLabels()
    var _bgt = 9; // $
    var adjustText = true;
    // delay, duration, range
    //
    var time = { delay: 5.5 + Math.round(Math.random() * 1), duration: 3.7, range: 4 };

    //
    // new zealand
    var targetedCountries = getAllTargetCountries(inputParameters.countriesStr);
    if (!targetedCountries.ok || !inputParameters.url__ || !inputParameters.trackingUrl__) {
        Logger.log(
            "ERROR. CHECK INPUT PARAMETERS: var inputParameters = {  url__: '', trackingUrl__: '', countriesStr: '' };"
        );
        return;
    }

    //
    //
    Logger.log(targetedCountries.array);
    var budgetMultiplier = getBudgetMultiplier();
    var _bgtLevel = (_bgt * 100 + 90) * budgetMultiplier;
    var opts = getOpts(inputParameters, targetedCountries, _bgtLevel, adjustText, budgetMultiplier, time);
    _updateAd(opts);

    //showAllPlacementExclusions(opts.cOpts.name);
}

// *******************************************************************************************
// *******************************************************************************************
function _updateAd(opts) {
    var constants = {
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
    Utilities.sleep(290000);
    Utilities.sleep(290000);
    Utilities.sleep(290000);
    Utilities.sleep(290000);

    insertTemplate(opts, labels, constants);
    getStatReport();
    return;
}

// *******************************************************************************************
// *******************************************************************************************
function setSchedule(campaignName, schedule) {
    Logger.log(schedule);
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
        Utilities.sleep(1000);
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
    var cOpts = opts.cOpts;
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
            upload.apply();

            Utilities.sleep(10000);
        }
        _addLocations(opts.cOpts.name, opts.lOpt.inc);
        Utilities.sleep(2000);
        _remLocations(opts.cOpts.name, opts.lOpt.exc);
        var desc = "" + new Date().getTime();
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
    // if (labels[constants.AD_GROUP_CREATED]) {
    //     return;
    // }

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
    // if (labels[constants.AD_CREATED]) {
    //     return;
    // }

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
    if (array.legth > limit) array = array.slice(0, limit);
    return array;
}
// *******************************************************************************************
// *******************************************************************************************

function getLabels() {
    var labels = {};
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

function insertTemplate(opts, labels, constants) {
    if (!opts.tracking.enabled) return;

    var options = {
        customParameter_uurl: opts.tracking.uurl, // insert your redirect here
        trackingTemplate: opts.tracking.template,
    };

    var campaignsIterator = AdsApp.campaigns().get();
    var groupsIterator = AdsApp.adGroups().get();

    var templateInsert = true;

    if (templateInsert) {
        while (campaignsIterator.hasNext()) {
            var object = campaignsIterator.next();
            object.urls().setTrackingTemplate(options.trackingTemplate);
            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.TRAKING_TEMPLATE_ADDED, desc, "blue");
        }
        _improveModifier(labels, constants);
    }
    // if (!labels[constants.CUSTOM_PARAMETER_ADDED]) {
    while (groupsIterator.hasNext()) {
        var object = groupsIterator.next();
        object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
        var desc = "" + new Date().getTime();
        // AdsApp.createLabel(constants.CUSTOM_PARAMETER_ADDED, desc, "blue");
    }
    // }
}
// *******************************************************************************************
// *******************************************************************************************
function getKW() {
    return ["shibaswap"];
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
function getKeyword_OneOfMany(bid) {
    var kws = getKW();
    var key__ = kws[Math.floor(Math.random() * kws.length)];
    return [
        { word: key__, cpc: bid },
        { word: '"' + key__ + '"', cpc: bid },
        { word: "[" + key__ + "]", cpc: bid },
    ];
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
        "Tru͏st Wa͏ll͏͏et",
        "Trust Wall͏͏͏͏et",
        "Tr͏ust ͏Wa͏llet͏",
        "Tr͏ust W͏all͏͏et",
        "Trust͏ ͏͏͏Wallet",
        "T͏r͏ust ͏W͏allet",
        "Tr͏u͏s͏t͏ Wallet",
        "Tru͏st͏ W͏͏allet",
    ];
    // var array = ["Τust WaΙleτ", "Trυst WalΙet", "Τrust WaΙleτ", "Τrυst WalΙet", "Τιust WaΙΙeτ", "Τrυst Wallet"];
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
        "In Stock",
        "View Reviews",
        "Payment Options Available",
        "A Glossary of Terms",
    ];
}
// *******************************************************************************************
// *******************************************************************************************
function getSnippets() {
    return [
        "‎Register Online",
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
        { text: "Sign Up", desc1: "Sign Up Online Secure", desc2: "Connect With Web", anchor: "#signup" },
        { text: "Log In", desc1: "Connect and Start Now", desc2: "Fast safe Web Access", anchor: "#login" },
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
    var bgt = Math.random() * 200 + _bgtLevel; // бюджет | максимум 9.9, минимум 2.9
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    var bid = Math.round(190 * budgetMultiplier) / 100;
    if (budgetMultiplier > 10) {
        bgt = Math.round(bgt);
        bid = Math.round(bid);
    }
    var keys__ = getKeyword_All(bid);
    var opts = {
        cOpts: {
            name: "Search-1", // <- Меняй название кампании, если предыдущий запуск был неуспешным (по любой причине) и запускаешь повторно
            budget: bgt,
            lang: "", //it;es;pt <- несколько языков в таком формате
            type: "Search",
            strategy: "Maximize clicks", //    "Manual CPC", "CPC (enhanced)",  "Target CPA", "Maximize clicks", "Maximize conversions"
            // network: "Search", //  если нужны оба, то null без кавычек
            status: "Enabled", // "Paused" or "Enabled"
        },
        gOpts: {
            name: "AdGroup-1",
            cpc: bid,
            keywords: keys__,
        },
        aOpts: {
            h1: ["Shibaswap Home", "Shibaswap Connect", "Shibaswap Start Now", "Shibaswap Web Connect"],
            h2: ["Get Information", "Sign Up Online Secure", "Connect and Start Now"],
            h3: ["Fast safe Web Access", "Information online", "Connect With Web"],
            d1: [
                "Shibaswap Safe & Secure Get Information. Fast & safe Web Access",
                "Shibaswap Safe & Secure Get Information",
                "Shibaswap near you. Fast Access & secure. Manage your wallet assets.",
            ],
            d2: [
                "Connect With Web Access - Secure Access",
                "Work safely in the internet. Make all actions private and confident.",
                "Connect With Web Access - Secure Access. Available worldwide.",
            ],
            url: inputParameters.url__,
            adjust: adjust,
        },
        lOpt: {
            // локации на включение и исключение выбирай из списка ниже
            inc: targetedCountries.array,
            exc: [2356],
        },
        proximities: [],
        tracking: {
            enabled: true,
            template:
                "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
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
        schedule: getSchedule(inputParameters.samaraId, time.delay, time.duration, time.range),
        // targetedCountries: targetedCountries,
    };
    return opts;
}
