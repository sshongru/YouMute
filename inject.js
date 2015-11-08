//
// JavaScript that gets injected into the youtube.com page
//

function YouMute(){
    this.mutingAd = false;
    this.interval = null;
    this.enabledClassName = 'youMuteEnabled';
    this.adInProgressClassName = 'adInProgress';
    this.htmlClassList = document.body.parentElement.classList;
}

YouMute.prototype.setup = function(){
    console.log( 'YouMute setup' );
    this.checkForAd = this.checkForAd.bind( this );
    this.interval = setInterval( this.checkForAd, 100 );
    this.htmlClassList.add( this.enabledClassName );
}

YouMute.prototype.teardown = function(){
    console.log( 'YouMute teardown' );
    this.adEnded();
    clearInterval( this.interval );
    this.htmlClassList.remove( this.enabledClassName );
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
youMute.setup();