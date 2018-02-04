
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
