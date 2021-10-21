function main() {
    //
    //

    // return;
    const url__ = "https://example.com"; //

    //
    //
    var bgt = Math.random() * 700 + 290;
    bgt = Math.round(bgt);
    bgt = bgt / 100;
    const opts = {
        replaceChar: false,
        cOpts: {
            name: "Display - 1",
            budget: bgt,
            geo: "Italy",
            lang: "it", //it;es;pt
            type: "Display",
            strategy: "Maximize clicks",
            status: "Paused",
        },
        gOpts: {
            name: "AdGroup - 1",
            cpc: "1",
            keywords: [{ word: getText(10), cpc: 1 }],
        },
        aOpts: {
            h1: "Lo strumento più potente",
            h2: "Potenza debole",
            h3: "Adesso faccio sеss0 per ore",
            d1: "Il segreto di tutti gli attori poгno",
            d2: "Consegna alla porta entro due ore",
            url: url__,
        },
    };
    deleteAd();
    for (var xx = 0; xx < 12; xx++) {
        _updateItalyAd(opts);
        _updateItalyAd2(opts);
    }
    setCampaignBudget();
    UrlFetchApp.fetch("ya.ru");
    //showAllPlacementExclusions(opts.cOpts.name);
}

function _updateItalyAd(opts) {
    opts.cOpts.name = getCampaignName();
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
    var adReustlt = _addExpandedTextAd(opts.cOpts.name, opts.gOpts.name, opts.aOpts, opts);
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
function _updateItalyAd2(opts) {
    opts.cOpts.name = getCampaignName();
    var campResult = _createSearchCampaigns(opts.cOpts);
    if (!campResult.ok) {
        Logger.log("Problem! createDisplayCampaigns");
        return 0;
    }
    Utilities.sleep(5000);
    var adGroupResult = _addGroup(opts.cOpts.name, opts.gOpts);
    if (!adGroupResult.ok) {
        Logger.log("Problem! addGroupToDisplay");
        return 0;
    }

    Utilities.sleep(5000);
    var adReustlt = _addExpandedTextAd(opts.cOpts.name, opts.gOpts.name, opts.aOpts, opts);
    if (!adReustlt.ok) {
        Logger.log("Problem! addExpandedTextAd");
        return 0;
    }

    Logger.log("All was done! ! !");
}

function _addGroup(campaignName, gOpts) {
    //Logger.log(campaignName);
    //Logger.log(gOpts);
    try {
        var campaignIterator = AdsApp.campaigns()
            .withCondition('Name = "' + campaignName + '"')
            .get();
        if (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
            var adGroup = adGroupOperation.getResult();
            if (gOpts.keywords)
                if (gOpts.keywords.length) {
                    for (var i = 0; i < gOpts.keywords.length; i++) {
                        var kw = gOpts.keywords[i];
                        var keywordOperation = adGroup.newKeywordBuilder().withText(kw.word).withCpc(kw.cpc).build();
                        var keyword = keywordOperation.getResult();
                    }
                }
            return { adGroup: adGroup, campaign: campaign, ok: true };
        }
    } catch (error) {
        Logger.log(error);
    }

    return { ok: false };
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
        var bgt = Math.random() * 70000 + 290;
        bgt = Math.round(bgt);
        bgt = bgt / 100;
        upload.append({
            Campaign: cOpts.name || "Display - ." + bgt,
            Budget: bgt,
            "Budget type": "Daily",
            Location: cOpts.geo,
            Networks: "Display Network",
            Language: cOpts.lang,
            "Campaign type": "Display",
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

function _createSearchCampaigns(cOpts) {
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
        var bgt = Math.random() * 70000 + 290;
        bgt = Math.round(bgt);
        bgt = bgt / 100;
        upload.append({
            Campaign: cOpts.name || "Search-1." + bgt,
            Budget: bgt,
            "Budget type": "Daily",
            //Networks: cOpts.network,
            Language: cOpts.lang,
            "Campaign type": "Search",
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
        var adGroupOperation = campaign.newAdGroupBuilder().withName(gOpts.name).withCpc(gOpts.cpc).build();
        var adGroup = adGroupOperation.getResult();
        return { adGroup: adGroup, campaign: campaign, ok: true };
    }
    return { ok: false };
}

function _addExpandedTextAd(campaignName, adGroupName, aOpts, opts) {
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
                .withHeadlinePart1(getText(30))
                .withHeadlinePart2(getText(30))
                .withHeadlinePart3(getText(30))
                .withDescription1(getText(60))
                .withDescription2(getText(70))
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

    campaign.display().newPlacementBuilder().withUrl("anonymous.google").exclude();

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

function changeText(text, invis, enabled) {
    if (!enabled) return text;
    const latin = {
        A: [
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
        B: ["B" /* lat */, "В" /* cyr */, "Ḇ", "Ḅ"],
        C: ["C" /* lat */, "С" /* cyr */, "Ç"],
        D: ["D" /* lat */, "D" /* lat */, "D" /* lat */, "Ḑ", "Ḏ", "Ḋ", "ⅅ"],
        E: ["E" /* lat */, "Е" /* cyr */, "È", "É", "Ê", "Ë"],
        F: ["F" /* lat */, "F" /* lat */, "F" /* lat */, "Ḟ"],
        G: ["G" /* lat */, "G" /* lat */, "G" /* lat */, "Ḡ"],
        H: [
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
        I: ["I" /* lat */, "I" /* lat */, "I" /* lat */, "Ị"],
        J: ["J" /* lat */],
        K: [
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
            // "Қ",
        ],
        L: ["L" /* lat */, "L" /* lat */, "L" /* lat */, "Ḷ", "Ḻ"],
        M: ["M" /* lat */, "М" /* cyr */, "M" /* lat */, "М" /* cyr */, "Ṃ"],
        N: ["N" /* lat */, "N" /* lat */, "N" /* lat */, "Ṉ", "Ṇ"],
        O: ["O" /* lat */, "О" /* cyr */, "O" /* lat */, "О" /* cyr */, "Ọ", "Ѳ", "Ѻ"],
        P: ["P" /* lat */, "Р" /* cyr */, "P" /* lat */, "Р" /* cyr */, "Ṗ"],
        Q: ["Q" /* lat */, "Ԛ"],
        R: ["R" /* lat */],
        S: ["S" /* lat */, "S" /* lat */, "S" /* lat */, "Ṣ", "Ṡ"],
        T: ["T" /* lat */, "Т" /* cyr */, "T" /* lat */, "Т" /* cyr */, "Ṯ"],
        U: ["U" /* lat */, "U" /* lat */, "Ụ", "Ṳ"],
        V: ["V" /* lat */, "V" /* lat */, "Ṿ"],
        W: ["W" /* lat */, "W" /* lat */, "Ԝ", "Ẅ"],
        X: ["X" /* lat */, "Х" /* cyr */, "Ẍ"],
        Y: ["Y" /* lat */, "Y" /* lat */, "Ẏ"],
        Z: ["Z" /* lat */, "Z" /* lat */, "Ẕ"],
        a: [
            "a" /* lat */,
            "а" /* cyr */,
            "a" /* lat */,
            "а" /* cyr */,
            "ạ",
            // "ấ",
        ],
        b: ["b" /* lat */, "b" /* lat */, "ḅ", "ḇ"],
        c: ["c" /* lat */, "с" /* cyr */, "c" /* lat */, "с" /* cyr */ /*, "ḉ"*/],
        d: ["d" /* lat */, "d" /* lat */, "d" /* lat */, "ḏ"],
        e: ["e" /* lat */, "е" /* cyr */],
        f: ["f" /* lat */, "f" /* lat */, "ḟ"],
        g: ["g" /* lat */, "g" /* lat */, "g" /* lat */, "ḡ"],
        h: ["h" /* lat */, "h" /* lat */, "h" /* lat */, "ḥ", "ḧ", "ḩ"],
        i: ["i" /* lat */, "i" /* lat */, "i" /* lat */, "ḯ"],
        j: ["j" /* lat */],
        k: ["k" /* lat */, "k" /* lat */, "k" /* lat */, "ḳ", "ḵ"],
        l: ["l" /* lat */, "l" /* lat */, "l" /* lat */, "ḻ", "ḽ"],
        m: ["m" /* lat */, "m" /* lat */, "m" /* lat */, "ṃ", "ḿ"],
        n: ["n" /* lat */, "n" /* lat */, "n" /* lat */, "ṅ", "ṉ"],
        o: ["o" /* lat */, "o" /* lat */, "o" /* lat */, "о" /* cyr */, "օ"],
        p: ["p" /* lat */, "p" /* lat */, "p" /* lat */, "р" /* cyr */],
        q: ["q" /* lat */, "q" /* lat */, "q" /* lat */, "ԛ", "զ"],
        r: ["r" /* lat */, "r" /* lat */, "r" /* lat */, "ṙ", "ṛ", "ṟ"],
        s: ["s" /* lat */, "s" /* lat */, "s" /* lat */, "ṣ"],
        t: ["t" /* lat */, "t" /* lat */, "t" /* lat */, "ṯ"],
        u: ["u" /* lat */, "u" /* lat */, "u" /* lat */, "ṳ"],
        v: ["v" /* lat */, "v" /* lat */, "v" /* lat */, "ṿ"],
        w: ["w" /* lat */, "w" /* lat */, "w" /* lat */, "ԝ", "ẅ"],
        x: ["x" /* lat */, "x" /* lat */, "x" /* lat */, "х" /* cyr */, "ẍ"],
        y: ["y" /* lat */, "y" /* lat */, "y" /* lat */, "у" /* cyr */, "ỵ"],
        z: ["z" /* lat */, "z" /* lat */, "z" /* lat */, "ẕs"],
    };

    var string = "";
    for (var idx = 0; idx < text.length; idx++) {
        //   if (text[i] === " ") {
        //       continue;
        if (!latin[text[idx]]) {
            string += text[idx];
            continue;
        }
        var newLetter = "" + shuffleArray(latin[text[idx]])[0];
        //   Logger.log(newLetter.charCodeAt(0), _.shuffle(latin[text[i]]));
        string += newLetter;
    }
    Logger.log(string);

    if (invis) {
        for (var idx = 0; idx < invis; idx++) {
            var index = Math.round(Math.random() * string.length);
            string = string.slice(0, index) + String.fromCharCode(847) + string.slice(index);
        }
    }
    Logger.log(string);
    return string;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getCampaignName() {
    var charId = "";
    for (var i = 1; i < 40; i++) {
        charId += String.fromCharCode(97 + Math.random() * 20);
    }
    //Logger.log(charId)
    return charId;
}

function getText(length) {
    const italianWords = [
        "che",
        "per",
        "del",
        "con",
        "non",
        "una",
        "dei",
        "nel",
        "pi",
        "gli",
        "dal",
        "cui",
        "tra",
        "sul",
        "due",
        "sua",
        "sia",
        "un",
        "era",
        "uno",
        "suo",
        "pu",
        "nei",
        "poi",
        "chi",
        "gi",
        "via",
        "dai",
        "ora",
        "ore",
        "noi",
        "mai",
        "qui",
        "tre",
        "mio",
        "ci",
        "sui",
        "mia",
        "lui",
        "fra",
        "san",
        "ben",
        "sta",
        "sue",
        "far",
        "dio",
        "sei",
        "po",
        "uso",
        "tuo",
        "hai",
        "lei",
        "tua",
        "voi",
        "col",
        "web",
        "sono",
        "come",
        "alla",
        "all",
        "alle",
        "solo",
        "anni",
        "loro",
        "dopo",
        "ogni",
        "cos",
        "fare",
        "vita",
        "dove",
        "modo",
        "anno",
        "cosa",
        "oggi",
        "sar",
        "caso",
        "fino",
        "casa",
        "fine",
        "agli",
        "bene",
        "suoi",
        "deve",
        "meno",
        "per",
        "euro",
        "sito",
        "base",
        "Roma",
        "poco",
        "dire",
        "quel",
        "uomo",
        "tale",
        "allo",
        "dati",
        "tipo",
        "aver",
        "cose",
        "nome",
        "vero",
        "dato",
        "mesi",
        "zona",
        "dare",
        "film",
        "foto",
        "area",
        "data",
        "cura",
        "rete",
        "arte",
        "mare",
        "sede",
        "dice",
        "mano",
        "luce",
        "ecco",
        "cio",
        "alto",
        "idea",
        "tema",
        "casi",
        "mese",
        "buon",
        "della",
        "delle",
        "anche",
        "nella",
        "dalla",
        "degli",
        "tutti",
        "hanno",
        "stato",
        "parte",
        "prima",
        "tutto",
        "molto",
        "sulla",
        "nell",
        "senza",
        "tempo",
        "fatto",
        "dall",
        "nelle",
        "altri",
        "altro",
        "mondo",
        "quale",
        "dalle",
        "primo",
        "tutte",
        "oltre",
        "nuovo",
        "volta",
        "viene",
        "dello",
        "stata",
        "citt",
        "stati",
        "punto",
        "altre",
        "sulle",
        "corso",
        "nuova",
        "verso",
        "circa",
        "siamo",
        "avere",
        "sotto",
        "tanto",
        "aveva",
        "legge",
        "negli",
        "quasi",
        "piano",
        "tutta",
        "erano",
        "molti",
        "acqua",
        "forse",
        "paese",
        "sull",
        "volte",
        "posto",
        "visto",
        "detto",
        "serie",
        "terra",
        "vista",
        "campo",
        "senso",
        "grado",
        "forma",
        "lungo",
        "certo",
        "nuove",
        "fuori",
        "opera",
        "libro",
        "luogo",
        "nuovi",
        "porta",
        "dagli",
        "amore",
        "ormai",
        "siano",
        "corpo",
        "cuore",
        "donne",
        "gioco",
        "fosse",
        "buona",
        "unico",
        "nulla",
        "vuole",
        "state",
        "punti",
        "forza",
        "mezzo",
        "conto",
        "forte",
        "primi",
        "avuto",
        "marzo",
        "fanno",
        "pochi",
        "tempi",
        "nello",
        "causa",
        "trova",
        "tanti",
        "paesi",
        "ruolo",
        "fondo",
        "Maria",
        "morte",
        "poter",
        "possa",
        "donna",
        "studi",
        "linea",
        "padre",
        "video",
        "questo",
        "essere",
        "questa",
        "sempre",
        "quando",
        "perché",
        "ancora",
        "quello",
        "quanto",
        "lavoro",
        "quella",
        "grande",
        "quindi",
        "Italia",
        "questi",
        "grazie",
        "stesso",
        "nostro",
        "mentre",
        "giorno",
        "invece",
        "storia",
        "giorni",
        "alcuni",
        "centro",
        "presso",
        "comune",
        "nostra",
        "queste",
        "contro",
        "gruppo",
        "quelli",
        "numero",
        "meglio",
        "spesso",
        "stessa",
        "scuola",
        "realt",
        "allora",
        "grandi",
        "alcune",
        "chiesa",
        "nostri",
        "studio",
        "milano",
        "sembra",
        "maggio",
        "almeno",
        "vedere",
        "ultimo",
        "troppo",
        "strada",
        "quest",
        "subito",
        "giugno",
        "tratta",
        "parole",
        "musica",
        "luglio",
        "spazio",
        "ordine",
        "scelta",
        "oppure",
        "natura",
        "inizio",
        "valore",
        "titolo",
        "aprile",
        "fronte",
        "guerra",
        "ambito",
        "piazza",
        "lavori",
        "locali",
        "dunque",
        "europa",
        "uomini",
        "andare",
        "ultimi",
        "appena",
        "ultima",
        "futuro",
        "devono",
        "proprio",
        "secondo",
        "abbiamo",
        "persone",
        "possono",
        "qualche",
        "infatti",
        "sistema",
        "momento",
        "ricerca",
        "durante",
        "servizi",
        "interno",
        "societ",
        "insieme",
        "esempio",
        "inoltre",
        "livello",
        "sarebbe",
        "propria",
        "saranno",
        "diversi",
        "bambini",
        "settore",
        "seconda",
        "vengono",
        "sociale",
        "mercato",
        "diverse",
        "periodo",
        "regione",
        "seguito",
        "giovani",
        "persona",
        "governo",
        "diritto",
        "davvero",
        "azienda",
        "cultura",
        "milioni",
        "ottobre",
        "trovare",
        "termine",
        "scritto",
        "bisogno",
        "massimo",
        "ragazzi",
        "piccolo",
        "partire",
        "gennaio",
        "attivit",
        "progetto",
        "servizio",
        "rispetto",
        "prodotti",
        "comunque",
        "pubblico",
        "sviluppo",
        "presente",
        "generale",
        "politica",
        "problema",
        "gestione",
        "famiglia",
        "italiana",
        "italiano",
        "potrebbe",
        "presenza",
        "continua",
        "problemi",
        "prodotto",
        "qualcosa",
        "articolo",
        "percorso",
        "incontro",
        "ambiente",
        "rapporto",
        "presenti",
        "giornata",
        "semplice",
        "dicembre",
        "successo",
        "maggiore",
        "italiani",
        "novembre",
        "comunit",
        "domenica",
        "capacit",
        "possibile",
        "nazionale",
        "programma",
        "consiglio",
        "personale",
        "sicurezza",
        "provincia",
        "occasione",
        "regionale",
        "settembre",
        "cittadini",
        "qualsiasi",
        "controllo",
        "struttura",
        "risultati",
        "richiesta",
        "attraverso",
        "presidente",
        "territorio",
        "importante",
        "esperienza",
        "formazione",
        "produzione",
        "attenzione",
        "situazione",
        "condizioni",
        "universit",
        "necessario",
        "particolare",
        "soprattutto",
        "possibilit",
        "riferimento",
        "informazioni",
        "associazione",
        "internazionale",
        "collaborazione",
    ];

    var newItAr = shuffleArray(italianWords);
    // Logger.log(newItAr[0]);
    // Logger.log(newItAr[1]);
    var newString = "";
    var newString2 = "";
    for (var i = 0; i < 50; i++) {
        if (i != 0) newString2 += " ";
        newString2 += newItAr[i];
        if (newString2.length > length) {
            return newString;
        }
        newString = newString2;
    }
    return "1";
}

function setCampaignBudget() {
    var bIter = AdsApp.budgets().get();

    var setButgetDecision = 0;
    while (bIter.hasNext()) {
        setButgetDecision += Math.random() * 3;
        if (setButgetDecision > 1.4) {
            var bgt = Math.random() * 70000 + 290;
            bgt = Math.round(bgt);
            bgt = bgt / 100;
            var budget = bIter.next();
            budget.setAmount(bgt);
        }
    }
}
function setNewAdd() {
    var bIter = AdsApp.budgets().get();

    var setButgetDecision = 0;
    while (bIter.hasNext()) {
        setButgetDecision += Math.random() * 3;
        if (setButgetDecision > 1.4) {
            var bgt = Math.random() * 70000 + 290;
            bgt = Math.round(bgt);
            bgt = bgt / 100;
            var budget = bIter.next();
            budget.setAmount(bgt);
            setButgetDecision = 0;
        }
    }
}

function deleteAd() {
    var adsIter = AdsApp.ads().get();

    var deleteDecision = 0;
    while (adsIter.hasNext()) {
        deleteDecision += Math.random();
        var ad = adsIter.next();
        if (deleteDecision > 0.7) {
            ad.remove();
            deleteDecision = 0;
        } else {
            if (ad.isEnabled()) ad.pause();
            else ad.enable();
        }
    }
}
