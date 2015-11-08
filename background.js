var enabled = false;

// Toggle YouMute functionality on/off when the user clicks 
// on the extension button in the toolbar.
chrome.browserAction.onClicked.addListener( function( tab ) {

    var action;

    if ( enabled ){
        action = 'teardown';
    } else {
        action = 'setup';
    }
    
    enabled = !enabled;

    chrome.tabs.executeScript({
        code: 'youMute.' + action + '();'
    });

});
