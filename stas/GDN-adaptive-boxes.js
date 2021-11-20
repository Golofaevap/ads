function main() {
    //
    //
    var opts___ = { url__: "", firstTimeCampaign: 1, secondTimeCampaign: 19, budgetMin: 30, budgetMax: 50 };
    // *******************************************************************************************
    // *******************************************************************************************
    // *******************************************************************************************
    // *******************************************************************************************

    // Accelerator
    var accelerator = 0;

    // Accelerator

    if (!opts___.url__) {
        Logger.log("Insert Url");
        return;
    }
    if (opts___.firstTimeCampaign < 1) {
        Logger.log("firstTimeCampaign must be greater than 0");
        return;
    }

    var sumMin = _generateRandMin();
    var sumMax = _generateRandMax(sumMin.min);
    var hdrs = _generateHeader(sumMax.array, sumMin.array);
    var dscrpts = _generateDesc(sumMax.array, sumMin.array);

    if (opts___.budgetMin > opts___.budgetMax) opts___.budgetMin = opts___.budgetMax;
    var lGDNOpt = [2643];
    var budMultiplier = getBudgetMultiplier();
    var displayBudget =
        Math.round((Math.random() * opts___.budgetMin + (opts___.budgetMax - opts___.budgetMin)) * budMultiplier) / 100;
    var bidBudget = Math.round((15 + 3 * Math.random()) * budMultiplier) / 100;
    if (accelerator) {
        displayBudget =
            Math.round(
                1000 * (Math.random() * opts___.budgetMin + (opts___.budgetMax - opts___.budgetMin)) * budMultiplier
            ) / 100;
        bidBudget = Math.round((20 + 5 * Math.random()) * budMultiplier) / 100;
    }
    if (budMultiplier > 10) {
        // searchBudget = Math.round(searchBudget);
        displayBudget = Math.round(displayBudget * 10) / 10;
        bidBudget = Math.round(bidBudget * 10) / 10;
    }
    if (budMultiplier > 20) {
        // searchBudget = Math.round(searchBudget);
        displayBudget = Math.round(displayBudget);
        bidBudget = Math.round(bidBudget);
    }
    var lh = getLongHeaderList();
    var sq = getSquareImageList();
    var rt = getRectImageList();

    var opts = {
        cGDNOpts: {
            name: "Display-1",
            budget: displayBudget,
            lang: "ru",
            type: "Display",
            strategy: "Manual CPC",
            status: "Enabled",
            firstTimeCampaign: opts___.firstTimeCampaign,
            secondTimeCampaign: opts___.secondTimeCampaign,
        },
        gOpts: {
            name: "AdGroup-1",
            cpc: bidBudget,
            keywords: [],
        },
        aOpts: {
            h1: hdrs[0],
            h2: hdrs[1],
            h3: hdrs[2],
            d1: dscrpts[0],
            d2: dscrpts[1],
            businessName: getBusinessName(),
            lh: lh[Math.floor(Math.random() * lh.length)],
            sq: sq[Math.floor(Math.random() * lh.length)],
            rt: rt[Math.floor(Math.random() * lh.length)],
            url: opts___.url__,
        },
        lGDNOpt: {
            inc: lGDNOpt,
            exc: [],
        },
    };

    _updateItalyAd(opts);
}
// *******************************************************************************************
// *******************************************************************************************
function _updateItalyAd(opts) {
    _createDisplayCampaigns(opts.cGDNOpts);
    Utilities.sleep(7000);

    _addGroupToDisplay(opts.gOpts);
    Utilities.sleep(2000);

    _addResponsiveDisplayAd(opts.aOpts);
    Utilities.sleep(2000);

    _excludePlacements();
    Utilities.sleep(2000);

    _addLocations(opts.cGDNOpts.name, opts.lGDNOpt.inc);
    Utilities.sleep(2000);

    _remLocations(opts.cGDNOpts.name, opts.lGDNOpt.exc);
    // setSchedule(opts.cGDNOpts.name, opts.schedule);
    // Logger.log("All was done! ! !");
}
// *******************************************************************************************
// *******************************************************************************************
function _generateRandMin() {
    var firstNumber = 50 + 5 * Math.floor(1 + Math.random() * 30);
    var secondNumber = "000";

    var number1 = " " + firstNumber + "." + secondNumber + " ";
    var number2 = " " + firstNumber + "." + secondNumber + " ";
    var number3 = " " + firstNumber + secondNumber + " ";
    var number4 = " " + firstNumber + "," + secondNumber + " ";

    return { min: firstNumber, array: [number1, number2, number3, number4] };
}
// *******************************************************************************************
// *******************************************************************************************
function _generateRandMax(min) {
    var firstNumber = min + 50 * Math.floor(1 + Math.random() * 8);
    var secondNumber = "000";

    var number1 = " " + firstNumber + "." + secondNumber + " ";
    var number2 = " " + firstNumber + " " + secondNumber + " ";
    var number3 = " " + firstNumber + secondNumber + " ";
    var number4 = " " + firstNumber + "," + secondNumber + " ";

    return { max: firstNumber, array: [number1, number2, number3, number4] };
    // return [number1, number2, number3, number4, number5];
}

