function main() {
    const options = {
        newBudget: 11.4, // без кавычек, без запятых, без пробелов. ТОЛЬКО ЦИФРЫ и точка (в конце 1 запятая)
        campaignName: "Search-1", // точнось до самого последнего знака - лишний пробел и кампания не будет найдена
    };

    var campaignsIterator = AdsApp.campaigns()
        .withCondition('Name = "' + options.campaignName + '"')
        .get();
    if (campaignsIterator.hasNext()) {
        var campaign = campaignsIterator.next();

        campaign.getBudget().setAmount(Number(options.newBudget));
    }
}
