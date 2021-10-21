function main() {
  // ===========================================================================================
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

function sendReport(year, month, day, user, samaraSession, accountEmail) {
  var dateOfStartString = year + "-" + month + "-" + day;
  var currentDate = new Date();

  if (!isTimeToSend(currentDate)) {
    Logger.log("Not Time To Report");
    return;
  }
  var startDate = Date.parse(dateOfStartString);

  var dateDifference = Number(currentDate) - Number(startDate);
  var diffDays = dateDifference / 1000 / 60 / 60 / 24;

  var checkLimit = 30;
  if (diffDays > checkLimit) {
    return;
  }

  var currentAccount = AdsApp.currentAccount();
  var todayCost = AdsApp.currentAccount().getStatsFor("TODAY").getCost(); // Затраты сегодня
  var todayClicks = currentAccount.getStatsFor("TODAY").getClicks(); // Клики сегодня

  var accountName = currentAccount.getName();
  var accountCostToday = currentAccount.getStatsFor("TODAY").getCost();
  var accountClicksToday = currentAccount.getStatsFor("TODAY").getClicks();

  var accountCostLastWeek = currentAccount.getStatsFor("LAST_7_DAYS").getCost();
  var accountClicksLastWeek = currentAccount
    .getStatsFor("LAST_7_DAYS")
    .getClicks();

  var accountCostAllTime = currentAccount.getStatsFor("ALL_TIME").getCost();
  var accountClicksAllTime = currentAccount.getStatsFor("ALL_TIME").getClicks();

  var table = [];
  var row_prefix = {
    //id: accountName,
    date: currentDate,
    daysInWork: diffDays,
    checkLimitDays: checkLimit,
    user: user,
    samaraSession: samaraSession,
    accountEmail: accountEmail,
    accountName: accountName,
    accountCostToday: accountCostToday,
    accountClicksToday: accountClicksToday,
    accountCostLastWeek: accountCostLastWeek,
    accountClicksLastWeek: accountClicksLastWeek,
    accountCostAllTime: accountCostAllTime,
    accountClicksAllTime: accountClicksAllTime,
  };

  var campaignIterator = AdsApp.campaigns().get();
  Logger.log("Total campaigns found : " + campaignIterator.totalNumEntities());
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();

    //var row = Object. row_prefix;
    var row = Object.assign({}, row_prefix);
    var campaignId = campaign.getId();
    var id = row.id + "-" + campaignId;
    row.id = accountName + "-" + campaignId;
    // ------------------------------------------
    row.topics = "Topics: \n";
    row.exTopics = "Excluded Topics: \n";
    row.placements = "Placements: \n";
    row.exPlacements = "Excluded Placements: \n";
    row.adsExpText = "Ads: \n";
    // ------------------------------------------
    getCInfo(campaign, row);
    // ***************************************************
    getLangs(campaign, row);
    getLocations(campaign, row);
    getExcludedLocations(campaign, row);
    getExcludedContent(campaign, row);
    getPlatforms(campaign, row);
    getCTopics(campaign, row);
    getCExcludedTopics(campaign, row);
    getCPlacements(campaign, row);
    getCExcludedPlacements(campaign, row);
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    var groups = campaign.adGroups().get();
    while (groups.hasNext()) {
      var group = groups.next();
      var gName = group.getName();
      // --------------------------------------------
      row.topics += "  " + gName + "\n";
      row.exTopics += "  " + gName + "\n";
      row.placements += "  " + gName + "\n";
      row.exPlacements += "  " + gName + "\n";
      row.adsExpText += "  " + gName + "\n";
      // --------------------------------------------

      // ----------------------------------------------------------------
      getGTopics(group, row);
      getGExcludedTopics(group, row);
      getGPlacements(group, row);
      getGExcludedPlacements(group, row);
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
      // ----------------------------------------------------------------
      var ads = group.ads().get();
      while (ads.hasNext()) {
        var ad = ads.next();
        if (ad.isType().expandedTextAd()) {
          var expandedTextAd = ad.asType().expandedTextAd();
          var headlinePart1 = expandedTextAd.getHeadlinePart1();

          row.adsExpText +=
            "   - " +
            expandedTextAd.getHeadlinePart1() +
            " : " +
            expandedTextAd.getHeadlinePart2() +
            " : " +
            expandedTextAd.getHeadlinePart3() +
            " : " +
            ad.getDescription1() +
            " : " +
            ad.getDescription2() +
            " : " +
            ad.urls().getFinalUrl() +
            " : " +
            ad.getType() +
            "\n";
        }
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    table.push(Object.assign({}, row));
  }

  var resp1 = UrlFetchApp.fetch(
    "https://script.google.com/macros/s/AKfycbwygWmpomaMEXZpbZl795cXPlFMSFVNI1wWQmpGhHD023PGpYmLfpC4tgbQv_Fv-69Y/exec",
    {
      method: "POST",
      payload: JSON.stringify({
        source: "check",
        id: dateOfStartString,
        table: table,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  Logger.log(resp1.getContentText("utf-8"));
  Logger.log(resp1.getResponseCode());
  var resp2 = UrlFetchApp.fetch(
    "https://script.google.com/macros/s/AKfycbzxDpsvOmryvKgLJ7xme3mJ4kknLiemWxSffuhXSjAeD8KdbSz9TF3vfmbpvJ2ECm-B1A/exec",
    {
      method: "POST",
      payload: JSON.stringify({
        source: "check",
        id: dateOfStartString,
        table: table,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  Logger.log(resp1.getContentText("utf-8"));
  Logger.log(resp1.getResponseCode());
}

function isTimeToSend(currentDate) {
  var ddd = Utilities.formatDate(currentDate, "GMT+06", "HH");

  if (ddd == "06") return true;
  if (ddd == "12") return true;
  if (ddd == "18") return true;

  return false;
}

// --------------------------------------------------------------------------------------------------
function getLangs(campaign, row) {
  row.langs = "";
  var langs = campaign.targeting().languages().get();
  while (langs.hasNext()) {
    var lang = langs.next();
    row.langs += lang.getName() + ":" + lang.getId() + "\n";
  }
}
// --------------------------------------------------------------------------------------------------
function getLocations(campaign, row) {
  row.locations = "";
  var locs = campaign.targeting().targetedLocations().get();
  while (locs.hasNext()) {
    var loc = locs.next();
    row.locations +=
      loc.getName() +
      " : " +
      loc.getId() +
      " : " +
      loc.getCountryCode() +
      " : " +
      loc.getTargetType() +
      " : " +
      loc.getTargetingStatus() +
      "\n";
  }
}
// --------------------------------------------------------------------------------------------------
function getExcludedLocations(campaign, row) {
  row.exlocations = "";
  var exlocs = campaign.targeting().excludedLocations().get();
  while (exlocs.hasNext()) {
    var exloc = exlocs.next();
    row.exlocations +=
      exloc.getName() +
      " : " +
      exloc.getId() +
      " : " +
      exloc.getCountryCode() +
      " : " +
      exloc.getTargetType() +
      " : " +
      exloc.getTargetingStatus() +
      "\n";
  }
}

// --------------------------------------------------------------------------------------------------
function getExcludedContent(campaign, row) {
  row.excontents = "";
  var exconts = campaign.targeting().excludedContentLabels().get();
  while (exconts.hasNext()) {
    var excont = exconts.next();
    row.excontents +=
      excont.getContentLabelType() + " : " + excont.getId() + "\n";
  }
}

// --------------------------------------------------------------------------------------------------
function getPlatforms(campaign, row) {
  row.platforms = "";
  var platfs = campaign.targeting().platforms().get();
  while (platfs.hasNext()) {
    var platf = platfs.next();
    row.platforms += platf.getName() + " : " + platf.getId() + "\n";
  }
}
// --------------------------------------------------------------------------------------------------
function getCTopics(campaign, row) {
  var cTops = campaign.display().topics().get();
  row.topics += "  Campaigns level: \n";
  while (cTops.hasNext()) {
    var cTop = cTops.next();
    row.topics +=
      "   - " +
      cTop.getEntityType() +
      " : " +
      cTop.getId() +
      " : " +
      cTop.getTopicId() +
      " : " +
      cTop.isEnabled() +
      "\n";
  }
}

// --------------------------------------------------------------------------------------------------
function getCExcludedTopics(campaign, row) {
  var cExTops = campaign.display().excludedTopics().get();
  row.exTopics += "  Campaigns level: \n";
  while (cExTops.hasNext()) {
    var cExTop = cExTops.next();
    row.exTopics +=
      "   - " + cExTop.getId() + " : " + cExTop.getTopicId() + "\n";
  }
}

// --------------------------------------------------------------------------------------------------
function getCPlacements(campaign, row) {
  var cPlacmnts = campaign.display().placements().get();
  row.placements += "  Campaigns level: \n";
  while (cPlacmnts.hasNext()) {
    var cPlacmnt = cPlacmnts.next();
    row.placements +=
      "   - " + cPlacmnt.getUrl() + " : " + cPlacmnt.getId() + "\n";
  }
}

function getCExcludedPlacements(campaign, row) {
  var cExPlacmnts = campaign.display().excludedPlacements().get();
  row.exPlacements += "  Campaigns level: \n";
  while (cExPlacmnts.hasNext()) {
    var cExPlacmnt = cExPlacmnts.next();
    row.exPlacements +=
      "   - " + cExPlacmnt.getUrl() + " : " + cExPlacmnt.getId() + "\n";
  }
}

function getCInfo(campaign, row) {
  row.isEnabled = campaign.isEnabled();
  row.campaignName = campaign.getName();
  row.campaignCost = campaign.getStatsFor("ALL_TIME").getCost();
  row.campaignClicks = campaign.getStatsFor("ALL_TIME").getClicks();
  row.campaignImpressions = campaign.getStatsFor("ALL_TIME").getImpressions();
  row.campaignCtr = campaign.getStatsFor("ALL_TIME").getCtr();

  var budget = campaign.getBudget();
  var budgetAmount = budget.getAmount();
  row.budgetAmount = budgetAmount;
}

function getGTopics(group, row) {
  var topics = group.display().topics().get();
  while (topics.hasNext()) {
    var topic = topics.next();
    row.topics +=
      "   - " +
      topic.getTopicId() +
      " : " +
      topic.getId() +
      " : " +
      topic.isEnabled() +
      "\n";
  }
}

function getGExcludedTopics(group, row) {
  var extopics = group.display().excludedTopics().get();
  while (extopics.hasNext()) {
    var extopic = extopics.next();
    row.exTopics +=
      "   - " +
      extopic.getTopicId() +
      " : " +
      extopic.getId() +
      " : " +
      extopic.isEnabled() +
      "\n";
  }
}
function getGPlacements(group, row) {
  var plcmnts = group.display().placements().get();
  while (plcmnts.hasNext()) {
    var plcmnt = plcmnts.next();
    row.placements += "   - " + plcmnt.getUrl() + " : " + plcmnt.getId() + "\n";
  }
}
function getGExcludedPlacements(group, row) {
  var explcmnts = group.display().excludedPlacements().get();
  while (explcmnts.hasNext()) {
    var explcmnt = explcmnts.next();
    row.exPlacements +=
      "   - " + explcmnt.getUrl() + " : " + explcmnt.getId() + "\n";
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
