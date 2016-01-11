
function updateSetting( event ){
    // tell background.js to save the new setting value
    var target = event.target;
    chrome.runtime.sendMessage( null, { name: 'updateSetting', settingKey: target.name, settingValue: target.checked });
}

// get the list of settings when the popup is first shown
chrome.runtime.sendMessage( null, { name: 'getSettings' }, null, function( response ){
    if ( response ){
        var settings = JSON.parse( response );

        for ( var i = 0; i < settings.length; i++ ){
            var setting = settings[ i ];
            var checked = ( setting.value == 'true' ) ? 'checked' : '';

            var s = '';
            s += '<div class="setting">';
            s += '  <input type="checkbox" name="' + setting.key + '" id="' + setting.key + '" ' + checked + '>';
            s += '  <label for="' + setting.key + '">' + setting.title + '</label>';
            s += '  <p>' + setting.desc + '</p>';
            s += '</div>';

            document.getElementById( 'settings' ).innerHTML += s;
        }

        var checkboxes = document.querySelectorAll( '.setting input' );

        for ( var i = 0; i < checkboxes.length; i++ ){
            checkboxes[ i ].addEventListener( 'change', updateSetting );
        }
    }
});