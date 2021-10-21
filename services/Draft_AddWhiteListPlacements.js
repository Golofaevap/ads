function main() {
    addWhiteExclusion();
}

function addWhiteExclusion() {
    const whiteList = [
        "ilmeteo.it",
        "consiglietrucchi.com",
        "proiezionidiborsa.it",
        "www.liberoquotidiano.it",
        "www.areanapoli.it",
        "www.ilgiornale.it",
        "www.money.it",
        "badoo.com",
        "www.proiezionidiborsa.it",
        "www.trend-online.com",
        "www.calciomercato.com",
        "www.nirvam.it",
        "www.adnkronos.com",
        "www.ansa.it",
        "www.unionesarda.it",
        "m.nirvam.it",
        "www.contocorrenteonline.it",
        "www.iltempo.it",
        "www.secoloditalia.it",
        "www.serieanews.com",
        "edizionecaserta.net",
        "www.gazzettadiparma.it",
        "www.inews24.it",
        "www.interlive.it",
        "www.oasport.it",
    ];

    var drafts = AdsApp.drafts().get();
    while (drafts.hasNext()) {
        var draft = drafts.next();

        var groups = draft.getDraftCampaign().adGroups().get();
        Logger.log(groups.totalNumEntities());
        while (groups.hasNext()) {
            var group = groups.next();

            for (var i = 0; i < whiteList.length; i++) {
                group.display().newPlacementBuilder().withUrl(whiteList[i]).withCpc(1.0).build();
            }
        }
    }
}
