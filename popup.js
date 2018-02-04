
function updateSetting( event ){
    // tell background.js to save the new setting value
    var target = event.target;
    var message = { name: 'updateSetting', settingKey: target.name, settingValue: target.checked };
    chrome.runtime.sendMessage( null, message );
}

function createBooleanField( setting ){
    var div = document.createElement( 'div' );
    div.className = 'setting';

    var input = document.createElement( 'input' );
    input.type = 'checkbox';
    input.name = setting.key;
    input.id = setting.key;
    input.checked = setting.value;
    input.addEventListener( 'change', updateSetting );

    var label = document.createElement( 'label' );
    label.setAttribute( 'for', setting.key );
    label.textContent = setting.title;

    var p = document.createElement( 'p' );
    p.textContent = setting.desc;
    
    div.appendChild( input );
    div.appendChild( label );
    div.appendChild( p );

    return div;
}

function createEnumField( setting ){
    // TODO
}

// get the list of settings when the popup is first shown
chrome.runtime.sendMessage( null, { name: 'getSettings' }, null, function( response ){
    if ( response ){
        var settings = response;
        var settingsDiv = document.getElementById( 'settings' );

        for ( var i = 0; i < settings.length; i++ ){
            var setting = settings[ i ];
            var field;

            switch ( setting.type ){
                case 'boolean':
                    field = createBooleanField( setting );
                    break;
                case 'enum':
                    field = createEnumField( setting );
                    break;
            }

            settingsDiv.appendChild( field );
        }
    }
});