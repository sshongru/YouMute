//
// JavaScript that gets injected into the youtube.com page
//

function YouMute(){
    this.mutingAd = false;
    this.interval = null;
    this.enabledClassName = 'youMuteEnabled';
    this.adInProgressClassName = 'adInProgress';
    this.videoEle = document.getElementsByClassName( 'html5-main-video' )[ 0 ];
    this.bodyClassList = document.body.classList;
}

YouMute.prototype.setup = function(){
    this.checkForAd = this.checkForAd.bind( this );
    this.interval = setInterval( this.checkForAd, 100 );
    this.bodyClassList.add( this.enabledClassName );
}

YouMute.prototype.teardown = function(){
    this.adEnded();
    clearInterval( this.interval );
    this.bodyClassList.remove( this.enabledClassName );
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
    this.videoEle.muted = true;

    // keep trying to press the Skip Ad button
    var skipButton = document.getElementsByClassName( 'videoAdUiSkipButton' )[ 0 ];
    if ( skipButton ){
        skipButton.click();
    }

    this.bodyClassList.add( this.adInProgressClassName );
}

YouMute.prototype.adEnded = function(){
    this.videoEle.muted = false;
    this.bodyClassList.remove( this.adInProgressClassName );
}

var youMute = new YouMute();
