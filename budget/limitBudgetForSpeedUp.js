function main() {
    var campIter = AdsApp.campaigns().get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        const cost = camp.getStatsFor("TODAY").getCost();
        if (cost == 0 && camp.isPaused()) camp.enable();
        if (cost > 0 && camp.isEnabled()) camp.pause();
    }
}
