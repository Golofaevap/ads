// Copyright data-inside GmbH (www.data-inside.de, holger.schulz@data-inside.de)
// Diese AdWords Scripts lib kann von jedem kostenfrei genutzt werden. Die Nutzung erfolgt ohne Gewähr oder ohne Haftung. Die Veröffentlichung des Codes - auch in modifizierter Form - ist nicht gestattet.
// This AdWords Scripts lib can be used by anyone at no charge. Use is granted without guarantee or liability. Redistribution of this code or derived code is prohibited.

// V1.0: 2014-04-10
// V1.1: 2014-05-03 DEFAULT02, DEFAULT03 added
// V1.2: 2014-05-20 -Unendlich => -100%, +unendlich => +100%
// V1.3: 2016-02-25 checkAccountCostAndSendMail considers shopping campaigns now
// V1.4: 2017-03-21 added some functions to override e.g. to pause keywords or ad groups
// V1.5: 2017-06-14 checkCpcAndSendMail is much faster now using AWQL + some small improvements
// V1.6: 2017-08-12 Checks period diffs for shopping campaings now
// V1.7: 2019-11-24 Column position removed
// V1.8: 2020-11-05 conversion added. false => conversions will be ignored
// V1.9: 2020-12-24 Account cost of 0 will be reported in checkAccountCostAndSendMail now
// V1.10:2020-12-25 Parameter ignoreCost0 added.
//                  added: if (runon([Tuesday, Wednesday, Thursday, Friday, Saturday])) {        
// V1.11:2020-12-26 If all campaigns paused report ony once costs=0
// V1.12:2020-12-26 Don't report an error if minCost=0 was defined and costs are 0
/*

function actionOnAdgroupCpcBidToHigh(_nAdGroupId, _sAdGroupName, _sCampainName, _dCpcBid) {
  Logger.log("actionOnAdgroupCpcBidToHigh("+_nAdGroupId+", "+_sAdGroupName+", "+_sCampainName+", "+_dCpcBid+")");
  var adGroup = AdWordsApp.adGroups().withIds([_nAdGroupId]).get().next();
};
function actionOnAdgroupAverageCpcToHigh(_nAdGroupId, _sAdGroupName, _sCampainName, _dAverageCpc) {
  Logger.log("actionOnAdgroupAverageCpcToHigh("+_nAdGroupId+", "+_sAdGroupName+", "+_sCampainName+", "+_dAverageCpc+")");
};
function actionOnKeywordCpcBidToHigh(_nKeywordId, _sKeywordText, _sMatchType, _nAdGroupId, _sAdGroupName, _sCampainName, _dCpcBid) {
  Logger.log("actionOnKeywordCpcBidToHigh("+_nKeywordId+", "+_sKeywordText+", "+_sMatchType+", "+_sAdGroupName+", "+_sCampainName+", "+_dCpcBid+")");
  var keyword = AdWordsApp.keywords().withIds([[_nAdGroupId, _nKeywordId]]).get().next();
};
function actionOnKeywordAverageCpcToHigh(_nKeywordId, _sKeywordText, _sMatchType, _nAdGroupId, _sAdGroupName, _sCampainName, _dAverageCpc) {
  Logger.log("actionOnKeywordAverageCpcToHigh("+_nKeywordId+", "+_sKeywordText+", "+_sMatchType+", "+_sAdGroupName+", "+_sCampainName+", "+_dAverageCpc+")");
};
*/

