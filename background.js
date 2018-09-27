// TEsting:
// Pre roll: https://www.youtube.com/watch?v=3tUCuMSPQwE
// Unskippable preroll: https://www.youtube.com/watch?v=wnJ6LuUFpMo


// TODO: Should we have a reset button to clear out settings values from disk?

// TODO: After first reading from disk analyze the settings to see if any need to be added
//       before wholesale replacing this object.

var modelVersion = 1;

var settings = [ 
        {
            key: 'adVolume',
            type: 'enum',
            value: '0',
            possibleValues: [
                { value: '0', label: 'Muted' },
                { value: '30', label: 'Quiet' },
                { value: '100', label: 'Disabled' }
            ],
            title: 'Automatically lower video ad volume',
            desc: 'Change the volume of videos while ads are playing.'
        },
        {
            key: 'autoSkipWaitTime',
            type: 'enum',
            value: '0',
            possibleValues: [
                { value: '0', label: 'As soon as possible' },
                { value: '15', label: 'After at least 15 seconds' },
                { value: '30', label: 'After at least 30 seconds' }
            ],
            title: 'Automatically click skip ad button',
            desc: 'When to automatically click the skip ad button.'
        },
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
    chrome.storage.sync.set( { modelVersion: modelVersion, settings: settings } );
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
            console.log( 'updateSetting', message );
            var key = message.settingKey;

            for ( var i = 0; i < settings.length; i++ ){
                var setting = settings[ i ];

                if ( setting.key == key ){
                    settings[ i ].value = message.settingValue;
                }
            }

            saveStorageData();

            chrome.tabs.query( {}, function ( tabs ) {
                var manifest = chrome.runtime.getManifest();
                var validInjectURL = manifest.content_scripts[ 0 ].matches[ 0 ].slice( 0, -1 );

                // update settings on relevant tabs
                for ( var i = 0; i < tabs.length; i++ ){
                    var tab = tabs [ i ];

                    if ( tab.url.indexOf( validInjectURL ) === 0 ){
                        chrome.tabs.executeScript( tab.id, { code: 'if ( youMute ){ youMute.updateSettings(); }' }, function( result ){
                            var lastError = chrome.runtime.lastError;
                            if ( lastError ){
                                console.error( lastError );
                            }
                        });
                    }
                }
            });
        }
    });
});
