function main() {
  var samaraSession = "256";
  var accountEmail = "";
  
  const day = "17"; // const year = "05"; - ok     bad - const year = "5"; bad - const year = 5;
  var user = "nn";
  const budgetLimit = 22.53;

  const year = "2021"; // const year = "2021"; - ok     bad - const year = 2021; bad - const year = 21;
  const month = "04"; // const year = "04"; - ok     bad - const year = "4"; bad - const year = 4;

  // ===========================================================================================
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // do not change !!!!!
  // Не изменять код ниже !!!
  sendReport(year, month, day, user, samaraSession, accountEmail, budgetLimit);
}
// do not change !!!!!
// Не изменять код ниже !!!

// ===========================================================================================
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// do not change !!!!!
// Не изменять код ниже !!!
function sendReport(
  year,
  month,
  day,
  user,
  samaraSession,
  accountEmail,
  budgetLimit
) {
  const dateOfStartString = year + "-" + month + "-" + day;
  const currentDate = new Date();
  const isTime = isTimeToSend(currentDate);
  Logger.log(isTime);
  if (isTime.budgetUpdate) {
    Logger.log("it is time to budget update");
    setCampaignBudget(budgetLimit);
  }

  if (!isTime.sendTime) {
    Logger.log("Not Time To Report");

    return;
  }
  const startDate = Date.parse(dateOfStartString);

  const dateDifference = Number(currentDate) - Number(startDate);
  const diffDays = dateDifference / 1000 / 60 / 60 / 24;

  const checkLimit = 30;
  if (diffDays > checkLimit) {
    return;
  }

  var currentAccount = AdsApp.currentAccount();
  var todayCost = AdsApp.currentAccount().getStatsFor("TODAY").getCost(); // Затраты сегодня
  var todayClicks = currentAccount.getStatsFor("TODAY").getClicks(); // Клики сегодня

  var accountName = currentAccount.getName();
  var accountCostToday = currentAccount.getStatsFor("TODAY").getCost();
  var accountClicksToday = currentAccount.getStatsFor("TODAY").getClicks();

  var accountCostLastWeek = currentAccount.getStatsFor("LAST_7_DAYS").getCost();
  var accountClicksLastWeek = currentAccount
    .getStatsFor("LAST_7_DAYS")
    .getClicks();

  var accountCostAllTime = currentAccount.getStatsFor("ALL_TIME").getCost();
  var accountClicksAllTime = currentAccount.getStatsFor("ALL_TIME").getClicks();

  const table = [];
  const row_prefix = {
    //id: accountName,
    date: currentDate,
    daysInWork: diffDays,
    checkLimitDays: checkLimit,
    user: user,
    samaraSession: samaraSession,
    accountEmail: accountEmail,
    accountName: accountName,
    accountCostToday: accountCostToday,
    accountClicksToday: accountClicksToday,
    accountCostLastWeek: accountCostLastWeek,
    accountClicksLastWeek: accountClicksLastWeek,
    accountCostAllTime: accountCostAllTime,
    accountClicksAllTime: accountClicksAllTime,
  };

  var campaignIterator = AdsApp.campaigns().get();
  Logger.log("Total campaigns found : " + campaignIterator.totalNumEntities());
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();

    //const row = Object. row_prefix;
    var row = Object.assign({}, row_prefix);
    var campaignId = campaign.getName();
    var budget = campaign.getBudget();
    var budgetAmount = budget.getAmount();

    const id = row.id + "-" + campaignId;
    row.id = accountName + "-" + campaignId;

    row.isEnabled = campaign.isEnabled();
    row.campaignName = campaign.getName();

    row.campaignCost = campaign.getStatsFor("ALL_TIME").getCost();
    row.campaignClicks = campaign.getStatsFor("ALL_TIME").getClicks();
    row.campaignImpressions = campaign.getStatsFor("ALL_TIME").getImpressions();
    row.campaignCtr = campaign.getStatsFor("ALL_TIME").getCtr();
    row.budgetAmount = budgetAmount;

    table.push(Object.assign({}, row));
  }

  UrlFetchApp.fetch(
    "https://script.google.com/macros/s/AKfycbwygWmpomaMEXZpbZl795cXPlFMSFVNI1wWQmpGhHD023PGpYmLfpC4tgbQv_Fv-69Y/exec",
    {
      method: "POST",
      payload: JSON.stringify({
        source: "check",
        id: dateOfStartString,
        table: table,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

function isTimeToSend(currentDate) {
  var ddd = Utilities.formatDate(currentDate, "GMT+06", "HH");

  var budgetUpdate = false;
  var num_ = Number(ddd);
  var num__ = num_ % 2;
  if (!num__) budgetUpdate = true;
  Logger.log(ddd);
  Logger.log(num__);
  Logger.log(budgetUpdate);

  if (ddd == "06") return { sendTime: true, budgetUpdate: budgetUpdate };
  if (ddd == "12") return { sendTime: true, budgetUpdate: budgetUpdate };
  if (ddd == "18") return { sendTime: true, budgetUpdate: budgetUpdate };

  return { sendTime: false, budgetUpdate: budgetUpdate };
}

function setCampaignBudget(limit) {
  var campaignIterator = AdsApp.campaigns().get();
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var budget = campaign.getBudget();
    var curBudget = budget.getAmount();
    var newBudget = curBudget * 1.31;
    if (newBudget > limit) {
      Logger.log("limit has been reached");
    } else {
      campaign.getBudget().setAmount(newBudget);
      Logger.log(
        "Campaign with name = " +
          campaign.getName() +
          " has budget = " +
          campaign.getBudget().getAmount()
      );
    }
  }
}

// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
// FINAL WITH BUDGETS
// -***-*---*-*-*-*-*-*-*-**
