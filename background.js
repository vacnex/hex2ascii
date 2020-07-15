const isUrl = (str) => {
    try {
        new URL(str);
        return true;
    } catch  {
        return false;  
    }
}
chrome.contextMenus.create({
    title: "HighHuman Menu", 
    contexts:["selection"],
    id : "MainMenu"
});
chrome.contextMenus.create({
    title: "Pls select hex",
    contexts:["selection"], 
    enabled : false,
    id : "hexdecode",
    parentId: "MainMenu",
    onclick: accessUrl
});
chrome.contextMenus.create({
    title: "Not nhentai number",
    contexts:["selection"], 
    enabled : false,
    id : "nhentai",
    parentId: "MainMenu",
    onclick: accessNhentai
});
function accessNhentai(info,tab) {
    var selected = info.selectionText
    chrome.storage.sync.get('IncognitoMode',function(res) {
        var isIncognitoMode  = res.IncognitoMode
        chrome.extension.getBackgroundPage().console.log(isIncognitoMode);
        if (!isIncognitoMode) {
            chrome.tabs.create({"url": `https://nhentai.net/g/${selected}`})
        }
        else{
            chrome.windows.create({"url": `https://nhentai.net/g/${selected}`, "incognito": true})
        }
    });
}
function accessUrl(info,tab) {
    var selected = info.selectionText
    var url = h2t(selected)
    chrome.storage.sync.get('IncognitoMode',function(res) {
        var isIncognitoMode  = res.IncognitoMode
        chrome.extension.getBackgroundPage().console.log(isIncognitoMode);
        if (!isIncognitoMode) {
            chrome.tabs.create({"url": url})
        }
        else{
            chrome.windows.create({"url": url, "incognito": true})
        }
    });
}
function h2t(selectedhex) {
    var decodetext =[];
    for (let i = 0; i < selectedhex.length; i+=2) {
        decodetext.push(String.fromCharCode(parseInt(selectedhex.replace(/\s/g, "").substring(i,i+2), 16)))
    }
    var url = decodetext.join('')
    return url
}
function isNhentaiCode(selectedNumber) {
    var its 
    if (!isNaN(selectedNumber)) {
        if (selectedNumber.length <= 6) {
            its = true
        } else its = false
    } else its = false
    return its
}
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    var url = h2t(request.SelectedText)
    if (isUrl(url)) {
        var link = url
        var linkgroup = []
        for(let i of link.split(/[\n\s]/))
            i && linkgroup.push(i);
        link = linkgroup;
        if (link.length > 1)
        {
            chrome.extension.getBackgroundPage().console.log('multiple url '+link);
            chrome.storage.sync.set({'URLs': link});
            chrome.contextMenus.update("hexdecode",{
                title: "Click on extension to view multiple url",
                enabled : false,
            })
        }
        else
        {
            chrome.storage.sync.set({'URLs': ''});
            chrome.extension.getBackgroundPage().console.log('one url '+link);
            chrome.storage.sync.get('NameorURL',function(res) {
                var isNameorURL  = res.NameorURL
                if (!isNameorURL) {
                    chrome.contextMenus.update("hexdecode",{
                        title: "go " + link,
                        enabled : true,
                    })
                }
                else{
                    var hostname = new URL(link);
                    chrome.contextMenus.update("hexdecode",{
                        title: "go " + hostname.hostname,
                        enabled : true,
                    })
                }
            });
        }
    }
    if (!isUrl(url))
    {
        chrome.contextMenus.update("hexdecode",{
            title: "pls select hex",
            enabled : false,
        })
    }
    if (isNhentaiCode(request.SelectedText)) {
        chrome.contextMenus.update("nhentai",{
            title: "Go nhentai.net/g/" + request.SelectedText,
            enabled : true,
        })
    }
    if (!isNhentaiCode(request.SelectedText)) {
        chrome.contextMenus.update("nhentai",{
            title: "Not nhentai number",
            enabled : false,
        })
    }
});


