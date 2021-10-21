function main() {
  // const header1part = "";
  const sum = _generateRand();
  var bgt = Math.random() * 700 + 290;
  bgt = Math.round(bgt);
  bgt = bgt / 100;
  // bgt = 2;
  const opts = {
    cOpts: {
      name: "===",
      budget: bgt,
      lang: "ru", //it;es;pt
      type: "Display",
      strategy: "Maximize conversions",
      status: "Paused",
    },
    gOpts: {
      name: "AdGroup - 2",
      cpc: "1",
    },
    aOpts: {
      h1: "Вам Зачислено" + sum[0] + "",
      h2: "Вам Зачислено" + sum[1] + "",
      h3: "Вам Зачислено" + sum[2] + "",
      d1: "Чтобы получить ваши" + sum[3] + "Перейдите по ссылке",
      d2: "Чтобы получить ваши" + sum[4] + "",
      url: "",
    },
    lOpt: {
      inc: [2643],
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


function _addGroupToDisplay(campaignName, gOpts) {
  //Logger.log(campaignName, gOpts);
  var campaignIterator = AdsApp.campaigns()
    .withCondition('Name CONTAINS_IGNORE_CASE "' + campaignName + '"')
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
      .withCondition('CampaignName CONTAINS_IGNORE_CASE "' + campaignName + '"')
      .get();

    if (adGroupIterator.hasNext()) {
      var adGroup = adGroupIterator.next();
      var adOperation = adGroup
        .newAd()
        .expandedTextAdBuilder()
        .withHeadlinePart1(changeText(aOpts.h1, 2))
        .withHeadlinePart2(changeText(aOpts.h2, 2))
        .withHeadlinePart3(changeText(aOpts.h3, 2))
        .withDescription1(changeText(aOpts.d1, 2))
        .withDescription2(changeText(aOpts.d2, 2))
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
// node cyr "aaa sasdf AAAAA "

// const _ = require("lodash");

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function changeText(text, invis) {
  const cyr = {
    А: [
      "A" /* lat */,
      "A" /* lat */,
      "A" /* lat */,
      "A" /* lat */,
      "A" /* lat */,
      "A" /* lat */,
      "А" /* cyr */,
      "А" /* cyr */,
      "А" /* cyr */,
      "А" /* cyr */,
      "А" /* cyr */,
      "А" /* cyr */,
      "À",
      "Á",
      "Â",
      "Ã",
      "Ä",
      "Å",
    ],
    Б: ["Б"],
    В: ["B" /* lat */, "В" /* cyr */, "Ḇ", "Ḅ"],
    Г: ["Г"],
    Д: ["Д"],
    Е: ["E" /* lat */, "Е" /* cyr */, "È", "É", "Ê", "Ë"],
    Ж: ["Ж"],
    З: ["З"],
    И: ["И"],
    Й: ["Й"],
    К: [
      "K" /* lat */,
      "К" /* cyr */,
      "Ҝ",
      "K" /* lat */,
      "К" /* cyr */,
      "Ҝ",
      "K" /* lat */,
      "К" /* cyr */,
      "Ҝ",
      "K" /* lat */,
      "К" /* cyr */,
      "Ҝ",
      "K" /* lat */,
      "К" /* cyr */,
      "Ҝ",
      "Ҟ",
      "Ҡ",
      "Қ",
    ],
    Л: ["Л"],
    М: ["M" /* lat */, "М" /* cyr */, "M" /* lat */, "М" /* cyr */, "Ṃ"],
    Н: [
      "H" /* lat */,
      "Н" /* cyr */,
      "H" /* lat */,
      "Н" /* cyr */,
      "H" /* lat */,
      "Н" /* cyr */,
      "H" /* lat */,
      "Н" /* cyr */,
      "Ң",
    ],
    О: [
      "O" /* lat */,
      "О" /* cyr */,
      "O" /* lat */,
      "О" /* cyr */,
      "Ọ",
      "Ѳ",
      "Ѻ",
    ],
    П: ["П"],
    Р: ["P" /* lat */, "Р" /* cyr */, "P" /* lat */, "Р" /* cyr */, "Ṗ"],
    С: ["C" /* lat */, "С" /* cyr */, "Ç"],
    Т: ["T" /* lat */, "Т" /* cyr */, "T" /* lat */, "Т" /* cyr */, "Ṯ"],
    У: ["У"],
    Ф: ["Ф"],
    Х: ["X" /* lat */, "Х" /* cyr */, "Ẍ"],
    Ц: ["Ц"],
    Ч: ["Ч"],
    Ш: ["Ш"],
    Щ: ["Щ"],
    Ъ: ["Ъ"],
    Ы: ["Ы"],
    Ь: ["Ь"],
    Э: ["Э"],
    Ю: ["Ю"],
    Я: ["Я"],
    а: ["a" /* lat */, "а" /* cyr */, "a" /* lat */, "а" /* cyr */, "ạ", "ấ"],
    б: ["б"],
    в: ["в"],
    г: ["г"],
    д: ["д"],
    е: ["e" /* lat */, "е" /* cyr */],
    ж: ["ж"],
    з: ["з"],
    и: ["и"],
    й: ["й"],
    к: ["к"],
    л: ["л"],
    м: ["м"],
    н: ["н"],
    о: ["o" /* lat */, "o" /* lat */, "o" /* lat */, "о" /* cyr */, "օ"],
    п: ["п"],
    р: ["p" /* lat */, "p" /* lat */, "p" /* lat */, "р" /* cyr */],
    с: ["c" /* lat */, "с" /* cyr */, "c" /* lat */, "с" /* cyr */, "ḉ"],
    т: ["т"],
    у: ["y" /* lat */, "y" /* lat */, "y" /* lat */, "у" /* cyr */, "ỵ"],
    ф: ["ф"],
    х: ["x" /* lat */, "x" /* lat */, "x" /* lat */, "х" /* cyr */, "ẍ"],
    ц: ["ц"],
    ч: ["ч"],
    ш: ["ш"],
    щ: ["щ"],
    ъ: ["ъ"],
    ы: ["ы"],
    ь: ["ь"],
    э: ["э"],
    ю: ["ю"],
    я: ["я"],
  };

  //   const args = process.argv;

  //   let text = "" + args[2];
  var string = "";
  // console.log(cyr);
  for (var i = 0; i < text.length; i++) {
    //   if (text[i] === " ") {
    //       continue;
    if (!cyr[text[i]]) {
      string += text[i];
      continue;
    }
    var newLetter = "" + shuffleArray(cyr[text[i]])[0];
    //   console.log(newLetter.charCodeAt(0), _.shuffle(latin[text[i]]));
    string += newLetter;
  }
  Logger.log(string);

  //   const invis = Number(args[3]);

  if (invis) {
    for (var i = 0; i < invis; i++) {
      var index = Math.round(Math.random() * string.length);
      string =
        string.slice(0, index) + String.fromCharCode(847) + string.slice(index);
    }
  }
  Logger.log(string, string.length);
  return string;
}