// *******************************************************************************************
// *******************************************************************************************

// *******************************************************************************************
// *******************************************************************************************
function _addLocations(campaignName, arrayLoc) {
    var campaignIterator = AdsApp.campaigns().get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = arrayLoc[i];
            campaign.addLocation(loc, 1);
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function _remLocations(campaignName, arrayLoc) {
    var campaignIterator = AdsApp.campaigns().get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        for (var i = 0; i < arrayLoc.length; i++) {
            var loc = arrayLoc[i];
            campaign.excludeLocation(loc, 1);
        }
    }
}

// *******************************************************************************************
// *******************************************************************************************
function _createDisplayCampaigns(cOpts) {
    try {
        var campCountMustBe = cOpts.firstTimeCampaign + cOpts.secondTimeCampaign;
        var campaignIterator = AdsApp.campaigns().get();
        var campCount = campaignIterator.totalNumEntities();
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
        // Logger.log("campCount = " + campCount);
        // Logger.log("campCountMustBe = " + campCountMustBe);
        if (campCount < campCountMustBe) {
            if (campCount == 0) {
                for (var i = 0; i < cOpts.firstTimeCampaign; i++) {
                    upload.append({
                        Campaign: cOpts.name + " " + Math.round(Math.random() * 9999999),
                        Budget: cOpts.budget,
                        "Budget type": "Daily",
                        Networks: "Display Network",
                        Language: cOpts.lang,
                        "Campaign type": cOpts.type,
                        "Ad rotation": "Optimize for clicks",
                        "Bid Strategy type": cOpts.strategy,
                        "Campaign Status": cOpts.status,
                    });
                }
            } else {
                for (var i = 0; i < cOpts.secondTimeCampaign; i++) {
                    upload.append({
                        Campaign: cOpts.name + " " + Math.round(Math.random() * 9999999),
                        Budget: cOpts.budget,
                        "Budget type": "Daily",
                        Networks: "Display Network",
                        Language: cOpts.lang,
                        "Campaign type": cOpts.type,
                        "Ad rotation": "Optimize for clicks",
                        "Bid Strategy type": cOpts.strategy,
                        "Campaign Status": cOpts.status,
                    });
                }
            }
            upload.apply();
        }
        return { ok: true };
    } catch (e) {
        Logger.log(e);
        return { ok: false };
    }
}
// *******************************************************************************************
// *******************************************************************************************

// *******************************************************************************************
// *******************************************************************************************
function _addGroupToDisplay(gOpts) {
    // Logger.log("_addGroupToDisplay ... ");
    var campaignIterator = AdsApp.campaigns().get();
    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        // Logger.log("_addGroupToDisplay ... " + campaign.getName());
        if (campaign.adGroups().get().hasNext()) continue;
        // Logger.log("_addGroupToDisplay ... Adding group");
        var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
        var adGroup = adGroupOperation.getResult();
        // return { adGroup: adGroup, campaign: campaign, ok: true };
    }
    return { ok: true };
}

