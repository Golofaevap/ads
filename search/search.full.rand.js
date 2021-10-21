function main() {
    //
    //

    var url__ = ""; // <- здесь меняешь ссылку объявления
    var trackingUrl__ = "";

    var labels = getLabels();
    Logger.log(labels);

    if (!labels.firstDate) {
        AdsApp.createLabel("firstDate", new Date().toISOString().slice(0, 10), "red");
    }
    if (!url__) {
        Logger.log("Insert url");
        return;
    } else {
        if (!labels.url) {
            AdsApp.createLabel("url", url__, "blue");
        }
    }

    //
    //

    var bgt = Math.random() * 700 + 290; // бюджет | максимум 9.9, минимум 2.9
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    // bgt = 2;
    var opts = {
        cOpts: {
            name: "Search-1", // <- Меняй название кампании, если предыдущий запуск был неуспешным (по любой причине) и запускаешь повторно
            budget: bgt,
            lang: "ru", //it;es;pt <- несколько языков в таком формате
            type: "Search",
            strategy: "Maximize conversions", //    "Manual CPC", "CPC (enhanced)",  "Target CPA", "Maximize clicks", "Maximize conversions"
            // network: "Search", //  если нужны оба, то null без кавычек
            status: "Paused", // "Paused" or "Enabled"
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: "1",
            keywords: [
                // ниже вставляй свои ключевые слова. Строго соблюдай синтаксис (кавычки и косые линии) для вразового соответствия
                { word: "широкое соответствие", cpc: 1 },
                { word: '"фразовое соотевтствие"', cpc: 1 },
                { word: "[точное соответствие]", cpc: 1 },
            ],
        },
        aOpts: {
            h1: ["Первый Заголовок 1", "Первый Заголовок 2", "Первый Заголовок 3"],
            h2: ["Второй Заголовок 1", "Второй Заголовок 2", "Второй Заголовок 3"],
            h3: ["Третий Заголовок 1", "Третий Заголовок 2", "Третий Заголовок 3"],
            d1: ["Описание 1", "Описание 2", "Описание 3"],
            d2: ["Описание 1", "Описание 2", "Описание 3"],
            url: url__,
        },
        lOpt: {
            // локации на включение и исключение выбирай из списка ниже
            inc: [2643],
            exc: [],
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