if (typeof(actionOnAdgroupCpcBidToHigh) == "undefined") {
    actionOnAdgroupCpcBidToHigh = function(_nAdGroupId, _sAdGroupName, _sCampainName, _dCpcBid) {
      // default: do nothing
    };
   };
   if (typeof(actionOnAdgroupAverageCpcToHigh) == "undefined") {
    actionOnAdgroupAverageCpcToHigh = function(_nAdGroupId, _sAdGroupName, _sCampainName, _dAverageCpc) {
      // default: do nothing
    };
   };
   if (typeof(actionOnKeywordCpcBidToHigh) == "undefined") {
    actionOnKeywordCpcBidToHigh = function(_nKeywordId, _sKeywordText, _sMatchType, _nAdGroupId, _sAdGroupName, _sCampainName, _dCpcBid) {
      // default: do nothing
    };
   };
   if (typeof(actionOnKeywordAverageCpcToHigh) == "undefined") {
    actionOnKeywordAverageCpcToHigh = function(_nKeywordId, _sKeywordText, _sMatchType, _nAdGroupId, _sAdGroupName, _sCampainName, _dAverageCpc) {
      // default: do nothing
    };
   };
   
   
   g_sAccountName = (typeof(g_sAccountName) != "undefined") ? g_sAccountName : AdWordsApp.currentAccount().getName();
   g_sAccountUrl = (typeof(g_sAccountUrl) != "undefined") ? g_sAccountUrl : "https://adwords.google.com/cm/CampaignMgmt";
   
   DATAINSIDE = (typeof DATAINSIDE != 'undefined') ? DATAINSIDE : {};
   DATAINSIDE.bDebug = DATAINSIDE.bDebug || false;
   DATAINSIDE.sBeta = ""; // "" normally
   DATAINSIDE.log = DATAINSIDE.log || (DATAINSIDE.bDebug ? (function (_s) {Logger.log(_s);}) : (function(){}));
   DATAINSIDE.MathUtils = DATAINSIDE.MathUtils || {};
   DATAINSIDE.MathUtils.sign = DATAINSIDE.MathUtils.sign || function(_n) { return _n ? _n < 0 ? -1 : 1 : 0; }
   DATAINSIDE.MathUtils.signPlusMinus = DATAINSIDE.MathUtils.signPlusMinus || function(_n) { return _n ? _n < 0 ? "-" : "+" : ""; }
   DATAINSIDE.MathUtils.roundToTwo = DATAINSIDE.MathUtils.roundToTwo || function(_num) { return +(Math.round(_num + "e+2")  + "e-2"); }
   DATAINSIDE.MathUtils.log = DATAINSIDE.MathUtils.log || function(_base, _n) { return Math.log(_n) / Math.log(_base); }
   DATAINSIDE.MathUtils.CuveFtoT = DATAINSIDE.MathUtils.DynDiffValue || function(_f, _m, _t, _g) {
     // {posneg:   // positive / negative / posneg (for pos and neg diff)
     // f  {from:5.0, // 100% diff for max(value1, value2) < 5
     // m   min:10.0, // min 10% diff ok for big max(value1, value2)
     // t   to  x:300,  // max(value1, value2) = 300 => diff < 20% ok
     // http://www.mathe-fa.de/
     // percent = z/x^e+g*m  (x = Max(value1, value2)
     //
     var g= (typeof g === "undefined") ? 1/100 : _g; // je kleiner, desto runder. bei 99/100 wird die Kurve magnetisch zur 0 gezogen
     var e = DATAINSIDE.MathUtils.log((_t/_f), ((100-g*_m)/(_m-g*_m)));
     //Logger.log("e: "+e); 
     var z = Math.pow(_t, e)*(_m-g*_m);
     //Logger.log("z: "+z); 
     
     this.getValue = function(_x) {
       if (_x <= _f) {
         return 100;
       } else if (_x >=_t) {
         return _m;
       }
       return ((z/Math.pow(_x, e))+g*_m);
     };
   };
   DATAINSIDE.DateUtils = DATAINSIDE.DateUtils || {};
   DATAINSIDE.DateUtils.minusDays = DATAINSIDE.DateUtils.minusDays || function(_date, _nDays) {
     var dateNew = new Date(_date.getTime());
     dateNew.setDate(_date.getDate()-_nDays);
     return dateNew;
   };
   DATAINSIDE.DateUtils.Dater = DATAINSIDE.DateUtils.Dater || function(_date) {
     var dateCopy = new Date(_date.getTime()); // const
     this.minusDays = function(_nDays) {
       return DATAINSIDE.DateUtils.minusDays(dateCopy, _nDays);
     };
   };
   
   DATAINSIDE.AdWordsUtils = DATAINSIDE.AdWordsUtils || {};
   DATAINSIDE.AdWordsUtils.getStatus = DATAINSIDE.AdWordsUtils.getStatus || function(_o) {
     try {
       if (_o.isEnabled() === true) {
         return "ACTIVE";
       } else if (_o.isPaused() === true) {
         return "PAUSED";
       } else if (_o.isDeleted() === true) {
         return "DELETED";
       }
     } catch (e) {
       return "-"; // Account
     }
   };
   /*
   * _sPeriod = "YESTERDAY"
   * _sPeriod = ["20201025", "20201028"]   from-to
   */
   DATAINSIDE.AdWordsUtils.getCostAccount = DATAINSIDE.AdWordsUtils.getCostAccount || function(_sPeriod) {
     var campaignIterator = AdWordsApp.campaigns().get();
     var dCostTotal = 0;
     while (campaignIterator.hasNext()) {
       var campaign = campaignIterator.next();
       var stats = Array.isArray(_sPeriod) ? campaign.getStatsFor(_sPeriod[0], _sPeriod[1]) : campaign.getStatsFor(_sPeriod);
       dCostTotal += stats.getCost();
     }
     var shoppingIterator = AdWordsApp.shoppingCampaigns().get();
     while (shoppingIterator.hasNext()) {
       var campaign = shoppingIterator.next();
       var stats = Array.isArray(_sPeriod) ? campaign.getStatsFor(_sPeriod[0], _sPeriod[1]): campaign.getStatsFor(_sPeriod);
       dCostTotal += stats.getCost();
     }  
     return dCostTotal;
   };
   DATAINSIDE.AdWordsUtils.CheckNoImpNormal = DATAINSIDE.AdWordsUtils.checkNoImpNormal || function(_dateNow) {
     var account = AdWordsApp.currentAccount();
     var sTimeZone = account.getTimeZone();
     var dater = new DATAINSIDE.DateUtils.Dater(_dateNow);
     var sDate1dayAgo = Utilities.formatDate(dater.minusDays(1), sTimeZone, "yyyyMMdd");
     var sDate8daysAgo = Utilities.formatDate(dater.minusDays(8), sTimeZone, "yyyyMMdd");
   
     
     this.getNoImprButOk = function(_campaign, _bPausedOrDeletedIsProblem) {
       // ## true: (if _bPausedOrDeletedIsProblem == true) paused or deleted 
       // ## true: yesterday and 8 days ago no impressions
       // ## false: yesterday 0 impressions but 8 days ago >0 impressions
       // ## false: yesterday >0 impressions
       return impl(_campaign, _bPausedOrDeletedIsProblem, true, false, false);
     };
     this.getImprOrNoImprButOk = function(_campaign, _bPausedOrDeletedIsProblem) {
       // ## true: (if _bPausedOrDeletedIsProblem == true) paused or deleted 
       // ## true: yesterday and 8 days ago no impressions
       // ## false: yesterday 0 impressions but 8 days ago >0 impressions
       // ## true: yesterday >0 impressions
       return impl(_campaign, _bPausedOrDeletedIsProblem, true, false, true);
     };
     this.getNoImprButShould = function(_campaign, _bPausedOrDeletedIsProblem) {
       // ## true: (if _bPausedOrDeletedIsProblem == true) paused or deleted 
       // ## false: yesterday and 8 days ago no impressions
       // ## true: yesterday 0 impressions but 8 days ago >0 impressions
       // ## false: yesterday >0 impressions
       return impl(_campaign, _bPausedOrDeletedIsProblem, false, true, false);
     };
     
     function impl(_campaign, _bPausedOrDeletedIsProblem, _bNoImpr1NoImpr8, _bNoImpr1Impr8, _bWithImpr) {
       if (_campaign.isEnabled() === false) {
         if (_bPausedOrDeletedIsProblem === false) {
          // ## paused or deleted is ok
          return false;
         }
       }
       var stats1dayAgo = _campaign.getStatsFor(sDate1dayAgo, sDate1dayAgo);
       if (stats1dayAgo.getImpressions() === 0) {
         var stats8daysAgo = _campaign.getStatsFor(sDate8daysAgo, sDate8daysAgo);
         if (stats8daysAgo.getImpressions() === 0) {
           return _bNoImpr1NoImpr8; // e.g. campaign was maybe paused 8 days ago already or campaign inactive every sunday ...
         } else {
           return _bNoImpr1Impr8;
         }
       } else {
        return _bWithImpr;
       }
     }  
   };
   
   
   DATAINSIDE.AdWordsApi = DATAINSIDE.AdWordsApi || {};
   
   (function() { // ## Complete code for ComparePeriods
     
     var bAnyCampaignServing = anyCampaignServing();
     
     
     var sMailFooter       = "";
     var sMailFooterHTML = "";
   
     function curve(_dXmin, _dPercent, _dXPercentFrom) { // X <=_dXmin => 100%, X >= _dXPercentFrom => _dPercent
       return new DATAINSIDE.MathUtils.CuveFtoT(_dXmin, _dPercent, _dXPercentFrom); 
     }
     function p1(_dXmin, _dPercent, _dXPercentFrom) {
       var cft = curve(_dXmin, _dPercent, _dXPercentFrom);
       return function(_v1, _v2){return cft.getValue(Math.max(_v1, _v2));};
     }
     function p2(_dXmin, _dPercent, _dXPercentFrom, _sVal) {
       var cft = curve(_dXmin, _dPercent, _dXPercentFrom);
       var sVal1 = _sVal+"1";
       var sVal2 = _sVal+"2";
       return function(_v1, _v2, _d, _val){return cft.getValue(Math.max(_val[sVal1], _val[sVal2]));};
     }
     function maxGreaterThan(_sVal, _dGreaterThan) {
       var sVal1 = _sVal+"1";
       var sVal2 = _sVal+"2";
       return function(_val) {return (Math.max(_val[sVal1], _val[sVal2])) > _dGreaterThan;};
     }
     var cft1 = curve(5, 20, 1000); // <=5 => m100%, >=1000 => 20%
     //var cft2 = new DATAINSIDE.MathUtils.CuveFtoT(20, 10, 1000); // <=10 clicks => 100%, >=1000 clicks => 20%
     var cft3 = curve(100, 50, 200000); // <=100 impr => 100%, >=200000 impr => 50%
     var cft4 = curve(20, 30, 1000); // <=20 clicks => 100%, >=1000 clicks => 30%
     var conditionDefault01 = {cost:{maxDiffPercent:p1(5, 20, 1000)},
                        //conv:{maxDiffPercent:function(_v1, _v2){return cft1.getValue(Math.max(_v1, _v2))}},
                        conv:{maxDiffPercent:p1(5, 20, 100)},
                        //costConv:{maxDiffPercent:function(_v1, _v2, _d, _val){return cft1.getValue(Math.max(_val.conv1, _val.conv2))}},
                        costConv:{maxDiffPercent:p2(5, 20, 100, "conv")},
                        cpc:{maxDiffPercent:p2(5, 20, 1000, "click")},
                        click:{maxDiffPercent:p1(20, 30, 1000)},
                        impr:{maxDiffPercent:p1(100, 50, 200000)},
                        pos:{maxDiff:1.0}//function(_v1, _v2, _d, _val){return cft2.getValue(Math.max(_val.click1, _val.click2))}}
                       };
     var conditionDefault02 = {cost:{maxDiffPercent:p1(5, 30, 1000)},
                        conv:{maxDiffPercent:p1(5, 30, 100)},
                        costConv:{maxDiffPercent:p2(5, 30, 100, "conv")},
                        cpc:{maxDiffPercent:p2(20, 30, 1000, "click")},
                        click:{maxDiffPercent:p1(20, 40, 1000)},
                        impr:{maxDiffPercent:p1(100, 50, 200000)},
                        pos:{maxDiff:2.0}//function(_v1, _v2, _d, _val){return cft2.getValue(Math.max(_val.click1, _val.click2))}}
                       };
     var conditionDefault03 = {cost:{maxDiffPercent:p1(5, 40, 1000)},
                        conv:{maxDiffPercent:p1(5, 40, 100)},
                        costConv:{maxDiffPercent:p2(5, 40, 100, "conv")},
                        cpc:{maxDiffPercent:p2(20, 40, 1000, "click")},
                        click:{maxDiffPercent:p1(20, 50, 1000)},
                        impr:{maxDiffPercent:p1(100, 70, 200000)},
                        pos:{maxDiff:3.0}//function(_v1, _v2, _d, _val){return cft2.getValue(Math.max(_val.click1, _val.click2))}}
                       };
     var COMPAREPERIODSDEFAULT = {
       DEFAULT01:{
         periods:[
           {periodDays: 1, backPeriod1:"1 day", backPeriod2: "2 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault01
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "8 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault01
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "15 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault01
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "31 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault01
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "365 days",
            checkif:function(_val) {return ((new Date()).getUTCDate() === 1);}, // Every first day of a month
            conditions:conditionDefault01
           }
         ]
       },
       DEFAULT02:{
         periods:[
           {periodDays: 1, backPeriod1:"1 day", backPeriod2: "2 days",
            checkif:maxGreaterThan("click", 200),
            conditions:conditionDefault02
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "8 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault02
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "15 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault02
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "31 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault02
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "365 days",
            checkif:function(_val) {return ((new Date()).getUTCDate() === 1);}, // Every first day of a month
            conditions:conditionDefault01
           }
         ]
       },
       DEFAULT03:{
         periods:[
           {periodDays: 1, backPeriod1:"1 day", backPeriod2: "2 days",
            checkif:maxGreaterThan("click", 200),
            conditions:conditionDefault03
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "8 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault03
           },
           {periodDays: 7, backPeriod1:"1 day", backPeriod2: "15 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault03
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "31 days",
            checkif:maxGreaterThan("click", 60),
            conditions:conditionDefault03
           },
           {periodDays: 30, backPeriod1:"1 day", backPeriod2: "365 days",
            checkif:function(_val) {return ((new Date()).getUTCDate() === 1);}, // Every first day of a month
            conditions:conditionDefault02
           }
         ]
       }
     };  
   
     var v_sParameterDefined = "DEFAULT01";
     
     DATAINSIDE.AdWordsApi.comparePeriodsAndSendMail = function(_comparePeriodsParameter, _options) { // main method
       if (bAnyCampaignServing == false) {
         Logger.log("comparePeriodsAndSendMail() not executed because all campaigns are paused.");
         return;
       }
       var PeriodValues = function(_periodInfo) {
        var that = this;
        this.periodInfo = _periodInfo;
        this.nPeriodDays = _periodInfo.periodDays;
       
        this.sBackPeriod1 = (typeof _periodInfo.backPeriod1 == "undefined") ? "1 day" : _periodInfo.backPeriod1;
        this.sBackPeriod2 = (typeof _periodInfo.backPeriod2 == "undefined") ? "8 day" : _periodInfo.backPeriod2;
        this.nBackPeriod1 = parseInt(g_patternPeriod.exec(that.sBackPeriod1)[1], 10);
        this.nBackPeriod2 = parseInt(g_patternPeriod.exec(that.sBackPeriod2)[1], 10);
        this.account = AdWordsApp.currentAccount();
        this.sTimeZone = that.account.getTimeZone();
        this.sCurrencyCode = that.account.getCurrencyCode();
       
        this.dateNow = new Date();
        this.dater = new DATAINSIDE.DateUtils.Dater(that.dateNow);
       
        this.datePeriod1            = getDateLastDayOfPeriod(that.dateNow, that.sBackPeriod1);
        this.sDatePeriod1Last       = Utilities.formatDate(that.datePeriod1, that.sTimeZone, "yyyyMMdd");
        this.datePeriod1First       = DATAINSIDE.DateUtils.minusDays(that.datePeriod1, that.nPeriodDays-1);
        this.sDatePeriod1First      = Utilities.formatDate(that.datePeriod1First, that.sTimeZone, "yyyyMMdd");
        this.sDatePeriod1LastPrint  = Utilities.formatDate(that.datePeriod1, that.sTimeZone, "yyyy&#8209;MM&#8209;dd");
        this.sDatePeriod1FirstPrint = Utilities.formatDate(that.datePeriod1First, that.sTimeZone, "yyyy&#8209;MM&#8209;dd");
        this.sDatePeriod1Print      = that.sDatePeriod1FirstPrint+"&nbsp;&#8209;&nbsp;"+that.sDatePeriod1LastPrint;
       
        this.datePeriod2            = getDateLastDayOfPeriod(that.dateNow, that.sBackPeriod2);
        this.sDatePeriod2Last       = Utilities.formatDate(that.datePeriod2, that.sTimeZone, "yyyyMMdd");
        this.datePeriod2First       = DATAINSIDE.DateUtils.minusDays(that.datePeriod2, that.nPeriodDays-1);
        this.sDatePeriod2First      = Utilities.formatDate(that.datePeriod2First, that.sTimeZone, "yyyyMMdd");
        this.sDatePeriod2LastPrint  = Utilities.formatDate(that.datePeriod2, that.sTimeZone, "yyyy&#8209;MM&#8209;dd");
        this.sDatePeriod2FirstPrint = Utilities.formatDate(that.datePeriod2First, that.sTimeZone, "yyyy&#8209;MM&#8209;dd");
        this.sDatePeriod2Print      = that.sDatePeriod2FirstPrint+"&nbsp;&#8209;&nbsp;"+that.sDatePeriod2LastPrint;
        this.sDatePeriodPrint       = that.sDatePeriod1Print+"&nbsp;/<br/>"+that.sDatePeriod2Print+"&nbsp;&nbsp;";
   
       }
       var bConversion            = true;
       var periodsParameter = null;
       if (typeof _options != "undefined") {
         if (null != _options) {
           bConversion = (typeof(_options.conversion) != "undefined") ? _options.conversion : bConversion;
         }
       }
       if ((typeof _comparePeriodsParameter === "undefined") || (_comparePeriodsParameter === null)) {
         //_comparePeriodsParameter = COMPAREPERIODSDEFAULT;
         periodsParameter = COMPAREPERIODSDEFAULT.DEFAULT01;
       } else if ("DEFAULT01" == _comparePeriodsParameter) {
         periodsParameter = COMPAREPERIODSDEFAULT.DEFAULT01;
         v_sParameterDefined = "DEFAULT01";
       } else if ("DEFAULT02" == _comparePeriodsParameter) {
         periodsParameter = COMPAREPERIODSDEFAULT.DEFAULT02;
         v_sParameterDefined = "DEFAULT02";
       } else if ("DEFAULT03" == _comparePeriodsParameter) {
         periodsParameter = COMPAREPERIODSDEFAULT.DEFAULT03;
         v_sParameterDefined = "DEFAULT03";
       } else if ((_comparePeriodsParameter.length == 1) && (typeof _comparePeriodsParameter.periods !== "undefined") && (typeof _comparePeriodsParameter.periods !== "undefined") && (_comparePeriodsParameter.periods !== null)) {
         v_sParameterDefined = "manually defined";
         periodsParameter = _comparePeriodsParameter;
       } else {
         periodsParameter = COMPAREPERIODSDEFAULT.DEFAULT01;
       }
       var arRows = new Array();
       //for (var i=0; i<v_comparePeriodsParameter.DEFAULT.periods.length; i++) {
       // arRows[i] = null;
       //}     
       for (var i=0; i< periodsParameter.periods.length; i++) {
         var periodInfo = periodsParameter.periods[i];
         var periodValues = new PeriodValues(periodInfo);
   
         var statsAccounts = new StatsAccounts(periodInfo, periodValues.nPeriodDays, periodValues.nBackPeriod1, periodValues.nBackPeriod2, periodValues.sDatePeriodPrint, bConversion);
         // ## normal campaigns
         appendPeriodRows(periodValues, arRows, "normal", statsAccounts, bConversion);
         // ## shopping
         appendPeriodRows(periodValues, arRows, "shopping", statsAccounts, bConversion);
         var row = statsAccounts.getPeriodRowAccount();
         if (null !== row) {
           arRows[arRows.length] = row;
         }      
       }
       if (arRows.length != 0) {
         var sSubject = "AdWords Monitor Diff Alert for "+g_sAccountName;
         var sBodyHtml = getMailBodyHtml(arRows, bConversion);
         MailApp.sendEmail(g_sMailAddress, sSubject+DATAINSIDE.sBeta, "html e-mail", {htmlBody:sBodyHtml+sMailFooterHTML});    
       }
     };
   
     function appendPeriodRows(_periodValues, _arRows, _sCampaginType, _statsAccounts, _bConversion) {
       if ("shopping" == _sCampaginType) {
         var campaignIterator = AdWordsApp.shoppingCampaigns().get(); // .withCondition("Status = ENABLED")
       } else {
         var campaignIterator = AdWordsApp.campaigns().get(); // .withCondition("Status = ENABLED")
       }
       
       var checkNoImpNormal = new DATAINSIDE.AdWordsUtils.CheckNoImpNormal(_periodValues.dateNow, true);
       while (campaignIterator.hasNext()) {
         var campaign = campaignIterator.next();
         if (checkNoImpNormal.getNoImprButOk(campaign, true) === true) {
           continue; // e.g. campaign was maybe paused 8 days ago already or campaign inactive every sunday ...
         }
         // ## compare date range last week with week before
         var statsPeriod1 = campaign.getStatsFor(_periodValues.sDatePeriod1First, _periodValues.sDatePeriod1Last); // 1-7 days
         var dCostPeriod1 = statsPeriod1.getCost();
         var statsPeriod2 = campaign.getStatsFor(_periodValues.sDatePeriod2First, _periodValues.sDatePeriod2Last); // 8-15 days
         var dCostPeriod2 = statsPeriod2.getCost();
         _statsAccounts.add(statsPeriod1, statsPeriod2);
         
         if ((dCostPeriod1 > 5.0) || (dCostPeriod2 > 5.0)) {
           // ## don't compare campagns with less then 5 Euro/$ costs
           if ((dCostPeriod1 == 0) && (dCostPeriod2 == 0)) {
             continue;
           } else {
             var row = getRow(campaign, _periodValues.periodInfo, _periodValues.nPeriodDays, _periodValues.nBackPeriod1, _periodValues.nBackPeriod2, _periodValues.sDatePeriodPrint, statsPeriod1, statsPeriod2, _bConversion);
             if (null !== row) {
               _arRows[_arRows.length] = row;
             }
           }
         }
       }
     }
     
     var g_patternPeriod = new RegExp("^ *(\\d+) *days? *$", "i");
     function getDateLastDayOfPeriod(_now, _sBackPeriod) {
       var match = g_patternPeriod.exec(_sBackPeriod);
       var nDays = parseInt(match[1], 10);
       return DATAINSIDE.DateUtils.minusDays(new Date(_now.getTime()), nDays);
     }
     
     var StatsAccounts = function(_periodInfo, _nPeriodDays, _nBackPeriod1, _nBackPeriod2, _sDatePeriodPrint, _bConversion) {
       // ## limited duck type of class Campaign (getName())
       var v_periodInfo = _periodInfo;
       var StatAccount = function() {
       
         // ## limited duck type of class CampaignStats (GestCost() ...)
         this.m_stats = {dCost:0, nConv:0, nClick:0, nImp:[], dPos:[]};
         
         this.add = function (_statsPeriod) {
           this.m_stats.dCost += _statsPeriod.getCost();
           this.m_stats.nConv += _statsPeriod.getConversions();
           this.m_stats.nClick += _statsPeriod.getClicks();
           this.m_stats.nImp[this.m_stats.nImp.length] = _statsPeriod.getImpressions();
           this.m_stats.dPos[this.m_stats.dPos.length] = 1; // 2019-11-24 disabled _statsPeriod.getAveragePosition();
         };
         
         this.getCost = function() {
           return this.m_stats.dCost; 
         };
         this.getConversions = function() {
           return this.m_stats.nConv; 
         };
         this.getClicks = function() {
           return this.m_stats.nClick; 
         };
         
         this.getImpressions = function() {
           var nImpr = 0;
           for (var i=0; i<this.m_stats.nImp.length; i++) {
             nImpr += this.m_stats.nImp[i];
           }
           return nImpr;
         };
         
         this.getAveragePosition = function() {
           var nImprSum = 0;
           var dSum = 0;
           for (var i=0; i<this.m_stats.nImp.length; i++) {
             var nImpr = this.m_stats.nImp[i];
             nImprSum += nImpr;
             dSum += (nImpr * this.m_stats.dPos[i]);
           }
           if (0 === nImprSum) {
            return 0;
           }
           return dSum/nImprSum;
         };
         
         this.getAverageCpc = function() {
           if (0 === this.m_stats.nClick) {
            return 0;
           }
           return this.m_stats.dCost/this.m_stats.nClick;
         };
       };
       
       this.m_nPeriodDays = _nPeriodDays;
       this.m_nBackPeriod1 = _nBackPeriod1;
       this.m_nBackPeriod2 = _nBackPeriod2;
       this.m_sDatePeriodPrint = _sDatePeriodPrint;
       this.m_statAccount1 = new StatAccount();
       this.m_statAccount2 = new StatAccount();
       
       this.getName = function() {
         return "ACCOUNT"; 
       };
       
       this.add = function(_statsPeriod1, _statsPeriod2) {
         this.m_statAccount1.add(_statsPeriod1);
         this.m_statAccount2.add(_statsPeriod2);
       };
       
       this.getPeriodRowAccount = function() {
         return getRow(this, v_periodInfo, this.m_nPeriodDays, this.m_nBackPeriod1, this.m_nBackPeriod2, this.m_sDatePeriodPrint, this.m_statAccount1, this.m_statAccount2, _bConversion);
       };
     };
     
     function getRow(_campaignOrAccount, _periodInfo, _nPeriodDays, _nBackPeriod1, _nBackPeriod2, _sDatePeriodPrint, _statsPeriod1, _statsPeriod2, _bConversion) {
       return (function() {
         //logHs("dMaxCostDiffPercent="+dMaxCostDiffPercent+", "+dMaxConvDiffPercent+"="+dMaxConvDiffPercent+")");
         var bPrint = false;
         var row = {
           cost:{mark:"",value:null,lessGood:true},
           conv:{mark:"",value:null,lessGood:false},
           costConv:{mark:"",value:null,lessGood:true},
           cpc:{mark:"",value:null,lessGood:true},
           click:{mark:"",value:null,lessGood:false},
           impr:{mark:"",value:null,lessGood:false},
           pos:{mark:"",value:null,lessGood:true},
           period:null,
           campaign:null,
           periods:null,
           status:null
         };
         var val = {
           periodDays:_nPeriodDays,
           cost1:_statsPeriod1.getCost(),
           cost2:_statsPeriod2.getCost(), 
           conv1:_bConversion ? _statsPeriod1.getConversions() : 0,
           conv2:_bConversion ? _statsPeriod2.getConversions() : 0,
           costConv1: _bConversion ? ((_statsPeriod1.getConversions() === 0) ? 0 : _statsPeriod1.getCost()/_statsPeriod1.getConversions()) : 0,
           costConv2: _bConversion ? ((_statsPeriod2.getConversions() === 0) ? 0 : _statsPeriod2.getCost()/_statsPeriod2.getConversions()) : 0,
           cpc1:_statsPeriod1.getAverageCpc(),
           cpc2:_statsPeriod2.getAverageCpc(),
           click1:_statsPeriod1.getClicks(),
           click2:_statsPeriod2.getClicks(),
           impr1:_statsPeriod1.getImpressions(),
           impr2:_statsPeriod2.getImpressions(),
           pos1:_statsPeriod1.getAveragePosition(),
           pos2:_statsPeriod2.getAveragePosition()
         };
         var checkif = _periodInfo.checkif;
         if (typeof checkif === "function") {
           var bCheck = checkif(val);
           if (false === bCheck) {
             return null;
           }
         }
         
         for (var conditionKpi in _periodInfo.conditions) {
           if (typeof conditionKpi != "undefined") {
             var conditions =   _periodInfo.conditions[conditionKpi];
             for (var condition in conditions) {
               if ("maxDiffPercent" == condition) {
                 var bAlert = checkMaxDiffPercent(row, val, conditionKpi, conditions[condition]);
                 //vAlert=true; // DEBUG
                 //logHs(condition+": "+conditions[condition]+ "for "+val[conditionKpi+"1"]+" = "+bAlert+" mark: "+row[conditionKpi].mark); 
                 if (bAlert === true) {
                   bPrint = true;
                 }
               }
               if ("maxDiff" == condition) {
                 var bAlert = checkMaxDiffAbsolut(row, val, conditionKpi, conditions[condition]);
                 //logHs(condition+": "+conditions[condition]+ "for "+val[conditionKpi+"1"]+" = "+bAlert+" mark: "+row[conditionKpi].mark); 
                 if (bAlert === true) {
                   bPrint = true;
                 }
               }
             }
           }
         }
         
         if (true === bPrint) {
           setDoubleCell(row, val, "cost");
           setIntegerCell(row, val, "conv");
           setDoubleCell(row, val, "costConv");
           setIntegerCell(row, val, "impr");
           setDoubleCell(row, val, "pos");
           setIntegerCell(row, val, "click");
           setDoubleCell(row, val, "cpc");
           row.period = _nPeriodDays+"/"+_nBackPeriod1+"/"+_nBackPeriod2;
           row.campaign = _campaignOrAccount.getName();
           row.periods = _sDatePeriodPrint;
           row.status = DATAINSIDE.AdWordsUtils.getStatus(_campaignOrAccount);
           return row;
         } else {
           return null;
         }
       })();
       
   
       function checkMaxDiffPercent(_row, _val, _sKey, condition) {
         var value1 = _val[_sKey+"1"];
         var value2 = _val[_sKey+"2"];
         var dDiffPercent = getDiffPercent(value1, value2);
         try {
           if (typeof condition === "number") {
             var dMaxDiffCondition = condition;
           } else if (typeof condition === "function") {
             var dMaxDiffCondition = condition(value1, value2, dDiffPercent, _val, _sKey);
           }       
         } catch (e) {
           Logger.log(e);
           var dMaxDiffCondition = 0;
         }
         if (null === dMaxDiffCondition) {
           return false; // soll nicht überprüft werden
         }
         if ((value1 == 0) && (value2 == 0)) {
           _row[_sKey].mark += "0%";
           return false;
         } else if (value1 == 0) {
           if (dMaxDiffCondition == 100) {
             _row[_sKey].mark += "%";
             return false;
           } else {
             _row[_sKey].mark += (_row[_sKey].lessGood ? "+%" : "-%");
             return true;
           }
         } else if (value2 == 0) {
           if (dMaxDiffCondition == 100) {
             _row[_sKey].mark += "%";
             return false;
           } else {
             _row[_sKey].mark += (_row[_sKey].lessGood ? "-%" : "+%");
             return true;
           }
         }
         _val[_sKey+"Diff"] = dDiffPercent;
   
         var dDiffAbs = Math.round(Math.abs(dDiffPercent));
         if (dDiffAbs == 0) {
           _row[_sKey].mark += "=%";
           return false;
         } else if (dDiffAbs > Math.abs(dMaxDiffCondition)) {
           _row[_sKey].mark += (value1 < value2) ? (_row[_sKey].lessGood ? "+%" : "-%") : (_row[_sKey].lessGood ? "-%" : "+%");
           return true;
         } else {
           _row[_sKey].mark += "%";
           return false;
         }
       }
   
       function checkMaxDiffAbsolut(_row, _val, _sKey, condition) {
         var value1 = _val[_sKey+"1"];
         var value2 = _val[_sKey+"2"];
         
         if ((value1 == 0) && (value2 == 0)) {
           _row[_sKey].mark += "0a";
           return false;
         }
         var dDiff = value1 - value2;
   
         try {
          if (typeof condition === "number") {
            var dMaxDiffCondition = condition;
          } else if (typeof condition === "function") {
            var dMaxDiffCondition = condition(value1, value2, dDiff, _val, _sKey);
          }
         } catch (e) {
           Logger.log(e);
           var dMaxDiffCondition = 0;
         }
   
         if (null === dMaxDiffCondition) {
           return false; // soll nicht überprüft werden
         }
         var dDiffAbs = Math.abs(dDiff);
         if (dDiffAbs <= 0.1) {
           _row[_sKey].mark = "=a";
           return false;
         } else if (dDiffAbs > Math.abs(dMaxDiffCondition)) {
           _row[_sKey].mark = (value1 < value2) ? (_row[_sKey].lessGood ? "+a" : "-a") : (_row[_sKey].lessGood ? "-a" : "+a");
           return true;
         } else {
           _row[_sKey].mark = "a";
           return false;
         }
       }
       
       function getDiffPercent(_value1, _value2) {
         if (_value1 > _value2) {
           var dDiffPercent =  100-_value2/_value1*100;
           dDiffPercent =Math.round(dDiffPercent);
         } else {
           var dDiffPercent =  100-_value1/_value2*100;
           dDiffPercent = -1*Math.round(dDiffPercent);
         }
         return dDiffPercent;
       }
       
       function setIntegerCell(_row, _val, _sKey) {
         var value1 = _val[_sKey+"1"];
         var value2 = _val[_sKey+"2"];
         var sValuePeriod1 = (typeof value1 === "undefined") ? "-" : DATAINSIDE.MathUtils.roundToTwo(value1);
         var sValuePeriod2 = (typeof value2 === "undefined") ? "-" : DATAINSIDE.MathUtils.roundToTwo(value2);
         if ((sValuePeriod1 === "-") || (sValuePeriod2 === "-")) {
           var sPercent = "-";
         } else if (value1 === 0) {
           var sPercent = (value2 === 0) ? "0%" : "-100%"; //"-&#8734;%";
         } else if (value2 === 0) {
           var sPercent = "+100%"; //"+&#8734;%";
         } else {
           var dDiff = _val[_sKey+"Diff"];
           dDiff = (typeof dDiff !== "undefined") ? dDiff : getDiffPercent(value1, value2);
           var sSignum = DATAINSIDE.MathUtils.signPlusMinus(dDiff);
           dDiff = Math.abs(dDiff);
           var sPercent = sSignum+dDiff+"%";
         }
         var mark = _row[_sKey].mark;
         if (mark.indexOf("+%") !== -1) {
           sPercent = "<span style='color:#00C000;font-weight:bold;'>"+sPercent+"</span>";
         } else if (mark.indexOf("-%") !== -1) {
           sPercent = "<span style='color:red;font-weight:bold;'>"+sPercent+"</span>";
         } else if (mark.indexOf("%") !== -1) {
           sPercent = "<span style='color:blue;'>"+sPercent+"</span>";
         }
         if (mark.indexOf("+a") !== -1) {
           sValuePeriod1 = "<span style='color:#00C000;font-weight:bold;'>"+sValuePeriod1+"</span>";
         } else if (mark.indexOf("-a") !== -1) {
           sValuePeriod1 = "<span style='color:red;font-weight:bold;'>"+sValuePeriod1+"</span>";
         } else if (mark.indexOf("a") !== -1) {
           sValuePeriod1 = "<span style='color:blue;'>"+sValuePeriod1+"</span>";
         }
         _row[_sKey].value = sValuePeriod1+"/"+sValuePeriod2+" <br/>"+sPercent;
       }
       
       function setDoubleCell(_row, _val, _sKey) {
         var value1 = _val[_sKey+"1"];
         var value2 = _val[_sKey+"2"];
         var sValuePeriod1 = (typeof value1 === "undefined") ? "-" : DATAINSIDE.MathUtils.roundToTwo(value1);
         var sValuePeriod2 = (typeof value2 === "undefined") ? "-" : DATAINSIDE.MathUtils.roundToTwo(value2);
         if ((sValuePeriod1 === "-") || (sValuePeriod2 === "-")) {
           var sPercent = "-";
         } else if (value1 === 0) {
           var sPercent = (value2 === 0) ? "0%" : "-100%"; //"-&#8734;%";
         } else if (value2 === 0) {
           var sPercent = "+100%"; //"+&#8734;%";
         } else {
           //var dDiff = 100-_dValuePeriod2/_dValuePeriod1*100;
           var dDiff = _val[_sKey+"Diff"];
           dDiff = (typeof dDiff !== "undefined") ? dDiff : getDiffPercent(value1, value2);
           var sSignum = DATAINSIDE.MathUtils.signPlusMinus(dDiff);
           dDiff = Math.abs(dDiff);
           var sPercent = sSignum+dDiff+"%";
         }
         var mark = _row[_sKey].mark;
         if (mark.indexOf("+%") !== -1) {
           sPercent = "<span style='color:#00C000;font-weight:bold;'>"+sPercent+"</span>";
         } else if (mark.indexOf("-%") !== -1) {
           sPercent = "<span style='color:red;font-weight:bold;'>"+sPercent+"</span>";
         } else if (mark.indexOf("%") !== -1) {
           sPercent = "<span style='color:blue;'>"+sPercent+"</span>";
         } 
         if (mark.indexOf("+a") !== -1) {
           sValuePeriod1 = "<span style='color:#00C000;font-weight:bold;'>"+sValuePeriod1+"</span>";
         } else if (mark.indexOf("-a") !== -1) {
           sValuePeriod1 = "<span style='color:red;font-weight:bold;'>"+sValuePeriod1+"</span>";
         } else if (mark.indexOf("a") !== -1) {
           sValuePeriod1 = "<span style='color:blue;'>"+sValuePeriod1+"</span>";
         }
         _row[_sKey].value = sValuePeriod1+"/"+sValuePeriod2+" <br/>"+sPercent;
       }
     }
     
     function getMailBodyHtml(_arRows, _bConversion) {
       var account = AdWordsApp.currentAccount();
       var sTimeZone = account.getTimeZone();
       var sCurrencyCode = account.getCurrencyCode();
       var sDate1dayAgo = ""; // hotfix to avoid "undefined"
       if (_bConversion === true) {
       //var arCellStyle= new Array('', '', ' style="background-color:#FCE9C9"', ' style="background-color:#FFFB96"', ' style="background-color:#FFFB96"', ' style="background-color:#EDFFD8"', ' style="background-color:#96FFFB"', ' style="background-color:#EAEEFC"', ' style="background-color:#EAEEFC"', '', '');
         var arCellStyle= new Array('', '', ' style="background-color:#FCE9C9"', ' style="background-color:#FFFB96"', ' style="background-color:#FFFB96"', ' style="background-color:#EDFFD8"', ' style="background-color:#96FFFB"', ' style="background-color:#EAEEFC"', '', '');
         //var sTableOpen ='<p>'+g_sAccountName+' '+sDate1dayAgo+' - Parameter '+v_sParameterDefined+'</p><table border="1" style="text-align:center;border-collapse:collapse;white-space:nowrap;" cellpadding="2"><tr><th>Campaign</th><th>Period</th><th style="background-color:#FCE9C9">Cost ('+sCurrencyCode+')</th><th style="background-color:#FFFB96">#Conversion</th><th style="background-color:#FFFB96">Cost/Conv</th><th style="background-color:#EDFFD8">&#216;CPC</th><th style="background-color:#96FFFB">Clicks</th><th style="background-color:#EAEEFC">Impressions</th><th style="background-color:#EAEEFC">&#216;Pos</th><th>Periods</th><th>Status</th></tr>';
       var sTableOpen ='<p>'+g_sAccountName+' '+sDate1dayAgo+' - Parameter '+v_sParameterDefined+'</p><table border="1" style="text-align:center;border-collapse:collapse;white-space:nowrap;" cellpadding="2"><tr><th>Campaign</th><th>Period</th><th style="background-color:#FCE9C9">Cost ('+sCurrencyCode+')</th><th style="background-color:#FFFB96">#Conversion</th><th style="background-color:#FFFB96">Cost/Conv</th><th style="background-color:#EDFFD8">&#216;CPC</th><th style="background-color:#96FFFB">Clicks</th><th style="background-color:#EAEEFC">Impressions</th><th>Periods</th><th>Status</th></tr>';
       } else {
         var arCellStyle= new Array('', '', ' style="background-color:#FCE9C9"', ' style="background-color:#EDFFD8"', ' style="background-color:#96FFFB"', ' style="background-color:#EAEEFC"', '', '');
         //var sTableOpen ='<p>'+g_sAccountName+' '+sDate1dayAgo+' - Parameter '+v_sParameterDefined+'</p><table border="1" style="text-align:center;border-collapse:collapse;white-space:nowrap;" cellpadding="2"><tr><th>Campaign</th><th>Period</th><th style="background-color:#FCE9C9">Cost ('+sCurrencyCode+')</th><th style="background-color:#FFFB96">#Conversion</th><th style="background-color:#FFFB96">Cost/Conv</th><th style="background-color:#EDFFD8">&#216;CPC</th><th style="background-color:#96FFFB">Clicks</th><th style="background-color:#EAEEFC">Impressions</th><th style="background-color:#EAEEFC">&#216;Pos</th><th>Periods</th><th>Status</th></tr>';
         var sTableOpen ='<p>'+g_sAccountName+' '+sDate1dayAgo+' - Parameter '+v_sParameterDefined+'</p><table border="1" style="text-align:center;border-collapse:collapse;white-space:nowrap;" cellpadding="2"><tr><th>Campaign</th><th>Period</th><th style="background-color:#FCE9C9">Cost ('+sCurrencyCode+')</th><th style="background-color:#EDFFD8">&#216;CPC</th><th style="background-color:#96FFFB">Clicks</th><th style="background-color:#EAEEFC">Impressions</th><th>Periods</th><th>Status</th></tr>';
       }
       var date = new Date();
       date = (function(){this.setDate(this.getDate()-1); return this;}).call(date);
       var sDate1dayAgo = Utilities.formatDate(date, sTimeZone, "yyyy-MM-dd");
       var sMessage = sTableOpen;
       
       function getCell(_cellInfo) {
         var sCell = _cellInfo.value;
         return sCell;
       }
       for (var r = 0; r<_arRows.length; ++r) {
         var row = _arRows[r];
         //logHs(row);
         //var arRow = [row.campaign, row.period, getCell(row.cost), getCell(row.conv), getCell(row.costConv), getCell(row.cpc), getCell(row.click), getCell(row.impr), getCell(row.pos), row.periods, row.status];
         if (_bConversion === true) {
           var arRow = [row.campaign, row.period, getCell(row.cost), getCell(row.conv), getCell(row.costConv), getCell(row.cpc), getCell(row.click), getCell(row.impr), row.periods, row.status];
         } else {
           var arRow = [row.campaign, row.period, getCell(row.cost), getCell(row.cpc), getCell(row.click), getCell(row.impr), row.periods, row.status];
         }
         sMessage+="<tr>";
         for (var c = 0; c< arRow.length; ++c) {
           var sCell = arRow[c];
           sMessage+="<td";
           sMessage+=arCellStyle[c];
           sMessage+=">";
           sMessage+=sCell;
           sMessage+="</td>";
         }
         sMessage+="</tr>";
       }
       var sTableClose ='</table><p><a href="'+g_sAccountUrl+'">'+g_sAccountUrl+'</a></p>';
       sMessage+=sTableClose;
       return sMessage;
     }
   
       
       
     // ###############################
     // ### sendMailIfCostToHigh()
     // ### sendMailIfMaxCpcToHigh()
     // ###############################
     
     
     /************************************************************
       DATAINSIDE.AdWordsApi.checkAccountAndSendMail({
         conditions:{account:{cost:{min:0, max:20.0}},
                     campaign:{checkNoImpr:{pausedOrDeletedIsNormal:false}},
                     keyword:{maxCpc:{max:2.0}, effCpc:{max:0.2}}
                    }
       });
     ************************************************************/
     DATAINSIDE.AdWordsApi.checkAccountAndSendMail = function(_checkAccountParameter) {
       if (typeof _checkAccountParameter.conditions.account !== "undefined") {
         var dMin = null;
         var dMax = null;
         if (typeof _checkAccountParameter.conditions.account.cost.min !== "undefined") {
           dMin = _checkAccountParameter.conditions.account.cost.min;
         }
         if (typeof _checkAccountParameter.conditions.account.cost.max !== "undefined") {
           dMax = _checkAccountParameter.conditions.account.cost.max;
         }
         //DATAINSIDE.AdWordsApi.checkAccountCostAndSendMail(dMin,dMax,"YESTERDAY");
         DATAINSIDE.AdWordsApi.checkAccountCostAndSendMail({minCost:dMin, maxCost:dMax, period:"YESTERDAY"});
         
       }
     
       if (typeof _checkAccountParameter.conditions.campaign !== "undefined") {
         if (typeof _checkAccountParameter.conditions.campaign.checkNoImpr !== "undefined") {
           var bPausedOrDeletedIsProblem = false;
           if (typeof _checkAccountParameter.conditions.campaign.checkNoImpr.pausedOrDeletedIsProblem !== "undefined") {
             bPausedOrDeletedIsProblem = _checkAccountParameter.conditions.campaign.checkNoImpr.pausedOrDeletedIsProblem;
           }
           var sReport = "";
           var checkNoImpNormal = new DATAINSIDE.AdWordsUtils.CheckNoImpNormal(new Date());
           var campaignIterator = AdWordsApp.campaigns().get();
           while (campaignIterator.hasNext()) {
             var campaign = campaignIterator.next();
             if (checkNoImpNormal.getNoImprButShould(campaign, bPausedOrDeletedIsProblem) === true) {
               sReport += "Campaign '"+campaign.getName()+"' status: "+DATAINSIDE.AdWordsUtils.getStatus(campaign)+" but impressions 8 days ago\r\n"; 
             }
           }
           if ("" !== sReport) {
            var sSubject = "!!!!AdWords no Impressions Alert for "+g_sAccountName;
            sReport = sSubject+"\r\n\r\n"+sReport+"\r\n\r\n"+g_sAccountUrl;
            Logger.log(sReport);
            MailApp.sendEmail(g_sMailAddress, sSubject+DATAINSIDE.sBeta, sReport+sMailFooter); 
           }
         }
       }
       
       if (typeof _checkAccountParameter.conditions.keyword !== "undefined") {
         var dMaxCpc = null;
         var dEffCpc = null;
         if (typeof _checkAccountParameter.conditions.keyword.maxCpc !== "undefined") {
           dMaxCpc = _checkAccountParameter.conditions.keyword.maxCpc.max;
         }
         if (typeof _checkAccountParameter.conditions.keyword.effCpc !== "undefined") {
           dEffCpc = _checkAccountParameter.conditions.keyword.effCpc.max;
         }
         DATAINSIDE.AdWordsApi.checkCpcAndSendMail({maxCpc:dMaxCpc, maxAverageCpc:dEffCpc, period:"YESTERDAY"});
       }
     };
     
                                            
     
     DATAINSIDE.AdWordsApi.checkAccountCostAndSendMail = function(_parameter) {
       var dCostAccountMin = (typeof(_parameter.minCost) == "undefined") || (_parameter.minCost == null) || (_parameter.minCost < 0) ? null : _parameter.minCost;
       var dCostAccountMax = (typeof(_parameter.maxCost) == "undefined") || (_parameter.maxCost == null) || (_parameter.maxCost <= 0) ? null : _parameter.maxCost;
       var bIgnoreCost0 = (dCostAccountMin == 0) ? true : false; // changed 2020-12-28 // default = true until 2020-12-23 // default = false unteil 2020-12-28
       bIgnoreCost0Defined = false;
       if (typeof _parameter.ignoreCost0 !== "undefined") {
         bIgnoreCost0 = _parameter.ignoreCost0;
         bIgnoreCost0Defined = true;
       }   
       var sPeriod = _parameter.period;
     
       var dCostAccount = DATAINSIDE.AdWordsUtils.getCostAccount(sPeriod);
       if ((null != dCostAccountMax) && (dCostAccount > dCostAccountMax)) {
         // ## new generic keyword?
         var sSubject = "!!!!!AdWords Cost Alert for "+g_sAccountName+" "+dCostAccount+" > "+dCostAccountMax;
         var sBody = sSubject+"\r\n\r\n"+g_sAccountUrl;
         Logger.log(sSubject);
         MailApp.sendEmail(g_sMailAddress, sSubject+DATAINSIDE.sBeta, sBody+sMailFooter);
       } else if ((null != dCostAccountMin) && (dCostAccount <= dCostAccountMin)) {
         if ((dCostAccount !== 0) || (bIgnoreCost0 == false)) {
           if ((dCostAccount == 0) && (bAnyCampaignServing == false)) {
              // two days ago paused or new (report once)?
              var sTwoDaysAgo = twoDaysAgo(); // 20201028
              var dCostAccount2daysAgo = DATAINSIDE.AdWordsUtils.getCostAccount([sTwoDaysAgo, sTwoDaysAgo]);
              if (0 == dCostAccount2daysAgo) {
                Logger.log("All campaigns have been paused some time ago => Costs not checked.");
                return; // paused some time ago.
              }
           }
           
           
           // ## Problems with credit card?
           var sSubject = "!!AdWords Cost Alert for "+g_sAccountName+" "+dCostAccount+" <= "+dCostAccountMin;
           var sBody = sSubject+"\r\n\r\n"+g_sAccountUrl;
           if ((dCostAccount == 0) && (bIgnoreCost0Defined == false)) {
             sBody +='\r\n\r\nCosts of 0 are reported from now on. If you do not want to report costs of 0 please add the parameter ignoreCost0:true as in:\r\nDATAINSIDE.AdWordsApi.checkAccountCostAndSendMail({ignoreCost0:true, minCost:30, maxCost:140, period:"YESTERDAY"});';
             sBody +='\r\n\r\nIf you pause your campaigns on weekends this solution is better if you can do a little JavaScript:\r\n\r\nif (runon([Tuesday, Wednesday, Thursday, Friday, Saturday])) {';
           }
           Logger.log(sSubject);
           MailApp.sendEmail(g_sMailAddress, sSubject+DATAINSIDE.sBeta, sBody+sMailFooter);
         }
       }
     };
     
     // {maxCpc:2, maxAverageCpc:0.2, period:"YESTERDAY"}
     DATAINSIDE.AdWordsApi.checkCpcAndSendMail = function(_parameter) {
       if (bAnyCampaignServing == false) {
         Logger.log("checkCpcAndSendMail() not executed because all campaigns are paused.");
         return;
       }    
       var _dMaxCpc = _parameter.maxCpc;
       var _dAverageCpc = _parameter.maxAverageCpc;
       var _sPeriod = _parameter.period;
   
       var nMaxCpc = parseInt(_dMaxCpc *1000000, 10);
       var nMaxAverageCpc = parseInt(_dAverageCpc *1000000, 10);
       // ## checks defined max CPC and average CPC (important for Tests with +500% bids)
       var sReport = "";
       
       // ## AdGroups
       if ((typeof(_dMaxCpc) != "undefined") && (_dMaxCpc !== null) && (_dMaxCpc > 0)) {
         var reportMaxCpc = AdWordsApp.report("SELECT CampaignName, AdGroupName, AdGroupId, CpcBid FROM ADGROUP_PERFORMANCE_REPORT WHERE CampaignStatus = ENABLED AND AdGroupStatus = ENABLED AND CpcBid > "+nMaxCpc+"  DURING "+_sPeriod);
         var rowsMaxCpc = reportMaxCpc.rows();
         while (rowsMaxCpc.hasNext()) {
           var row = rowsMaxCpc.next();
           var dCpcBid = row["CpcBid"];
           if ((null !== dCpcBid) && (dCpcBid > _dMaxCpc)) { // null if automatic bids
             var sCampaign = row["CampaignName"];
             var sAdGroup = row["AdGroupName"];
             var nAdGroupId = row["AdGroupId"];
             sReport += "maxCPC "+dCpcBid+" > " +_dMaxCpc+" for adgroup '" + sAdGroup+ "' in campaign '"+sCampaign+ "'\r\n";            
             var s = actionOnAdgroupCpcBidToHigh(nAdGroupId, sAdGroup, sCampaign, dCpcBid);
             if ((typeof(s) != "undefined") && (s !== null) && (s.length > 0)) {
               sReport += s + "\r\n";  
             }
           }  
         }
       }
       if ((typeof(_dAverageCpc) != "undefined") && (_dAverageCpc !== null) && (_dAverageCpc > 0)) {
         var reportAverageCpc = AdWordsApp.report("SELECT CampaignName, AdGroupName, AdGroupId, AverageCpc FROM ADGROUP_PERFORMANCE_REPORT WHERE CampaignStatus = ENABLED AND AdGroupStatus = ENABLED AND AverageCpc > "+nMaxAverageCpc+"  DURING "+_sPeriod);
         var rowsAverageCpc = reportAverageCpc.rows();
         while (rowsAverageCpc.hasNext()) {
           var row = rowsAverageCpc.next();
           var dAverageCpc = row["AverageCpc"];
           //Logger.log("dAverageCpc: "+dAverageCpc );
           if ((null !== dAverageCpc) && (dAverageCpc > _dAverageCpc)) { // null if automatic bids
             var sCampaign = row["CampaignName"];
             var sAdGroup = row["AdGroupName"];
             var nAdGroupId = row["AdGroupId"];
             sReport += "averageCPC "+dAverageCpc+" > " +_dAverageCpc+" for adgroup '" + sAdGroup+ "' in campaign '"+sCampaign+ "'\r\n";            
             var s = actionOnAdgroupAverageCpcToHigh(nAdGroupId, sAdGroup, sCampaign, dAverageCpc);
             if ((typeof(s) != "undefined") && (s !== null) && (s.length > 0)) {
               sReport += s + "\r\n";  
             }
           }  
         }
       }      
   
       // ## Keywords
       if ((typeof(_dMaxCpc) != "undefined") && (_dMaxCpc !== null) && (_dMaxCpc > 0)) {
         var reportMaxCpc = AdWordsApp.report("SELECT CampaignName, AdGroupName, AdGroupId, Id, Criteria, KeywordMatchType, CpcBid FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignStatus = ENABLED AND AdGroupStatus = ENABLED AND Status = ENABLED AND CpcBid > "+nMaxCpc+"  DURING "+_sPeriod);
         var rowsMaxCpc = reportMaxCpc.rows();
         while (rowsMaxCpc.hasNext()) {
           var row = rowsMaxCpc.next();
           var dCpcBid = row["CpcBid"];
           if ((null !== dCpcBid) && (dCpcBid > _dMaxCpc)) { // null if automatic bids
             var sCampaign = row["CampaignName"];
             var sAdGroup = row["AdGroupName"];
             var nAdGroupId = row["AdGroupId"];
             var sKeyword = row["Criteria"];
             var sMatchType = row["KeywordMatchType"];
             var nKeywordId = row["Id"];
             sReport += "maxCPC "+dCpcBid+" > " +_dMaxCpc+" for keyword " + sKeyword+" in adgroup '" + sAdGroup+ "' in campaign '"+sCampaign+ "'\r\n";            
             var s = actionOnKeywordCpcBidToHigh(nKeywordId, sKeyword, sMatchType, nAdGroupId, sAdGroup, sCampaign, dCpcBid);
             if ((typeof(s) != "undefined") && (s !== null) && (s.length > 0)) {
               sReport += s + "\r\n";  
             }
           }  
         }
       }
       if ((typeof(_dAverageCpc) != "undefined") && (_dAverageCpc !== null) && (_dAverageCpc > 0)) {
         var reportAverageCpc = AdWordsApp.report("SELECT CampaignName, AdGroupName, AdGroupId, Id, Criteria, KeywordMatchType, AverageCpc FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignStatus = ENABLED AND AdGroupStatus = ENABLED AND Status = ENABLED AND AverageCpc > "+nMaxAverageCpc+"  DURING "+_sPeriod);
         var rowsAverageCpc = reportAverageCpc.rows();
         while (rowsAverageCpc.hasNext()) {
           var row = rowsAverageCpc.next();
           var dAverageCpc = row["AverageCpc"];
           //Logger.log("dAverageCpc: "+dAverageCpc );
           if ((null !== dAverageCpc) && (dAverageCpc > _dAverageCpc)) { // null if automatic bids
             var sCampaign = row["CampaignName"];
             var sAdGroup = row["AdGroupName"];
             var nAdGroupId = row["AdGroupId"];
             var sKeyword = row["Criteria"];
             var sMatchType = row["KeywordMatchType"];
             var nKeywordId = row["Id"];
             sReport += "averageCPC "+dAverageCpc+" > " +_dAverageCpc+" for keyword " + sKeyword+" in adgroup '" + sAdGroup+ "' in campaign '"+sCampaign+ "'\r\n";
             var s = actionOnKeywordAverageCpcToHigh(nKeywordId, sKeyword, sMatchType, nAdGroupId, sAdGroup, sCampaign, dAverageCpc);
             if ((typeof(s) != "undefined") && (s !== null) && (s.length > 0)) {
               sReport += s + "\r\n";  
             }
           }  
         }
       }
   
       if (sReport != "") {
         Logger.log(sReport);
         var sSubject = "!!!!AdWords MaxCpc Alert for "+g_sAccountName;
         var sBody    = sSubject+"\r\n\r\n"+sReport+"\r\n\r\n"+g_sAccountUrl;
         MailApp.sendEmail(g_sMailAddress, sSubject+DATAINSIDE.sBeta, "html e-mail", {htmlBody:"<pre>"+sBody+sMailFooterHTML+"</pre>"});
         return false;
       } else {
         return true;
       } 
     };
       
     function twoDaysAgo() {
       var date2DaysAgo = new Date(Date.now() - 2* 24 * 3600 * 1000);
       var timeZone = AdsApp.currentAccount().getTimeZone();
       var sYYYYMMDD = Utilities.formatDate(date2DaysAgo, timeZone, 'yyyyMMdd');
       return sYYYYMMDD;
     }
       
     function anyCampaignServing() {
       var iterator = AdsApp.campaigns()
         .withCondition("Status = ENABLED")
         .withCondition("ServingStatus = SERVING") // funktioniert nur mit AdWordsApp.campaigns()
         .get();
       if (iterator.hasNext() == true) {
         return true;
       } else {
    //Logger.log("b");
         var iteratorShopping = AdsApp.shoppingCampaigns().withCondition("Status = ENABLED").withCondition("ServingStatus = SERVING").get();
         //var iteratorShopping = AdsApp.shoppingCampaigns().withCondition("Status = ENABLED").get();
    Logger.log("1 Please don't ask me why, but the script doesn't work when I remove one of the two log lines!");
    Logger.log("2 The next lines of code are then reproducibly not executed. Strange!");
         if (iteratorShopping.hasNext() == true) {
           return true;
         } else {
           return false;
         }
       }
     }
   })();
   
   var Monday    = "1";
   var Tuesday   = "2";
   var Wednesday = "3";
   var Thursday  = "4";
   var Friday    = "5";
   var Saturday  = "6";
   var Sunday    = "7";
   function runon(_dayArray) {
     var now = new Date();
     var timeZone = AdsApp.currentAccount().getTimeZone();
     var sWeekday1to7 = Utilities.formatDate(now, timeZone, 'u');
     return (-1 != _dayArray.indexOf(sWeekday1to7));
   }