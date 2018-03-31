let promises = [];

const manifest = chrome.runtime.getManifest();
const devMode = manifest.name.indexOf('[Dev]') > -1;
const WALLET_ADDRESS = 'rNXDEjtgEWX842ozWWnVwgS8NEUnNLyTaL';
document.getElementById('version').innerHTML = (devMode ? '[Dev] ' : '') + 'v'+manifest.version;
document.getElementById('address').innerText = WALLET_ADDRESS;

chrome.runtime.sendMessage({update: true});

promises.push(chrome.storage.sync.get('audioPermission', response => {
    document.getElementById('audioPermission').checked = !!response.audioPermission;
}));

promises.push(chrome.storage.sync.get('coin', response => {
    let coin = response.coin;
    if (!!coin) {
        updateValues(coin);
    }
}));

promises.push(chrome.storage.sync.get('priceHigherPermission', response => {
    document.getElementById('priceHigherPermission').checked = !!response.priceHigherPermission;
}));

promises.push(chrome.storage.sync.get('priceHigher', response => {
    document.getElementById('priceHigher').value = Number(response.priceHigher);
}));

promises.push(chrome.storage.sync.get('priceLowerPermission', response => {
    document.getElementById('priceLowerPermission').checked = !!response.priceLowerPermission;
}));


promises.push(chrome.storage.sync.get('priceLower', response => {
    document.getElementById('priceLower').value = Number(response.priceLower);
}));

promises.push(chrome.storage.sync.get('notificationPermission', response => {
    document.getElementById('notificationPermission').checked = !!response.notificationPermission;
    enableFields(response.notificationPermission);
}));

Promise.all(promises).then((resp) => {
    document.getElementById('body').style = 'display: block';
});

function updateValues(coin) {
    document.getElementById('usd_value').innerHTML = '$' + Number(coin.price_usd);
    document.getElementById('percentage').innerHTML = '(' + Number(coin.percent_change_24h).toFixed(2) + '%)';
    document.getElementById('percentage').classList.toggle('positive_change', Number(coin.percent_change_24h) >= 0);
    document.getElementById('percentage').classList.toggle('negative_change', Number(coin.percent_change_24h) < 0);
    document.getElementById('priceHigher').setAttribute('placeholder', Number(coin.price_usd).toFixed(2));
    document.getElementById('priceLower').setAttribute('placeholder', Number(coin.price_usd).toFixed(2));
    document.getElementById('btc_value').innerHTML = Number(coin.price_btc);
}

chrome.storage.onChanged.addListener(function(changes) {
    for (let key in changes) {
        let storageChange = changes[key];
        switch (key) {
            case 'coin':
                updateValues(storageChange.newValue);
                break;
            case 'priceLower':
                document.getElementById('priceLower').value = storageChange.newValue;
                break;
            case 'priceHigher':
                document.getElementById('priceHigher').value = storageChange.newValue;
                break;
        }
    }
});

/* FUNÇÃO PARA SALVAR AS PERMISSÕES */
document.getElementById('audioPermission').addEventListener('change', saveAudioPermission);
document.getElementById('notificationPermission').addEventListener('change', changeNotificationPermission);
document.getElementById('priceHigherPermission').addEventListener('change', changeNotificationHigherPermission);
document.getElementById('priceHigher').addEventListener('change', savePriceHigher);
document.getElementById('priceLowerPermission').addEventListener('change', changeNotificationLowerPermission);
document.getElementById('priceLower').addEventListener('change', savePriceLower);

function savePriceHigher(e) {
    let price = Number(e.target.value);
    chrome.storage.sync.set({'priceHigher': price}, function () {
        if (!price) {
            chrome.storage.sync.set({'priceHigherPermission': false}, function () {
                document.getElementById('priceHigherPermission').checked = false;
                document.getElementById('priceHigher').disabled = true;
                document.getElementById('priceHigher').value = "";
            });
        }
    });
}

function savePriceLower(e) {
    let price = Number(e.target.value);
    chrome.storage.sync.set({'priceLower': price}, function () {
        if (!price) {
            chrome.storage.sync.set({'priceLowerPermission': false}, function () {
                document.getElementById('priceLowerPermission').checked = false;
                document.getElementById('priceLower').disabled = true;
                document.getElementById('priceLower').value = "";
            });
        }
    });
}

function changeNotificationHigherPermission(e) {
    chrome.storage.sync.set({'priceHigherPermission': e.target.checked}, function () {
        document.getElementById('priceHigher').disabled = !e.target.checked;
    });
}

function changeNotificationLowerPermission(e) {
    chrome.storage.sync.set({'priceLowerPermission': e.target.checked}, function () {
        document.getElementById('priceLower').disabled = !e.target.checked;
    });
}

function changeNotificationPermission(e) {
    chrome.storage.sync.set({'notificationPermission': e.target.checked}, () => {
        enableFields(e.target.checked);
        console.log('Notification ' + (e.target.checked ? 'Enabled' : 'Disabled'));
    });
}

function enableFields(enable) {
    let inputs = document.getElementsByTagName('input');

    document.getElementById('priceHigher').disabled = !document.getElementById('priceHigherPermission').checked;
    document.getElementById('priceLower').disabled = !document.getElementById('priceLowerPermission').checked;
    for(let i = 0; i < inputs.length; i++) {
        if (inputs[i].name !== 'notificationPermission' && (inputs[i].type !== 'number' || (inputs[i].type === 'number' && !enable))) {
            inputs[i].disabled = !enable;
        }
    }
    document.getElementsByClassName('notification-panel')[0].classList.toggle('disabled', !enable);
}

function saveAudioPermission(e) {
    chrome.storage.sync.set({'audioPermission': e.target.checked}, () => {
        console.log('Audio ' + (e.target.checked ? 'Enabled' : 'Disabled'));
    });
}

var btnCopy = document.getElementById('btCopy');

btnCopy.addEventListener('mouseover', function () {
  document.getElementById('address').classList.add('shadow');
});

btnCopy.addEventListener('click', function () {
  let txt = document.createElement('textarea');
  document.body.appendChild(txt);
  txt.value = WALLET_ADDRESS;
  txt.focus();
  txt.select();
  document.execCommand('copy');
  txt.remove();
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied!";
});

document.getElementById('btCopy').addEventListener('mouseout', function () {
  document.getElementById('address').classList.remove('shadow');
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy";
});
