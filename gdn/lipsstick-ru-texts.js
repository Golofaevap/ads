function main() {
    //
    //

    const inputParameters = {
        url__: "",
        trackingUrl__: "",
        countriesStr: "", //
        samaraId: "", //
    };

    //
    var time = { delay: 12, duration: 0.5, range: "off" };
    //time.delay, time.duration, time.range
    if (!inputParameters.url__ || !inputParameters.trackingUrl__) {
        Logger.log(
            "ERROR. CHECK INPUT PARAMETERS: const inputParameters = {  url__: '', trackingUrl__: '', countriesStr: '' };"
        );
        return;
    }
    //

    var bgt = 49; // $
    var bid = 0.25; // $
    var multiplyer = getBudgetMultiplier();
    bgt = bgt * multiplyer;
    bid = bid * multiplyer;
    if (multiplyer > 10) {
        bgt = Math.round(bgt);
        bid = Math.round(bid);
    } else {
        bgt = Math.round(bgt * 100) / 100;
        bid = Math.round(bid * 100) / 100;
    }
    // bgt = 2;
    const opts = {
        cOpts: {
            name: "Display - 1",
            budget: bgt,
            lang: "", //it;es;pt
            type: "Display",
            strategy: "Maximize clicks",
            status: "Enabled",
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: bid,
        },
        aOpts: {
            h1: "Трёхцветная основа под макияж",
            h2: "Идеально выравнивает тон кожи",
            h3: "Убирает серый желтый цвет кожи",
            d1: "Уникальная трехцветная основа под макияж JomTam идеально выравнивает тон кожи",
            d2: "Минимизирует покраснения, убирает серый и желтый подтон кожи, осветляет пигментацию",
            url: inputParameters.url__,
        },
        lOpt: {
            inc: [2643],
            exc: [],
        },
        tracking: {
            enabled: true,
            template:
                "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
            uurl: inputParameters.trackingUrl__,
        },
        schedule: getSchedule(inputParameters.samaraId, time.delay, time.duration, time.range),
    };

    _updateItalyAd(opts);

    //showAllPlacementExclusions(opts.cOpts.name);
}

// *******************************************************************************************
// *******************************************************************************************
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
    //Utilities.sleep(2000);
    _includeTopics(opts.cOpts.name, opts.gOpts.name);
    setSchedule(opts.cOpts.name, opts.schedule);
    Utilities.sleep(2000);
    _addLocations(opts.cOpts.name, opts.lOpt.inc);

    Utilities.sleep(2000);
    _remLocations(opts.cOpts.name, opts.lOpt.exc);
    // Utilities.sleep(290000);
    // Utilities.sleep(290000);
    // Utilities.sleep(290000);
    // Utilities.sleep(290000);
    // Utilities.sleep(290000);

    insertTemplate(opts);
    Logger.log("All was done! ! !");
}

// *******************************************************************************************
// *******************************************************************************************
function insertTemplate(opts) {
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
        }
    }

    while (groupsIterator.hasNext()) {
        var object = groupsIterator.next();
        object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
    }
}
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
            const loc = arrayLoc[i];
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
            const loc = arrayLoc[i];
            campaign.excludeLocation(loc, 1);
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function _createDisplayCampaigns(cOpts) {
    try {
        var columns = [
            "Campaign",
            "Budget",
            "Networks",
            "Language",
            "Bid Strategy type",
            "Campaign type",
            "Campaign Status",
        ];

        var upload = AdWordsApp.bulkUploads().newCsvUpload(columns, {
            moneyInMicros: false,
        });

        upload.append({
            Campaign: cOpts.name || "Display - 1.",
            Budget: cOpts.budget,
            "Budget type": "Daily",
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

// *******************************************************************************************
// *******************************************************************************************
function _addGroupToDisplay(campaignName, gOpts) {
    //Logger.log(campaignName, gOpts);
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

// *******************************************************************************************
// *******************************************************************************************
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
// *******************************************************************************************
// *******************************************************************************************

function _excludeTopics(campaignName) {
    // https://developers.google.com/google-ads/api/reference/data/verticals?hl=en

    var topics = getTopics();

    var campaignIter = AdsApp.campaigns()
        .withCondition("Name = '" + campaignName + "'")
        .get();
    while (campaignIter.hasNext()) {
        var campaign = campaignIter.next();
        for (var i = 0; i < topics.inc.length; i++) {
            campaign.display().newTopicBuilder().withTopicId(topics.exc[i].index).exclude();
        }
    }
}
// *******************************************************************************************
// *******************************************************************************************
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

// *******************************************************************************************
// *******************************************************************************************
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

// *******************************************************************************************
// *******************************************************************************************
function _includeTopics(campaignName, adGroupName) {
    // https://developers.google.com/google-ads/api/reference/data/verticals?hl=en
    var topics = getTopics();

    var adGroupIter = AdsApp.adGroups()
        .withCondition("Name = '" + adGroupName + "'")
        .withCondition('CampaignName = "' + campaignName + '"')
        .get();
    while (adGroupIter.hasNext()) {
        var adGroup = adGroupIter.next();
        for (var i = 0; i < topics.inc.length; i++) {
            adGroup.display().newTopicBuilder().withTopicId(topics.inc[i].index).build();
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function getTopics() {
    return {
        inc: [
            { index: 3, description: "Arts & Entertainment" },
            { index: 44, description: "Beauty & Fitness" },
            { index: 22, description: "Books & Literature" },
            { index: 45, description: "Health" },
            { index: 65, description: "Hobbies & Leisure" },
            { index: 11, description: "Home & Garden" },
            { index: 14, description: "People & Society" },
            { index: 18, description: "Shopping" },
        ],
        exc: [
            { index: 12, description: "Business & Industrial" },
            { index: 5, description: "Computers & Electronics" },
            { index: 7, description: "Finance" },
            { index: 8, description: "Games" },
            { index: 47, description: "Autos & Vehicles" },
            { index: 533, description: "Reference" },
            { index: 174, description: "Science" },
            { index: 20, description: "Sports" },
            { index: 67, description: "Travel & Transportation" },
            { index: 5000, description: "World Localities" },
            { index: 13, description: "Internet & Telecom" },
            { index: 958, description: "Jobs & Education" },
            { index: 19, description: "Law & Government" },
        ],
        neutral: [
            { index: 71, description: "Food & Drink" },
            { index: 16, description: "News" },
            { index: 299, description: "Online Communities" },
            { index: 29, description: "Real Estate" },
            { index: 66, description: "Pets & Animals" },
        ],
    };
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
    Logger.log(resultJson);
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
