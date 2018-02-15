const audioDefault = '/assets/positive-sound.mp3';
const icone = '/assets/icon-notification.png';
const badgeUp = '/assets/uparrow.png';
const badgeDown = '/assets/downarrow.png';
const API = 'https://api.coinmarketcap.com/v1/ticker/ripple/';

let audioPermission = false;
let notificationPermission = false;
let priceHigherPermission = false;
let priceLowerPermission = false;
let priceHigher = false;
let priceLower = false;
let popupOpenned = false;

const manifest = chrome.runtime.getManifest();
const devMode = manifest.name.indexOf('[Dev]') > -1;

chrome.storage.sync.get('audioPermission', response => {
    audioPermission = response.audioPermission;
});
chrome.storage.sync.get('notificationPermission', response => {
    notificationPermission = response.notificationPermission;
});
chrome.storage.sync.get('priceHigherPermission', response => {
    priceHigherPermission = response.priceHigherPermission;
});
chrome.storage.sync.get('priceLowerPermission', response => {
    priceLowerPermission = response.priceLowerPermission;
});
chrome.storage.sync.get('priceHigher', response => {
    priceHigher = response.priceHigher;
});
chrome.storage.sync.get('priceLower', response => {
    priceLower = response.priceLower;
});

chrome.storage.onChanged.addListener(function(changes) {
    let horaAtual = new Date().getTime();
    for (let key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'audioPermission':
                audioPermission = storageChange.newValue;
                break;
            case 'priceHigher':
                priceHigher = storageChange.newValue;
                break;
            case 'priceLower':
                priceLower = storageChange.newValue;
                break;
            case 'notificationPermission':
                notificationPermission = storageChange.newValue;
                break;
            case 'priceLowerPermission':
                priceLowerPermission = storageChange.newValue;
                break;
            case 'priceHigherPermission':
                priceHigherPermission = storageChange.newValue;
                break;
        }
    }
});

function showNotification(notificationObj, down) {
    if (Notification.permission === "granted") {
        let notification = new Notification(notificationObj.title, notificationObj.body);

        if (audioPermission) {
            let audio = new Audio(audioDefault);
            audio.play();
        }
    }
}

function getPrice() {
    fetch(API).then(function(response) {
        let contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function(json) {
                chrome.storage.sync.set({'coin': json[0]}, () => {
                    console.log('XRP is now ' + json[0].price_usd + ' USD');
                    chrome.browserAction.setBadgeText({
                        'text': Number(json[0].price_usd).toFixed(2)
                    });
                    if (!!notificationPermission) {
                        if (!!priceHigherPermission && !!priceHigher && json[0].price_usd > priceHigher) {
                            chrome.storage.sync.set({'priceHigher': json[0].price_usd});
                            showNotification({ title: "Ripple's price just got up!",
                                body: {
                                    body: 'XRP is now: $' + Number(json[0].price_usd).toFixed(4) + ' USD (' + json[0].percent_change_24h + '%)',
                                    tag: 'price-up',
                                    icon: icone,
                                    badge: badgeUp
                                }
                            });
                        } 
                        if (!!priceLowerPermission && !!priceLower && json[0].price_usd < priceLower) {
                            chrome.storage.sync.set({'priceLower': json[0].price_usd});
                            showNotification({ title: "Ripple's price just got down!",
                                body: {
                                    body: 'XRP is now: $' + Number(json[0].price_usd).toFixed(4) + ' USD (' + json[0].percent_change_24h + '%)',
                                    tag: 'price-down',
                                    icon: icone,
                                    badge: badgeDown
                                }
                            }, true);
                        }
                    }
                });
            });
        }
    });
}

setInterval(function () {
    getPrice();
}, 60000);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.update) {
            getPrice(true);
        }
    }
);