
var settings = [ 
                    { 
                        key: 'muteAdsEnabled', 
                        defaultValue: true, 
                        title: 'Automatically mute and skip video ads', 
                        desc: 'Obnoxious video ads with loud audio will be muted and automatically skipped as soon as possible.' 
                    },
                    { 
                        key: 'hideAnnotationsEnabled', 
                        defaultValue: true, 
                        title: 'Automatically hide annotations', 
                        desc: 'Boxes that popup over top of the video will automatically be hidden including author annotations along with any subscribe buttons and video recommendation buttons.' 
                    },
                    { 
                        key: 'hideBannerAdsEnabled', 
                        defaultValue: true, 
                        title: 'Automatically hide banner ads', 
                        desc: 'Banner ads that popup over top of the video will automatically be hidden.'
                    } 
               ];

// save the default settings values to local storage
for ( var i = 0; i < settings.length; i++ ){
    var setting = settings[ i ];
    localStorage.setItem( settings.key, settings.defaultValue );
}

function getSettings(){
    // get the latest setting values from local storage
    for ( var i = 0; i < settings.length; i++ ){
        settings[ i ].value = localStorage.getItem( settings[ i ].key );
    }

    return settings;
}

chrome.runtime.onMessage.addListener(function( message, sender, callback ){
    if ( message.name == 'getSettings' ){
        if ( callback ){
            callback( JSON.stringify( getSettings() ) );
        }
    }

    if ( message.name == 'updateSetting' ){
        localStorage.setItem( message.settingKey, message.settingValue );
        chrome.tabs.executeScript( { code: 'youMute.updateSettings();' } );
    }
});
