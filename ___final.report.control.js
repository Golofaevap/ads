function main() {
    // response on tasks
    // 1 - success. mark task as completed
    // -1 (to -3) - failed.some technical issues. system will try to do it again several times
    // 0 - failed. mark task as "need operator attention"
    // ===========================================================================================
    const tasks = getTasks();

    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        MyLoggerLog(task.entityType);
        var report = {};
        if (task.entityType == "CAMPAIGN_CREATE_ONLY") {
            MyLoggerLog("Campaign Creation");
            report = _createCampaigns(task.entityData);
            MyLoggerLog(report);
        }
        if (task.entityType == "CAMAPAIGN_CHANGE_STATUS") {
            report = _campaingChangeStatus(task);
            MyLoggerLog(report);
        }
        if (task.entityType == "CAMPAIGN_CHANGE_BUDGET") {
            report = _campaingChangeBudget(task);
            MyLoggerLog(report);
        }
        if (task.entityType == "CAMPAIGN_SET_LOCATION") {
            report = changeLocations(task.entityData);
        }
        if (task.entityType == "CAMPAIGN_ADD_AD_GROUP") {
            // CAMPAIGN_ADD_AD_GROUP
            var campaignId = task.entityData.campaignId;
            var gOpts = {
                name: task.entityData.adGroupName,
                cpc: task.entityData.adGoupCpc,
            };
            report = _addGroupToDisplay(campaignId, gOpts);
        }
        if (task.entityType == "CAMPAIGN_ADD_AD") {
            // CAMPAIGN_ADD_AD_GROUP
            var ed = task.entityData;
            var adGroupId = ed.adGroupId;
            var adType = ed.type;
            if (adType == "EXPANDED_TEXT_AD") {
                var ad = ed.expandedTextAd;
                var aOpts = ad;
                aOpts.url = ed.url;
                report = _addExpandedTextAd(adGroupId, aOpts);
            }
        }

        report.taskId = task._id;
        reportTask(report);
    }
    //return;
    var samaraSession = "";
    var accountEmail = "";

    var user = "nn";
    var day = "26"; // var year = "05"; - ok     bad - var year = "5"; bad - var year = 5;

    var month = "04"; // var year = "04"; - ok     bad - var year = "4"; bad - var year = 4;
    var year = "2021"; // var year = "2021"; - ok     bad - var year = 2021; bad - var year = 21;

    // ===========================================================================================
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // do not change !!!!!
    // Не изменять код ниже !!!
    MyLoggerLog("sending report");
    sendReport(year, month, day, user, samaraSession, accountEmail);
}
// do not change !!!!!
// Не изменять код ниже !!!

// ===========================================================================================
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// do not change !!!!!
// Не изменять код ниже !!!

function _campaingChangeBudget(taskData) {
    MyLoggerLog("_campaingChangeStatus ====---");

    try {
        var entityData = taskData.entityData;
        var campaignIterator = AdsApp.campaigns().withIds([entityData.campaignId]).get();
        if (campaignIterator.hasNext()) {
            var camp = campaignIterator.next();
            camp.getBudget().setAmount(entityData.newBudget);
            return { ok: true, statusCode: 1, message: "Campaign  with id '" + entityData.campaignId + "' get new budget - " + entityData.newBudget };
        }

        return { ok: false, statusCode: 0, message: "Campaign  with id '" + entityData.campaignId + "' is not found!" };
    } catch (e) {
        MyLoggerLog(e);
        //return { ok: false };
        //return { ok: false, statusCode: 1, message: "Internal error"  };
    }
    return { ok: false, statusCode: -1, message: "Problem to create campaign." };
}

