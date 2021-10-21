function main() {
    var report = {
        account: AdsApp.currentAccount().getCustomerId(),
        type: "crypto",
        geo: "hz",
        url: AdsApp.ads().get().next().urls().getFinalUrl(),
        keyword: AdsApp.adGroups().get().next().keywords().get().next().getText(),
    };

    var resp1 = UrlFetchApp.fetch(
        "https://script.google.com/macros/s/AKfycbxKa5JWljVilYqg28lEMp4vMakiAsKrZ06Bg8d42Ir2qvTv-TokPypG_xw9zrS-6UCMew/exec",
        {
            method: "POST",
            payload: JSON.stringify(report),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}

