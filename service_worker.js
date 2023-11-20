
// TODO: Should we have a reset button to clear out settings values from disk?

var settings = [ 
        { 
            key: 'muteAdsEnabled',
            type: 'boolean',
            value: true,
            title: 'Automatically mute and skip video ads',
            desc: 'Obnoxious video ads with loud audio will be muted and automatically skipped as soon as possible.'
        },
        { 
            key: 'hideAnnotationsEnabled',
            type: 'boolean',
            value: true,
            title: 'Automatically hide annotations',
            desc: 'Boxes that popup over top of the video will automatically be hidden including author annotations along with any subscribe buttons and video recommendation buttons.'
        },
        { 
            key: 'hideBannerAdsEnabled',
            type: 'boolean',
            value: true,
            title: 'Automatically hide banner ads',
            desc: 'Banner ads that popup over top of the video will automatically be hidden.'
        } 
   ];

function loadStorageData(){
    return new Promise( function ( resolve, reject ){
        chrome.storage.sync.get( null, function( storageData ){
            resolve( storageData );
        });
    });
}

function saveStorageData(){
    chrome.storage.sync.set( { settings: settings } );
}

loadStorageData().then(function( storageData ){
    storageData = storageData || {};

    if ( storageData.settings ){
        settings = storageData.settings;
    } else {
        // save the settings to persist through restarts
        saveStorageData();
    }

    // listen for messages coming from the other contexts (popup, contentscripts)
    chrome.runtime.onMessage.addListener(function( message, sender, callback ){

        if ( message.name == 'getSettings' ){
            callback( settings );
        }

        if ( message.name == 'updateSetting' ){
            var key = message.settingKey;

            for ( var i = 0; i < settings.length; i++ ){
                var setting = settings[ i ];

                if ( setting.key == key ){
                    settings[ i ].value = message.settingValue;
                }
            }

            saveStorageData();

            // This was temporarily changed to chrome.tabs.query to apply the settings across
            // every open tab. That was nice for keeping settings in sync across tabs, but
            // unfortunately it required the `tabs` permission to operate successfully. This
            // permsion comes across to the user as "Read your browsing history".
            //
            // That felt too intrusive for what is likely a pretty big edge case of updating
            // settings while having multiple tabs open. If users do have that situation they
            // will have to refresh each tab after making a settings change.
            //
            chrome.scripting.executeScript( { code: 'youMute.updateSettings();' } );
        }
    });
});
