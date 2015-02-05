/**
 * SoundCloud.js
 * Taken from the awesome work done by Michael Bromley.
 * https://github.com/michaelbromley/soundcloud-visualizer
 */

/**
 * The *AudioSource object creates an analyzer node, sets up a repeating function with setInterval
 * which samples the input and turns it into an FFT array. The object has two properties:
 * streamData - this is the Uint8Array containing the FFT data
 * volume - cumulative value of all the bins of the streaData.
 *
 * The MicrophoneAudioSource uses the getUserMedia interface to get real-time data from the user's microphone. Not used currently but included for possible future use.
 */
var SoundCloudAudioSource = function(player) {
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');
    var centerX = Math.ceil(canvas.width / 2);
    var centerY = Math.ceil(canvas.height / 2);
    var sampleAudioStream = function() {
        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += self.streamData[i];
        }
        self.volume = total;
//        console.log(self.volume);
//        console.log(self.streamData[0]);
        var draw = function() {
          for(bin = 0; bin < self.streamData.length; bin ++) {
            var val = self.streamData[bin];
            
            //line based
            var red = 0;
            var green = 255 - val;
            var blue = val;
            context.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
            context.fillRect(bin * 4, 270 - val, 3, 270);
            
            //arc based
//            var red = 0;
//            var green = val;
//            var blue = 0;
//            context.beginPath();
//            context.arc(10,centerY,bin*2, 0 , (val / 177.5),false);
//            context.lineWidth = 2;
//            context.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//            context.stroke();
//            context.beginPath();
//            context.arc(10,centerY,bin*2, 0, (Math.PI * 2) - (val / 177.5),true);
//            context.lineWidth = 2;
//            context.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//            context.stroke();

          }
        }
        var clear = function() {
          context.fillStyle = 'rgb(0,0,0)';
          context.fillRect(0,0,400,270);
        }
        clear();
        draw();
    };
    setInterval(sampleAudioStream, 20);
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128);
    this.playStream = function(streamUrl) {
        // get the input stream from the audio element
        player.addEventListener('ended', function(){
            self.directStream('coasting');
        });
        player.setAttribute('src', streamUrl);
        player.play();
    };
};

/**
 * Makes a request to the Soundcloud API and returns the JSON data.
 */
var SoundcloudLoader = function() {
    var self = this;
    var client_id = "006020660a30b6e713571597a6fe2fb6"; // to get an ID go to http://developers.soundcloud.com/
    this.sound = {};
    this.streamUrl = "";
    this.errorMessage = "";

    this.player = document.querySelector('#sc');
    this.player.setAttribute('controls', '');
    this.player.setAttribute('autoplay', '');
    this.player.setAttribute('preload', '');
    this.player.setAttribute('autobuffer', '');

    /**
     * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
     * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
     * @param track_url
     * @param callback
     */
    this.loadStream = function(track_url, successCallback, errorCallback) {
        SC.initialize({
            client_id: client_id
        });
        SC.get('/resolve', { url: track_url }, function(sound) {
            if (sound.errors) {
                self.errorMessage = "";
                for (var i = 0; i < sound.errors.length; i++) {
                    self.errorMessage += sound.errors[i].error_message + '<br>';
                }
                self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
                errorCallback();
            } else {

                if(sound.kind=="playlist"){
                    self.sound = sound;
                    self.streamPlaylistIndex = 0;
                    self.streamUrl = function(){
                        return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
                    };
                    successCallback();
                }else{
                    self.sound = sound;
                    self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
                    successCallback();
                }
            }
        });
    };


    this.directStream = function(direction){
        if(direction=='toggle'){
            if (this.player.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        else if(this.sound.kind=="playlist"){
            if(direction=='coasting') {
                this.streamPlaylistIndex++;
            }else if(direction=='forward') {
                if(this.streamPlaylistIndex>=this.sound.track_count-1) this.streamPlaylistIndex = 0;
                else this.streamPlaylistIndex++;
            }else{
                if(this.streamPlaylistIndex<=0) this.streamPlaylistIndex = this.sound.track_count-1;
                else this.streamPlaylistIndex--;
            }
            if(this.streamPlaylistIndex>=0 && this.streamPlaylistIndex<=this.sound.track_count-1) {
               this.player.setAttribute('src',this.streamUrl());
               this.player.play();
            }
        }
    };
};
window.onload = function init() {
  var player =  document.getElementById('sc');
  var loader = new SoundcloudLoader(player);
  var audioSource = new SoundCloudAudioSource(player);
  var loadAndUpdate = function(trackUrl) {
    loader.loadStream(trackUrl, function() {
      audioSource.playStream(loader.streamUrl());
    });
  };
  document.querySelector('#sc-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var trackUrl = document.querySelector('#sc-src').value;
    loadAndUpdate(trackUrl);
  });

  //this is the default song/playlist that will play
  loader.loadStream('https://soundcloud.com/monstercat/lets-be-friends-manslaughter', function() {
    audioSource.playStream(loader.streamUrl());
  });
//  loader.loadStream('https://soundcloud.com/flume/hyperparadise-flume-remix', function() {
//    audioSource.playStream(loader.streamUrl());
//  });
}