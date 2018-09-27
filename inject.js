//
// JavaScript that gets injected into the youtube.com page
//

function YouMute(){
    this.mutingAd = false;
    this.interval = null;
    this.adInProgressClassName = 'adInProgress';
    this.adVolume = 0;

// TODO:  rename to minimumAdDurationBeforeSkip?
    this.autoSkipWaitTime = 0;

    // TODO: Iss this still needed?
    this.adStartTime = null;
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
            var settings = response;

            for ( var i = 0, l = settings.length; i < l; i++ ){
                var setting = settings[ i ];

                if ( setting.value === true ){
                    outer.htmlClassList.add( setting.key );
                } else {
                    outer.htmlClassList.remove( setting.key );
                }

                // setup/teardown the logic that watches for video ads to mute
                if ( setting.key == 'muteAdsEnabled' ){
                    if ( setting.value === true ){
                        if ( !outer.interval ){
                            outer.startWatchingForVideoAd();
                        }
                    } else {
                        if ( outer.interval ){
                            outer.stopWatchingForVideoAd();
                        }
                    }
                }

                if ( setting.key == 'adVolume' ){
                    var volume = parseInt( setting.value );
                    if ( isNaN( volume ) ){
                        volume = 0;
                    }
                    outer.adVolume = volume / 100;
                }

                if ( setting.key == 'autoSkipWaitTime' ){
                    var skipTime = parseInt( setting.value );
                    outer.autoSkipWaitTime = skipTime;
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


/*
 * Returns the amount of time required by YouTube before skipping
 */
YouMute.prototype.getRemainingTime = function(){
    var videoAdUiPreSkipText = document.getElementsByClassName( 'videoAdUiPreSkipText' )[ 0 ];
    var remainingTime = 0;

    if ( !videoAdUiPreSkipText ){
        // can't skip this ad so grab how many seconds are left in it
        var adDurationRemainingElement = document.getElementsByClassName( 'ytp-ad-duration-remaining' )[ 0 ];
        remainingTime = this.convertTimeToSeconds( adDurationRemainingElement.innerText );
    } else {
        // can skip this ad so grab how many seconds until you can click the Skip Ad button
        remainingTime = videoAdUiPreSkipText.innerText.split( ' ' ).pop();
        // TODO: Need to convert to int??
    }

    console.log( 'getRemainingTime', remainingTime );

    return remainingTime;
}

YouMute.prototype.getRemainingWaitTime = function(){
    var durationElement = document.getElementsByClassName( 'ytp-time-duration' )[ 0 ];
    var duration = this.convertTimeToSeconds( durationElement.innerText );

    var adDurationRemainingElement = document.getElementsByClassName( 'ytp-ad-duration-remaining' )[ 0 ];
    var adElapsedSeconds = duration - this.convertTimeToSeconds( adDurationRemainingElement.innerText );

    if ( this.autoSkipWaitTime < adElapsedSeconds ){
        return this.getRemainingTime();
    } else {
        return this.autoSkipWaitTime - adElapsedSeconds;
    }
}

// TODO: Can we kill this off in favor of getRemwaittitme?
YouMute.prototype.sufficientWaitTimeHasElapsed = function(){
    var adElapsedElement = document.getElementsByClassName( 'ytp-time-current' )[ 0 ];
    var adElapsedSeconds = this.convertTimeToSeconds( adElapsedElement.textContent );

    if ( adElapsedSeconds > this.autoSkipWaitTime ){
        return true;
    }
    return false;
}

/*
 * Returns a number between 0 and 1 that represents a volume percentage
 */
YouMute.prototype.getNormalVolume = function(){
    var volumePanel = document.querySelector( '.ytp-volume-panel' );
    var volumeText = volumePanel.getAttribute( 'aria-valuetext' ); // looks like '10% volume muted'
    
    var muted = volumeText.indexOf( 'muted' ) >= 0;
    var percentRegex = /([0-9.]+)%/;
    var found = volumeText.match( percentRegex );
    var volumeLevel = parseInt( found[ 1 ] ); // captured regex value
    
    if ( isNaN( volumeLevel ) ){
        volumeLevel = 100;
    }

    if ( muted ){
        volumeLevel = 0;
    }

    return volumeLevel / 100;
}

/*
 * Converts a string in the format of MM:SS (ex: "01:35") to the number of seconds
 */
YouMute.prototype.convertTimeToSeconds = function( timeString ){
    var parts = timeString.split( ':' );
    var seconds = ( 60 * parseInt( parts[ 0 ] ) ) + parseInt( parts[ 1 ] );
    console.log( 'convertTimeToSeconds', timeString, seconds );
    return seconds;
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

    // track the start time
    if ( !this.adStartTime ){
        this.adStartTime = Date.now();
    }

    this.getVideoElement().volume = this.adVolume;

    // show the time remaining before the ad can be skipped
    var player = document.getElementsByClassName( 'html5-video-player' )[ 0 ];
    var remainingTime = this.getRemainingWaitTime();

    if ( isNaN( remainingTime ) ){
        remainingTime = 0;
    }

    player.setAttribute( 'data-timeRemaining', remainingTime || '' );

    // only auto click after wait time has elapsed
    if ( remainingTime <= 0 ){
        // keep trying to press the "Skip Ad" button
        var skipButton = document.getElementsByClassName( 'videoAdUiSkipButton' )[ 0 ];
        if ( skipButton ){
            skipButton.click();
        }
    }

    this.htmlClassList.add( this.adInProgressClassName );
}

YouMute.prototype.adEnded = function(){
    this.adStartTime = null;
    this.getVideoElement().volume = this.getNormalVolume();
    this.htmlClassList.remove( this.adInProgressClassName );
}

var youMute = new YouMute();
youMute.updateSettings();