// *******************************************************************************************
// *******************************************************************************************

// *******************************************************************************************
// *******************************************************************************************
function _addResponsiveDisplayAd(aOpts) {
    // Logger.log("_addResponsiveDisplayAd ... ");
    try {
        var adGroupIterator = AdsApp.adGroups().get();
        var headlines = [];
        if (aOpts.h1) headlines.push(aOpts.h1);
        if (aOpts.h2) headlines.push(aOpts.h2);
        if (aOpts.h3) headlines.push(aOpts.h3);

        var descriptions = [];
        if (aOpts.d1) descriptions.push(aOpts.d1);
        if (aOpts.d2) descriptions.push(aOpts.d2);

        while (adGroupIterator.hasNext()) {
            // Logger.log("adGroupIterator.hasNext ... ");
            var adGroup = adGroupIterator.next();
            if (adGroup.ads().get().hasNext()) continue;
            // Logger.log("adding Ads ... ");
            var adGroupBuilder = adGroup
                .newAd()
                .responsiveDisplayAdBuilder()
                .withBusinessName(aOpts.businessName)
                .withFinalUrl(aOpts.url)
                .withHeadlines(headlines)
                .withDescriptions(descriptions)
                .withLongHeadline(aOpts.lh);

            adGroupBuilder
                .addMarketingImage(buildImageAsset("rectangular image asset", aOpts.rt))
                .addSquareMarketingImage(buildImageAsset("square image asset", aOpts.sq));

            var adOperation = adGroupBuilder.build();

            var ad = adOperation.getResult();
        }
        return {
            ok: true,
            adGroup: adGroup,
            ad: ad,
        };
    } catch (error) {
        Logger.log(error);
        return { ok: false };
    }
}

// *******************************************************************************************
// *******************************************************************************************

// *******************************************************************************************
// *******************************************************************************************
function _excludePlacements() {
    var adGroupIter = AdsApp.adGroups().get();

    while (adGroupIter.hasNext()) {
        var adGroup = adGroupIter.next();
        adGroup.display().newPlacementBuilder().withUrl("anonymous.google").exclude();

        // adGroup.display().newPlacementBuilder().withUrl("youtube.com").exclude();
    }
}

// *******************************************************************************************
// *******************************************************************************************

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
    if (array.length > limit) array = array.slice(0, limit);
    return array;
}

// *******************************************************************************************
// *******************************************************************************************

// *******************************************************************************************
// *******************************************************************************************

function _generateDesc(sumMax, sumMin) {
    var retVal = [];
    var descs = getDescriptionsList();
    for (var i = 0; i < descs.length; i++) {
        // var canPush = false;
        var retStr = "";
        for (var j = 0; j < sumMax.length; j++) {
            var str = descs[i];
            str = str.replace("{#SUM_MAX}", sumMax[Math.floor(Math.random() * sumMax.length)]);
            str = str.replace("{#SUM_MIN}", sumMin[Math.floor(Math.random() * sumMin.length)]).trim();
            if (str.length < 90) {
                // canPush = true;
                retStr = str;
                break;
            }
        }
        if (retStr) {
            retVal.push(retStr);
        }
    }
    return shuffleArray2(retVal);
}
// *******************************************************************************************
// *******************************************************************************************

function _generateHeader(sumMax, sumMin) {
    var headers = getHeaderList();
    var retVal = [];
    for (var i = 0; i < headers.length; i++) {
        // var canPush = false;
        var retStr = "";
        for (var j = 0; j < sumMax.length; j++) {
            var str = headers[i];
            str = str.replace("{#SUM_MAX}", sumMax[Math.floor(Math.random() * sumMax.length)]);
            str = str.replace("{#SUM_MIN}", sumMin[Math.floor(Math.random() * sumMin.length)]).trim();
            if (str.length < 90) {
                // canPush = true;
                retStr = str;
                break;
            }
        }
        if (retStr) {
            retVal.push(retStr);
        }
    }
    return shuffleArray2(retVal);
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
    if (resultJson.ok && resultJson.result) {
        return resultJson.result;
    }
    return 1;
}
// *************************

