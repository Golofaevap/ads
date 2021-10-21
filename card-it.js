function main() {
    const url__ = "";




    var bgt = Math.random() * 700 + 290;
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    // bgt = 2;

    const opts = {
        cOpts: {
            name: "Display - 1",
            budget: bgt,
            geo: "Italy",
            lang: "it", //it;es;pt
            type: "Display",
            strategy: "Maximize conversions",
            status: "Paused",
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: "1",
        },
        aOpts: {
            h1: "Prеssione оltrе 150/90?",
            h2: "Ricеttа рer riрulirе le vеne",
            h3: "Rimedio ad alta pressione",
            d1: "Puliziа dеi vаsi sаnguigni dа cоlestеrolo e coаguli di sаngue",
            // d1: "Il sеgreto dei cаrdiоlogi: l’ipеrtеnsione SPARISCE sе smеtti di mаngiаre quеstо…",
            d2:
                "Cоlesterоlo altо: eccо i rimеdi pеr combаttеrlо in mоdo naturаle",
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
    var adReustlt = _addExpandedTextAd(
        opts.cOpts.name,
        opts.gOpts.name,
        opts.aOpts
    );
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
        var columns = [
            "Campaign",
            "Budget",
            "Networks",
            "Language",
            "Location",
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
        var adGroupOperation = campaign
            .newAdGroupBuilder()
            .withName(gOpts.name)
            .withCpc(gOpts.cpc)
            .build();
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

    campaign
        .display()
        .newPlacementBuilder()
        .withUrl("anonymous.google")
        .exclude();

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

// h1: "Pressione oltre 150/90?",
//             h2: "Il colesterolo è pressione",
//             h3: "Rimedi pressione alta",
//             d1:
//                 "Ipertensione: La pressione arteriosa si stabilizzerà a 120/80 se preparerai",
//             d2: "A magas vérnyomás az első pohár után eltűnik",

/*

       aOpts: {
            h1: "Pressione oltre 150/90?",
            h2: "Ricetta per ripulire le vene",
            h3: "Rimedi pressione alta",
            d1: "Rimedi pressione alta.",
            d2:
                "Semplici consigli per dolore, depressione e disturbi del somnolence",
            url: url__,
        },

*/
