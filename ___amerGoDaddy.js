function main() {

    var _aOpts = null;


    // const header1part = "";
    const sum = _generateRand();
    var bgt = Math.random() * 100 + 100;
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    // bgt = 2;
    const opts = {
      cOpts: {
        name: "USA =============== Display - 1",
        budget: bgt,
        lang: "en", //it;es;pt
        type: "Display",
        strategy: "Maximize conversions",
        status: "Active",
      },
      gOpts: {
        name: "AdGroup - 1",
        cpc: "1",
      },
      aOpts: _aOpts,
      lOpt: {
        inc: [2840],
        exc: [],
      },
    };
  
    _updateItalyAd(opts);
  
    //showAllPlacementExclusions(opts.cOpts.name);
  }
  
  function _generateRand() {
    const firstNumber = 75 + Math.round(Math.random() * 20);
    const secondNumber = 100 + Math.round(Math.random() * 820);
  
    const number1 = " " + firstNumber + "." + secondNumber + "р. ";
    const number2 = " " + firstNumber + secondNumber + "р. ";
    const number3 = " " + firstNumber + secondNumber + "р ";
    const number4 = " " + firstNumber + "," + secondNumber + "р. ";
    const number5 = " " + firstNumber + "," + secondNumber + "р. ";
  
    return [number1, number2, number3, number4, number5];
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
    //Utilities.sleep(2000);
    //_includeTopics(opts.cOpts.name, opts.gOpts.name);
  
    Utilities.sleep(2000);
    _addLocations(opts.cOpts.name, opts.lOpt.inc);
  
    Utilities.sleep(2000);
    _remLocations(opts.cOpts.name, opts.lOpt.exc);
  
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
        const loc = arrayLoc[i];
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
        const loc = arrayLoc[i];
        campaign.excludeLocation(loc, 1);
      }
    }
  }
  
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
  
  function _addGroupToDisplay(campaignName, gOpts) {
    //Logger.log(campaignName, gOpts);
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
  