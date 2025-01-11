/* Copyright (C) 2023 Duong Cong - All Rights Reserved
* Email: duongcong0412hc@gmail.com
*/

const extensionUrl = chrome.runtime.getURL("");

// ***************** FUNCTION ******************

const ext = async () => {
    chrome.management.getAll((info) => {
        console.log(info)
    })
}

const listenExt = async () => {
    let extList = [];

    chrome.management.getAll((info) => {
        let extEnabled = [];

        info.forEach((extension) => {
            if (!extension.isApp) {
                let appCount = {
                    ExtensionName: extension.name,
                    ExtensionVersion: extension.version,
                    ExtensionId: extension.id,
                    ExtensionStatus: extension.enabled,
                    OfflineEnabled: extension.offlineEnabled
                };
                extList.push(appCount);
                if (extension.enabled) {
                    extEnabled.push(extension.name);
                }
            }
        });

        if (extList.length === 0) {
            console.log("No addons installed.");
        }


        console.log(extList)
        console.log("+====")
        console.log(extEnabled)
    });


}


// ============ On install listener ============
chrome.runtime.onInstalled.addListener(async (reason) => {


    // Install
    if (reason.reason == "install") {

    }
    // Update
    if (reason.reason == "update") {
        listenExt()

    }
});