function main() {
    var options = {
        newBudget: 20, // %
        campaignName: "Display-1",
        maxBudget: 2000, // в валюте аккаунта
        maxTimes: 70,
    };
    var label = null;
    var timesLabel = AdsApp.labels.withCondition('Name="times"').get();
    if(!timesLabel.hasNext()){
        AdsApp.createLabel("times", "1", "red");
    }

    var campaignsIterator = AdsApp.campaigns()
        .withCondition('Name = "' + options.campaignName + '"')
        .get();
    if (campaignsIterator.hasNext()) {
        var campaign = campaignsIterator.next();
        var budget = campaign.getBudget().getAmount();
        var newBudget = budget * (1 + Number(options.newBudget) / 100);
        if (newBudget > options.maxBudget) {
            newBudget = options.maxBudget;
        }
        campaign.getBudget().setAmount(newBudget);

    }
}

function getLabels() {
    var labels = {};
    var lbls = AdsApp.labels().get();
    Logger.log(lbls.totalNumEntities());
    while (lbls.hasNext()) {
        var lbl = lbls.next();
        Logger.log(lbl.getName() + " : " + lbl.getDescription());
        labels[lbl.getName()] = lbl.getDescription();
    }
    return labels;
}

function setLabels(labels){
    var names = Object.keys(labels);
    for(let i = 0; i<names.length;i++){
        var labelIter = AdsApp.labels.withCondition('Name = "'+ names[i] +'"').get();
        if(labelIter.hasNext()){
            var label = labelIter.next();
            // label.
            label.setDescription(labels[names[i]]+"");
        } else {
            AdsApp.createLabel(names[i], labels[names[i]]+"", "red");
        }
    }
}
