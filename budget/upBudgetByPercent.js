function main() {
    const options = {
        newBudget: 10, // %
    };

    var campaignsIterator = AdsApp.campaigns()
        .get();
    if (campaignsIterator.hasNext()) {
        var campaign = campaignsIterator.next();
        var budget = campaign.getBudget().getAmount();
        campaign.getBudget().setAmount(budget*(1+Number(options.newBudget)/100));
    }
}
