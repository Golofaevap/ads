function main() {
    const newBidUsd = 6; // $
    
    const level = "KEYWORDS"; // GROUPS | KEYWORDS
    
    
    const newBidInCurrency = adjustBid(newBidUsd);
    
    if(level == "GROUPS"){
      const adsGroupIterator = AdsApp.adGroups().get();
      while(adsGroupIterator.hasNext()){
        const adGroup = adsGroupIterator.next();
        adGroup.bidding().setCpc(newBidInCurrency);
      }
    }
    if(level == "KEYWORDS"){
      const keywordIterator = AdsApp.keywords().get();
      while(keywordIterator.hasNext()){
        const keyword = keywordIterator.next();
        keyword.bidding().setCpc(newBidInCurrency);
      }
    }
  }
  
  function adjustBid(newBidUsd){
    const budgetMultiplier = getBudgetMultiplier();
    var newBidInCurrency = newBidUsd  * budgetMultiplier;
    newBidInCurrency = Math.round(newBidInCurrency*100) / 100;
    if(budgetMultiplier>10){
      newBidInCurrency = Math.round(newBidInCurrency*10) / 10;
    }  
    if(budgetMultiplier>50){
      newBidInCurrency = Math.round(newBidInCurrency);
    }
    
    return newBidInCurrency;
  }
  // *******************************************************************************************
  // *******************************************************************************************
  function getBudgetMultiplier() {
      var currency = AdsApp.currentAccount().getCurrencyCode();
      var url =
          "https://script.google.com/macros/s/AKfycbxI-Jb6TVA7JAiyky-n_nBJx90tu8B0KybFS79nqY95MBV7uKXgS5r1rR0Of4PDelMN/exec?currency=" +
          currency;
      var resp = UrlFetchApp.fetch(url);
      // Logger.log(resp.getContentText());
      var resultJson = JSON.parse(resp.getContentText());
      if (resultJson.ok && resultJson.result) {
          return resultJson.result;
      }
      return 1;
  }