function _campaingChangeStatus(taskData) {
    MyLoggerLog("_campaingChangeStatus ====---");

    try {
        var entityData = taskData.entityData;
        var campaignIterator = AdsApp.campaigns().withIds([entityData.campaignId]).get();
        if (campaignIterator.hasNext()) {
            var camp = campaignIterator.next();
            if (entityData.newStatus == "ENABLED") {
                MyLoggerLog("_campaingChangeStatus ====--- camp.enable();");

                camp.enable();
            }
            if (entityData.newStatus == "PAUSED") {
                MyLoggerLog("_campaingChangeStatus ====--- camp.pause();");
                camp.pause();
            }
            return { ok: true, statusCode: 1, message: "Campaign  with id '" + entityData.campaignId + "' get new status - " + entityData.newStatus };
        }

        return { ok: false, statusCode: 0, message: "Campaign  with id '" + entityData.campaignId + "' is not found!" };
    } catch (e) {
        MyLoggerLog(e);
        //return { ok: false, statusCode: -1, message: "Internal error"  };
    }
    return { ok: false, statusCode: -1, message: "Problem to create campaign." };
}

function _createCampaigns(cOpts) {
    try {
        var campaignName = cOpts.name || "Campaign - 1." + Math.round(Math.random() * 10);
        var campaignIterator = AdsApp.campaigns()
            .withCondition('Name = "' + campaignName + '"')
            .get();
        if (campaignIterator.hasNext()) {
            return { ok: false, statusCode: 0, message: "Campaign with this name alredy exists. Name: " + campaignName };
        }

        var columns = ["Campaign", "Budget", "Networks", "Language", "Bid Strategy type", "Campaign type", "Campaign Status"];

        var upload = AdWordsApp.bulkUploads().newCsvUpload(columns, {
            moneyInMicros: false,
        });

        upload.append({
            Campaign: campaignName,
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
        MyLoggerLog(upload.apply());
        //Utilities.sleep(20000);
        //_addLocations(campaignName, cOpts.inLoc);
        //_remLocations(campaignName, cOpts.exLoc);
        return { ok: true, statusCode: 1, message: "Campaign '" + campaignName + "' with type '" + cOpts.type + "' has been created!" };
    } catch (e) {
        MyLoggerLog(e);
        //return { ok: false };
    }
    return { ok: false, statusCode: -1, message: "Problem to create campaign." };
}

function _addGroupToDisplay(campaignId, gOpts) {
    try {
        //MyLoggerLog(campaignName, gOpts);
        var campaignIterator = AdsApp.campaigns().withIds([campaignId]).get();
        if (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
            var adGroup = adGroupOperation.getResult();
            return { ok: true, statusCode: 1, message: "AdGroup '" + gOpts.name + " has been created!" };
        }
    } catch (e) {
        MyLoggerLog(e);
        //return { ok: false };
    }
    return { ok: false, statusCode: -1, message: "Problem to create ad group." };
}

function _addExpandedTextAd(adGroupId, aOpts) {
    try {
        var adGroupIterator = AdsApp.adGroups().withIds([adGroupId]).get();

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
            return { ok: true, statusCode: 1, message: "Ad has been created!" };
        }
    } catch (e) {
        MyLoggerLog(e);
        //return { ok: false };
    }
    return { ok: false, statusCode: -1, message: "Problem to create ad group." };
}

function changeLocations(options) {
    try {
        var campaignIterator = AdsApp.campaigns().withIds([options.campaignId]).get();
        if (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            if (options.deletePrev) {
                var exLocations = campaign.targeting().excludedLocations().get();
                while (exLocations.hasNext()) {
                    var exLocation = exLocations.next();
                    exLocation.remove();
                }
                var locations = campaign.targeting().targetedLocations().get();
                while (locations.hasNext()) {
                    var location = locations.next();
                    location.remove();
                }
            }
            _addLocations(options.campaignId, options.inLoc);
            _remLocations(options.campaignId, options.exLoc);
        }
        return { ok: true, statusCode: 1, message: "Location changed successfully" };
    } catch (e) {
        MyLoggerLog(JSON.stringify(e, 0, 5));
    }
    return { ok: false, statusCode: -1, message: "Problem to change location " };
}

function _addLocations(campaignId, arrayLoc) {
    var campaignIterator = AdsApp.campaigns().withIds([campaignId]).get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Target France (location id = 2250) and set a bid modifier of +50%. See
        // https://developers.google.com/adwords/api/docs/appendix/geotargeting
        // for details.
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = Number(arrayLoc[i]);
            campaign.addLocation(loc, 1);
        }
    }
}

