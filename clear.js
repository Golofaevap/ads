function main() {
    var campIter = AdsApp.campaigns().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        camp.urls().clearTrackingTemplate();
        camp.urls().clearFinalUrlSuffix();
        camp.urls().setCustomParameters({ uurl: "" });
    }
    var campIter = AdsApp.adGroups().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        camp.urls().clearTrackingTemplate();
        camp.urls().clearFinalUrlSuffix();
        camp.urls().setCustomParameters({ uurl: "" });
    }
}
