function main() {
  // ===========================================================================================
  var samaraSession = "";
  var accountEmail = "";
  
  var user = "nn";
  const day = "15";        // const year = "05"; - ok     bad - const year = "5"; bad - const year = 5;

  const month = "04";       // const year = "04"; - ok     bad - const year = "4"; bad - const year = 4;
  const year = "2021";       // const year = "2021"; - ok     bad - const year = 2021; bad - const year = 21;

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
  const dateOfStartString = year + "-" + month + "-" + day;
  const currentDate = new Date();

  const startDate = Date.parse(dateOfStartString);

  const dateDifference = Number(currentDate) - Number(startDate);
  const diffDays = dateDifference / 1000 / 60 / 60 / 24;

  const checkLimit = 30;
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

  const table = [];
  const row_prefix = {
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

  var campaignIterator = AdsApp.campaigns().withCondition("Status = ENABLED" ).get();
  Logger.log("Total campaigns found : " + campaignIterator.totalNumEntities());
  while (campaignIterator.hasNext()) {
    
    var campaign = campaignIterator.next();

    //const row = Object. row_prefix;
    var row = Object.assign({}, row_prefix);
    var campaignId = campaign.getId();
   

    var budget = campaign.getBudget();
    var budgetAmount = budget.getAmount();

    const id = row.id + "-" + campaignId;
    row.id = accountName + "-" + campaignId;
    // ------------------------------------------
    row.Topics = "Topics: \n";
    row.ExTopics = "Excluded Topics: \n";
    row.Placements = "Placements: \n"
    row.ExPlacements = "Excluded Placements: \n"
    row.adsExpText = "Ads: \n";
    // ------------------------------------------
    
    row.isEnabled = campaign.isEnabled();
    row.campaignName = campaign.getName();
    Logger.log(row.campaignName)
    row.campaignCost = campaign.getStatsFor("ALL_TIME").getCost();
    row.campaignClicks = campaign.getStatsFor("ALL_TIME").getClicks();
    row.campaignImpressions = campaign.getStatsFor("ALL_TIME").getImpressions();
    row.campaignCtr = campaign.getStatsFor("ALL_TIME").getCtr();
    row.budgetAmount = budgetAmount;
    
    
    // ***************************************************
    row.langs = "";
    var langs =  campaign.targeting().languages().get();
    while(langs.hasNext()){
      var lang = langs.next();
      row.langs += lang.getName() + ":" + lang.getId() + "\n";
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    row.locations = "";
    var locs =  campaign.targeting().targetedLocations().get();
    while(locs.hasNext()){
      var loc = locs.next();
      row.locations += loc.getName() + " : " + loc.getId() + " : " + loc.getCountryCode() + " : " + loc.getTargetType() + " : " + loc.getTargetingStatus()  + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    row.exlocations = "";
    var exlocs =  campaign.targeting().excludedLocations().get();
    while(exlocs.hasNext()){
      var exloc = exlocs.next();
      row.exlocations += exloc.getName() + " : " + exloc.getId() + " : " + exloc.getCountryCode() + " : " + exloc.getTargetType() + " : " + exloc.getTargetingStatus()  + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    row.excontents = "";
    var exconts =  campaign.targeting().excludedContentLabels().get();
    while(exconts.hasNext()){
      var excont = exconts.next();
      row.excontents += excont.getContentLabelType() + " : " + exloc.getId() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    row.platforms = "";
    var platfs =  campaign.targeting().platforms().get();
    while(platfs.hasNext()){
      var platf = platfs.next();
      row.platforms += platf.getName() + " : " + platf.getId() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    
    var cTops =  campaign.display().topics().get();
    row.Topics += "  Campaigns level: \n" 
    while(cTops.hasNext()){
      var cTop = cTops.next();
      row.Topics += "   - " + cTop.getEntityType() + " : " + cTop.getId() + " : " + cTop.getTopicId() + " : " + cTop.isEnabled() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    
    var cExTops =  campaign.display().excludedTopics().get();
    row.ExTopics += "  Campaigns level: \n" 
    while(cExTops.hasNext()){
      var cExTop = cExTops.next();
      row.ExTopics += "   - " + cExTop.getId() + " : " + cExTop.getTopicId() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
       
    // ***************************************************
    
    var cPlacmnts =  campaign.display().excludedPlacements().get();
    row.Placements = "  Campaigns level: \n" 
    while(cPlacmnts.hasNext()){
      var cPlacmnt = cPlacmnts.next();
      row.Placements += "   - " + cPlacmnt.getUrl() + " : " + cPlacmnt.getId() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    // ***************************************************
    
    var cExPlacmnts =  campaign.display().excludedPlacements().get();
    row.ExPlacements = "  Campaigns level: \n" 
    while(cExPlacmnts.hasNext()){
      var cExPlacmnt = cExPlacmnts.next();
      row.ExPlacements += "   - " + cExPlacmnt.getUrl() + " : " + cExPlacmnt.getId() + "\n" ;
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // ***************************************************
    var groups =  campaign.adGroups().get();
    while(groups.hasNext()){
      var group = groups.next();
      const gName = group.getName();
      row.Topics += "  " + gName + "\n";
      row.ExTopics += "  " + gName + "\n";
      row.Placements += "  " + gName + "\n";
      row.ExPlacements += "  " + gName + "\n";
      row.adsExpText += "  " + gName + "\n";
      
      // ----------------------------------------------------------------
      const topics = group.display().topics().get();
      while(topics.hasNext()){
        var topic = topics.next();
        row.Topics += "   - " + topic.getTopicId() + " : " + topic.getId() + " : " + topic.isEnabled() + "\n";
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
      // ----------------------------------------------------------------
      const extopics = group.display().excludedTopics().get();
      while(extopics.hasNext()){
        var extopic = extopics.next();
        row.ExTopics += "   - "  + extopic.getTopicId() + " : " + extopic.getId() + " : " + extopic.isEnabled() + "\n";
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
      // ----------------------------------------------------------------
      const plcmnts = group.display().placements().get();
      while(plcmnts.hasNext()){
        var plcmnt = plcmnts.next();
        row.Placements += "   - " + plcmnt.getUrl() + " : " + plcmnt.getId() + "\n";
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
      // ----------------------------------------------------------------
      const explcmnts = group.display().excludedPlacements().get();
      while(explcmnts.hasNext()){
        var explcmnt = explcmnts.next();
        row.ExPlacements += "   - "  + explcmnt.getUrl() + " : " + explcmnt.getId() + "\n";
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
      // ----------------------------------------------------------------
      const ads = group.ads().get();
      while(ads.hasNext()){
        var ad = ads.next();
        if(ad.isType().expandedTextAd()){
          var expandedTextAd = ad.asType().expandedTextAd();
          var headlinePart1 = expandedTextAd.getHeadlinePart1();
          
          row.adsExpText += "   - "  
            + expandedTextAd.getHeadlinePart1() + " : " 
            + expandedTextAd.getHeadlinePart2() + " : " 
            + expandedTextAd.getHeadlinePart3() + " : " 
            + ad.getDescription1() + " : " 
            + ad.getDescription2() + " : " 
            + ad.urls().getFinalUrl() + " : " 
            + ad.getType() + "\n";
          
        }
      }
      // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++
    Logger.log(row.adsExpText );
    Logger.log(row.ExPlacements);
    table.push(Object.assign({}, row));
  }
  return;
  UrlFetchApp.fetch(
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
}

function isTimeToSend(currentDate) {
  var ddd = Utilities.formatDate(currentDate, "GMT+06", "HH");

  if (ddd == "06") return true;
  if (ddd == "12") return true;
  if (ddd == "18") return true;

  return false;
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