function _remLocations(campaignId, arrayLoc) {
    var campaignIterator = AdsApp.campaigns().withIds([campaignId]).get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Target France (location id = 2250) and set a bid modifier of +50%. See
        // https://developers.google.com/adwords/api/docs/appendix/geotargeting
        // for details.
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = Number(arrayLoc[i]);
            campaign.excludeLocation(loc, 1);
        }
    }
}

function sendReport(year, month, day, user, samaraSession, accountEmail) {
    var dateOfStartString = year + "-" + month + "-" + day;
    var currentDate = new Date();
    var checkLimit = 30;

    var startDate = Date.parse(dateOfStartString);

    var dateDifference = Number(currentDate) - Number(startDate);
    var diffDays = dateDifference / 1000 / 60 / 60 / 24;

    var currentAccount = AdsApp.currentAccount();

    var accountName = currentAccount.getName();
    var accountId = currentAccount.getCustomerId();
    var currency = currentAccount.getCurrencyCode();
    var timeZone = currentAccount.getTimeZone();

    var todayCost = currentAccount.getStatsFor("TODAY").getCost();
    var todayClicks = currentAccount.getStatsFor("TODAY").getClicks();

    var yesterdayCost = currentAccount.getStatsFor("YESTERDAY").getCost();
    var yesterdayClicks = currentAccount.getStatsFor("YESTERDAY").getClicks();

    var totalCost = currentAccount.getStatsFor("ALL_TIME").getCost();
    var totalClicks = currentAccount.getStatsFor("ALL_TIME").getClicks();

    var table = [];

    var sendingData = {
        //id: accountName,
        //date: currentDate,
        type: "getreport",
        accountId: accountId,
        accountInfo: {
            accountId: accountId,
            daysInWork: diffDays,
            checkLimitDays: checkLimit,

            currency: currency,
            timeZone: timeZone,

            totalCost: totalCost,
            totalClicks: totalClicks,

            todayCost: todayCost,
            todayClicks: todayClicks,

            yesterdayCost: yesterdayCost,
            yesterdayClicks: yesterdayClicks,
        },
        campaigns: [],

        user: user,
        samaraSession: samaraSession,
        accountEmail: accountEmail,
        accountName: accountName,
    };

    var campaignIterator = AdsApp.campaigns().get();
    MyLoggerLog("Total campaigns found : " + campaignIterator.totalNumEntities());
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var campaignObject = {};

        //var row = Object. row_prefix;
        //var row = Object.assign({}, row_prefix);
        campaignObject.campaignId = campaign.getId();
        campaignObject.name = campaign.getName();
        campaignObject.type = campaign.getAdRotationType();

        campaignObject.totalClicks = campaign.getStatsFor("ALL_TIME").getClicks();
        campaignObject.totalCost = campaign.getStatsFor("ALL_TIME").getCost();

        campaignObject.todayClicks = campaign.getStatsFor("TODAY").getClicks();
        campaignObject.todayCost = campaign.getStatsFor("TODAY").getCost();

        campaignObject.yesterdayClicks = campaign.getStatsFor("YESTERDAY").getClicks();
        campaignObject.yesterdayCost = campaign.getStatsFor("YESTERDAY").getCost();

        // ------------------------------------------
        campaignObject.topics = "Topics: \n";
        campaignObject.exTopics = "Excluded Topics: \n";
        campaignObject.placements = "Placements: \n";
        campaignObject.exPlacements = "Excluded Placements: \n";
        campaignObject.adsExpText = "Ads: \n";
        // ------------------------------------------
        getCInfo(campaign, campaignObject);
        // ***************************************************
        getLangs(campaign, campaignObject);
        getLocations(campaign, campaignObject);
        //getExcludedLocations(campaign, campaignObject);
        //getExcludedContent(campaign, campaignObject);
        //getPlatforms(campaign, campaignObject);
        //getCTopics(campaign, campaignObject);
        //getCExcludedTopics(campaign, campaignObject);
        //getCPlacements(campaign, campaignObject);
        //getCExcludedPlacements(campaign, campaignObject);
        // +++++++++++++++++++++++++++++++++++++++++++++++++++
        // ***************************************************
        campaignObject.adGroups = [];
        var groups = campaign.adGroups().get();
        while (groups.hasNext()) {
            var groupObject = {};
            var group = groups.next();
            var gName = group.getName();
            var gId = group.getId();
            groupObject.name = gName;
            groupObject.adGroupId = gId;
            // --------------------------------------------

            // ----------------------------------------------------------------
            getGTopics(group, groupObject);
            getGExcludedTopics(group, groupObject);
            getGPlacements(group, groupObject);
            getGExcludedPlacements(group, groupObject);
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
            // ----------------------------------------------------------------
            groupObject.ads = [];
            var ads = group.ads().get();
            while (ads.hasNext()) {
                var adObject = {};
                var ad = ads.next();
                adObject.adId = ad.getId();
                adObject.type = ad.getType();
                adObject.h = [];
                adObject.d = [];

                if (ad.isType().expandedTextAd()) {
                    var expandedTextAd = ad.asType().expandedTextAd();
                    adObject.h.push(expandedTextAd.getHeadlinePart1());
                    adObject.h.push(expandedTextAd.getHeadlinePart2());
                    adObject.h.push(expandedTextAd.getHeadlinePart3());

                    adObject.d.push(expandedTextAd.getDescription1());
                    adObject.d.push(expandedTextAd.getDescription2());

                    adObject.url = expandedTextAd.get;
                }
                if (ad.isType().responsiveSearchAd()) {
                    var responsiveSearchAd = ad.asType().responsiveSearchAd();

                    var _h = responsiveSearchAd.getHeadlines();
                    for (var i in _h) {
                        adObject.h.push(_h[i].text);
                    }

                    var _d = responsiveSearchAd.getDescriptions();
                    for (var i in _d) {
                        adObject.d.push(_d[i].text);
                    }
                }
                adObject.isEnabled = ad.isEnabled();
                adObject.approval = ad.getPolicyApprovalStatus();
                adObject.url = ad.urls().getFinalUrl();
                adObject.type = ad.getType();
                groupObject.ads.push(Object.assign({}, adObject));
                //MyLoggerLog("Ad Object:");
                ////MyLoggerLog(adObject.adId);
                //MyLoggerLog(adObject.approval);
                //MyLoggerLog(adObject.d);
                //MyLoggerLog(adObject.h);
                //MyLoggerLog(adObject.status);
                //MyLoggerLog(adObject.type);
                //MyLoggerLog(adObject.url);
            }
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
            campaignObject.adGroups.push(Object.assign({}, groupObject));
            //MyLoggerLog("Group Object:");
            //MyLoggerLog(groupObject)
        }
        // +++++++++++++++++++++++++++++++++++++++++++++++++++
        sendingData.campaigns.push(Object.assign({}, campaignObject));
    }
    //MyLoggerLog(sendingData);

    var resp1 = UrlFetchApp.fetch(
        "https://ancient-harbor-03392.herokuapp.com/api/getreport",
        //"https://df-qszr7af-m5p-git-main-gol-5635c1.vercel.app/api/getreport",
        {
            method: "POST",
            payload: JSON.stringify(sendingData),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    MyLoggerLog(resp1.getContentText("utf-8"));
    MyLoggerLog(resp1.getResponseCode());
}

function isTimeToSend(currentDate) {
    var ddd = Utilities.formatDate(currentDate, "GMT+06", "HH");

    if (ddd == "06") return true;
    if (ddd == "12") return true;
    if (ddd == "18") return true;
    return true;

    //  return false;
}

// --------------------------------------------------------------------------------------------------
function getLangs(campaign, campaignObject) {
    campaignObject.langs = [];
    var langs = campaign.targeting().languages().get();
    while (langs.hasNext()) {
        var lang = langs.next();
        campaignObject.langs.push({ name: lang.getName(), code: lang.getId() });
    }
}
// --------------------------------------------------------------------------------------------------
function getLocations(campaign, campaignObject) {
    campaignObject.locations = [];
    var locs = campaign.targeting().targetedLocations().get();
    while (locs.hasNext()) {
        var loc = locs.next();
        campaignObject.locations.push({
            name: loc.getName(),
            id: loc.getId(),
            code: loc.getCountryCode(),
            targetType: loc.getTargetType(),
            targetingStatus: loc.getTargetingStatus(),
        });
    }
}
// --------------------------------------------------------------------------------------------------
function getExcludedLocations(campaign, campaignObject) {
    campaignObject.exlocations = [];
    var exlocs = campaign.targeting().excludedLocations().get();
    while (exlocs.hasNext()) {
        var exloc = exlocs.next();
        campaignObject.exlocations.push({
            name: loc.getName(),
            id: loc.getId(),
            code: loc.getCountryCode(),
            targetType: loc.getTargetType(),
            targetingStatus: loc.getTargetingStatus(),
        });
    }
}

// --------------------------------------------------------------------------------------------------
function getExcludedContent(campaign, campaignObject) {
    campaignObject.excontents = [];
    var exconts = campaign.targeting().excludedContentLabels().get();
    while (exconts.hasNext()) {
        var excont = exconts.next();
        campaignObject.excontents.push({
            contentLabelType: excont.getContentLabelType(),
            id: excont.getId(),
        });
    }
}

// --------------------------------------------------------------------------------------------------
function getPlatforms(campaign, campaignObject) {
    campaignObject.platforms = [];
    var platfs = campaign.targeting().platforms().get();
    while (platfs.hasNext()) {
        var platf = platfs.next();
        campaignObject.platforms.push({ name: platf.getName(), id: platf.getId() });
    }
}
// --------------------------------------------------------------------------------------------------
function getCTopics(campaign, campaignObject) {
    var cTops = campaign.display().topics().get();
    campaignObject.topics = [];
    while (cTops.hasNext()) {
        var cTop = cTops.next();
        campaignObject.topics.push({
            entityType: cTop.getEntityType(),
            id: cTop.getId(),
            topicId: cTop.getTopicId(),
            isEnabled: cTop.isEnabled(),
        });
    }
}

// --------------------------------------------------------------------------------------------------
function getCExcludedTopics(campaign, campaignObject) {
    var cExTops = campaign.display().excludedTopics().get();
    campaignObject.exTopics = [];
    while (cExTops.hasNext()) {
        var cExTop = cExTops.next();
        campaignObject.exTopics.push({ id: cExTop.getId(), topicId: cExTop.getTopicId() });
    }
}

// --------------------------------------------------------------------------------------------------
function getCPlacements(campaign, campaignObject) {
    var cPlacmnts = campaign.display().placements().get();
    campaignObject.placements += "  Campaigns level: \n";
    while (cPlacmnts.hasNext()) {
        var cPlacmnt = cPlacmnts.next();
        campaignObject.placements += "   - " + cPlacmnt.getUrl() + " : " + cPlacmnt.getId() + "\n";
    }
}

function getCExcludedPlacements(campaign, campaignObject) {
    var cExPlacmnts = campaign.display().excludedPlacements().get();
    campaignObject.exPlacements += "  Campaigns level: \n";
    while (cExPlacmnts.hasNext()) {
        var cExPlacmnt = cExPlacmnts.next();
        campaignObject.exPlacements += "   - " + cExPlacmnt.getUrl() + " : " + cExPlacmnt.getId() + "\n";
    }
}

function getCInfo(campaign, campaignObject) {
    campaignObject.isEnabled = campaign.isEnabled();
    campaignObject.isPaused = campaign.isPaused();
    campaignObject.isRemoved = campaign.isRemoved();

    //campaignObject.isRemoved = campaign.;

    campaignObject.name = campaign.getName();
    campaignObject.campaignId = campaign.getId();
    //campaignObject.campaignClicks = campaign.getStatsFor("ALL_TIME").getClicks();
    //campaignObject.campaignImpressions = campaign.getStatsFor("ALL_TIME").getImpressions();
    //campaignObject.campaignCtr = campaign.getStatsFor("ALL_TIME").getCtr();

    var budget = campaign.getBudget();
    var budgetAmount = budget.getAmount();

    campaignObject.budget = budgetAmount;
}

function getGTopics(group, groupObject) {
    groupObject.topics = [];
    var topics = group.display().topics().get();
    while (topics.hasNext()) {
        var topic = topics.next();
        groupObject.topics.push({
            topicId: topic.getTopicId(),
            id: topic.getId(),
            isEnabled: topic.isEnabled(),
        });
    }
}

function getGExcludedTopics(group, groupObject) {
    var extopics = group.display().excludedTopics().get();
    groupObject.exTopics = [];
    while (extopics.hasNext()) {
        var extopic = extopics.next();
        groupObject.exTopics.push({
            topicId: topic.getTopicId(),
            id: topic.getId(),
            isEnabled: topic.isEnabled(),
        });
    }
}
function getGPlacements(group, groupObject) {
    groupObject.placements = [];
    var plcmnts = group.display().placements().get();
    while (plcmnts.hasNext()) {
        var plcmnt = plcmnts.next();
        groupObject.placements.push({
            url: plcmnt.getUrl(),
            id: plcmnt.getId(),
        });
    }
}
function getGExcludedPlacements(group, groupObject) {
    groupObject.exPlacements = [];
    var explcmnts = group.display().excludedPlacements().get();
    while (explcmnts.hasNext()) {
        var explcmnt = explcmnts.next();
        groupObject.exPlacements.push({
            url: plcmnt.getUrl(),
            id: plcmnt.getId(),
        });
    }
}
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
// FINAL
// -***-*---*-*-*-*-*-*-*-**
function getTasks() {
    var currentAccount = AdsApp.currentAccount();

    var accountName = currentAccount.getName();
    var accountId = currentAccount.getCustomerId();

    var response = UrlFetchApp.fetch("https://ancient-harbor-03392.herokuapp.com/api/tasks/gettasks", {
        //"https://df-qszr7af-m5p-git-main-gol-5635c1.vercel.app/api/tasks/gettasks", {
        method: "POST",
        payload: JSON.stringify({
            accountId: accountId,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    var tasks = JSON.parse(response.getContentText("utf-8"));
    MyLoggerLog(tasks);
    //MyLoggerLog(tasks[0]._id);
    return tasks;
}

function reportTask(report) {
    var response = UrlFetchApp.fetch("https://ancient-harbor-03392.herokuapp.com/api/tasks/setreport", {
        //"https://df-qszr7af-m5p-git-main-gol-5635c1.vercel.app/api/tasks/setreport", {
        method: "POST",
        payload: JSON.stringify(report),
        headers: {
            "Content-Type": "application/json",
        },
    });

    return;
}

function MyLoggerLog(enter) {
    return;
    Logger.log(enter);
}
