function addExtentionsDark(opts) {
    var newSitelink1 = AdsApp.extensions()
        .newSitelinkBuilder()
        .withLinkText("Sing Up").withDescription1("Sign Up Online Secure").withDescription2("Connect With Web")
        .withFinalUrl(opts.aOpts.url + "#singup")
        //.withMobilePreferred(true)
        .build()
        .getResult();
    var newSitelink2 = AdsApp.extensions()
        .newSitelinkBuilder()
        .withLinkText("Log In").withDescription1("Connect and Start Now").withDescription2("Fast safe Web Access")
        .withFinalUrl(opts.aOpts.url + "#login")
        //.withMobilePreferred(true)
        .build()
        .getResult();
    var newSitelink3 = AdsApp.extensions()
        .newSitelinkBuilder()
        .withLinkText("Secure").withDescription1("Safe & Secure Get Information").withDescription2("Information online")
        .withFinalUrl(opts.aOpts.url + "#secure")
        //.withMobilePreferred(true)
        .build()
        .getResult();
    var newSitelink4 = AdsApp.extensions()
        .newSitelinkBuilder()
        .withLinkText("Fast").withDescription1("Fast & Safe Web Access").withDescription2("Get Information")
        .withFinalUrl(opts.aOpts.url + "#fast")
        //.withMobilePreferred(true)
        .build()
        .getResult();

    var newSnippet1 = AdsApp.extensions()
        .newSnippetBuilder()
        .withHeader("Types")
        .withValues(["Log In", "Sing Up", "Secure", "Fast"])
        //.withMobilePreferred(false)
        .build()
        .getResult();

    var newCallout1 = AdsApp.extensions().newCalloutBuilder().withText("Sign Up").build().getResult();

    var campaignIterator = AdsApp.campaigns()
        .withCondition('Name = "' + opts.cOpts.name + '"')
        .get();
    if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        campaign.addSitelink(newSitelink1);
        campaign.addSitelink(newSitelink2);

        campaign.addSitelink(newSitelink3);
        campaign.addSitelink(newSitelink4);
        campaign.addSnippet(newSnippet1);
        campaign.addCallout(newCallout1);
    }
}