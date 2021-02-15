'use strict'
const fetch = require('node-fetch');


function updateCacheWebhook(features, webhookUrl) {
    console.log(typeof(features));
    console.log(webhookUrl);

    let options = {
        method: 'put',
        body: JSON.stringify(features),
        headers: { 
            'Content-Type': 'application/json'
        },
    }

    fetch(webhookUrl, options)
        .then(res => res.json())
        .then(json => console.log(json));
}

const mapCasWithEnvWebhookUrls = {
    'haptik': {
        'prestaging': '',
        'staging': '',
        'production': '',
        'development': 'https://devparvez.hellohaptik.com/update_cache_webhook',
    }
}

module.exports = {
    updateCacheWebhook: updateCacheWebhook,
    mapCasWithEnvWebhookUrls: mapCasWithEnvWebhookUrls
}

