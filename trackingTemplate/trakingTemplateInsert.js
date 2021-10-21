function main() {
    const options = {
        customParameter_uurl: "123", // insert your redirect here
        trackingTemplate:
            "https://clickserve.dartsearch.net/link/click?{_dssagcrid}&{_dssftfiid}&ds_e_adid={creative}&ds_e_matchtype={ifsearch:search}{ifcontent:content}&ds_url_v=2&ds_dest_url={_uurl}/?url={lpurl}",
        insertCustomParameter: true,
        insertTrakingTemplate: true,
        levelCustomParameter: "CAMPAIGN", // ADD_GROUP | CAMPAIGN
        levelTrakingTemplate: "CAMPAIGN", // ADD_GROUP | CAMPAIGN
    };

    var campaignsIterator = AdsApp.campaigns().get();
    var groupsIterator = AdsApp.adGroups().get();

    if (options.insertCustomParameter) {
        var iterator = campaignsIterator;
        if (options.levelCustomParameter == "ADD_GROUP") {
            iterator = groupsIterator;
        }
        while (iterator.hasNext()) {
            var object = iterator.next();
            object.urls().setCustomParameters({ uurl: options.customParameter_uurl });
        }
    }

    if (options.insertTrakingTemplate) {
        var iterator = campaignsIterator;
        if (options.levelTrakingTemplate == "ADD_GROUP") {
            iterator = groupsIterator;
        }
        while (iterator.hasNext()) {
            var object = iterator.next();
            object.urls().setTrackingTemplate(options.trackingTemplate);
        }
    }
}