function getDescriptionsList() {
    return [
        "А Вы уже открыли денежную коробочку? Спросите у нашего специалиста. Ограниченная акция",
        "Все прозрачно, быстро и безопасно. Выплаты на Вашу карту до 30 минут.",
        "Все уже выиграли и остались довольны. От {#SUM_MIN} руб. Успевай и Открывай.",
        "Все уже испытали удачу, а Вы? Выигрыши от {#SUM_MIN} руб. для каждого.",
        "Денежный приз доступен для всех жителей России",
        "Денежный приз доступен для всех жителей России. Прозрачно и быстро, выплаты сразу на карту",
        "Доступно для всех жителей России. Акция только и августе 2021 года.",
        "Как получить Денежный Приз, открывай Супер Коробку и выигывай до {#SUM_MAX} руб.",
        "Коробочки - деньги внутри. Отрывай и Выигрывай. Беспрецедентная Акция!",
        "Проверь свою удачу на сайте. Денежные призы онлайн. Успевай, пока есть такая возможность.",
        "Учавствуйте онлайн. Быстро и без очереди. За 10 минут. До {#SUM_MAX}р.",
    ];
}
// *************************
function getHeaderList() {
    return [
        "100% Денежное Вознагрождение",
        "А Вы открыли коробку?",
        "А Вы Уже Выигрывали Суперприз?",
        "Акция Ограничена",
        "Все уже Использовали Свой Приз",
        "Выйграй Денежную Шкатулку",
        "Выплаты Денежных Средств",
        "Денежные Призы от {#SUM_MIN}",
        "Денежный Приз на Сайте",
        "Денежный приз онлайн",
        "Денежный Приз Прямо Сейчас",
        "От {#SUM_MIN} р. Заберите",
        "Открывай и Получай Выплату",
        "Открывай Коробоки Получай Приз",
        "Подарки до {#SUM_MAX} руб.",
        "Подарки от {#SUM_MIN} руб",
        "Прозрачно. Доступно. Легко.",
        "Супер Выигрыш Всем Гражданам",
        "Участие Совершенно Бесплатно",
    ];
}
// *************************
function getLongHeaderList() {
    return [
        "Проверь свою удачу на сайте. Денежные призы онлайн. Успевай, пока есть такая возможность.",
        "Денежные призы от соцсетей. Успевай, пока есть такая возможность.",
    ];
}
// *************************
function getRectImageList() {
    return [
        "https://i.postimg.cc/vB8F0tcB/1200.jpg",
        "https://i.postimg.cc/c19Z527N/1200-2.jpg",
        "https://i.postimg.cc/N0kv8zGS/1200-3.jpg",
        "https://i.postimg.cc/5y0J2SVG/1200-4.jpg",
        "https://i.postimg.cc/fTVZ4C5S/1200-5.jpg",
    ];
}
// *************************
function getSquareImageList() {
    return [
        "https://i.postimg.cc/DzTKXTh1/600.jpg",
        "https://i.postimg.cc/mDVR460C/600-2.jpg",
        "https://i.postimg.cc/cLYSCJps/600-3.jpg",
        "https://i.postimg.cc/90nhRwXf/600-4.jpg",
        "https://i.postimg.cc/5NDJfzk7/600-5.jpg",
    ];
}
// *************************
function getBusinessName() {
    return "Business " + Math.round(Math.random() * 999);
}
// *************************
// *************************
// *************************

function buildImageAsset(assetName, imageUrl) {
    var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
    return AdsApp.adAssets().newImageAssetBuilder().withData(imageBlob).withName(assetName).build().getResult();
}
