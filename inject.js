//
// JavaScript that gets injected into the youtube.com page
//

function YouMute(){
    this.mutingAd = false;
    this.interval = null;
    this.adInProgressClassName = 'adInProgress';
    this.htmlClassList = document.body.parentElement.classList;
}

YouMute.prototype.startWatchingForVideoAd = function(){
    this.checkForAd = this.checkForAd.bind( this );
    this.interval = setInterval( this.checkForAd, 100 );
}

YouMute.prototype.stopWatchingForVideoAd = function(){
    this.adEnded();
    clearInterval( this.interval );
    this.interval = null;
}

YouMute.prototype.updateSettings = function(){
    console.log( 'Update YouMute Settings' );
    var outer = this;

    // ask background.js for the latest settings values
    chrome.runtime.sendMessage( null, { name: 'getSettings' }, null, function( response ){
        if ( response ){
            var settings = JSON.parse( response );

            for ( var i = 0, l = settings.length; i < l; i++ ){
                var setting = settings[ i ];

                if ( setting.value == 'true' ){
                    outer.htmlClassList.add( setting.key );
                } else {
                    outer.htmlClassList.remove( setting.key );
                }

                // setup/teardown the logic that watches for video ads to mute
                if ( setting.key == 'muteAdsEnabled' ){
                    if ( setting.value == 'true' ){
                        if ( !outer.interval ){
                            outer.startWatchingForVideoAd();
                        }
                    } else {
                        if ( outer.interval ){
                            outer.stopWatchingForVideoAd();
                        }
                    }
                }
            }
        }
    });
}

YouMute.prototype.getVideoElement = function(){
    // Cache the video element so we don't have to look it up on every tick.
    // YouTube might remove the element when navigating between videos so
    // make sure we look for the latest if it doesn't exist.
    if ( !this.videoEle ){
        this.videoEle = document.getElementsByClassName( 'html5-main-video' )[ 0 ];
    }
    return this.videoEle;
}

YouMute.prototype.getRemainingTime = function(){
    var videoAdUiPreSkipText = document.getElementsByClassName( 'videoAdUiPreSkipText' )[ 0 ];
    var remainingTime = 0;

    if ( !videoAdUiPreSkipText ){
        // can't skip this ad so grab how many seconds are left in it
        var videoAdUiAttribution = document.getElementsByClassName( 'videoAdUiAttribution' )[ 0 ];
        var parts = videoAdUiAttribution.innerText.split( ' ' ).pop().split( ':' );
        var minutes = parts[ 0 ];
        var seconds = parts[ 1 ];

        remainingTime = ( 60 * parseInt( minutes ) ) + parseInt( seconds );
    } else {
        // can skip this ad so grab how many seconds until you can click the Skip Ad button
        remainingTime = videoAdUiPreSkipText.innerText.split( ' ' ).pop();
    }

    return remainingTime;
}

YouMute.prototype.checkForAd = function( event ){
    var ad = document.getElementsByClassName( 'ad-interrupting' )[ 0 ];

    if ( ad ){
        // continuously call this while the ad is up
        this.adInProgress();
        this.mutingAd = true;
    } else {
        if ( this.mutingAd ){
            // stop muting
            this.adEnded();
            this.mutingAd = false;
        }
    }
}

YouMute.prototype.adInProgress = function(){
    this.getVideoElement().muted = true;

    // show the time remaining before the ad can be skipped
    var player = document.getElementsByClassName( 'html5-video-player' )[ 0 ];
    var remainingTime = this.getRemainingTime();

    if ( isNaN( remainingTime ) ){
        remainingTime = '';
    }

    player.setAttribute( 'data-timeRemaining', remainingTime );

    // keep trying to press the Skip Ad button
    var skipButton = document.getElementsByClassName( 'videoAdUiSkipButton' )[ 0 ];
    if ( skipButton ){
        skipButton.click();
    }

    this.htmlClassList.add( this.adInProgressClassName );
}

YouMute.prototype.adEnded = function(){
    this.getVideoElement().muted = false;

    this.htmlClassList.remove( this.adInProgressClassName );
}

var youMute = new YouMute();
youMute.updateSettings();
