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
  // this is for the hexagon based viz
//  var points = [{x:5,y:Math.ceil(canvas.height / 2)}],
//      r = 5,
//      n = 6,
//      x,
//      y;
  var sampleAudioStream = function() {
    analyser.getByteFrequencyData(self.streamData);
    // calculate an overall volume value
    var total = 0;
    for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
      total += self.streamData[i];
    }
    self.volume = total;
//    console.log(self.volume);
//    console.log(self.streamData[0]);
    var draw = function() {
      //for all but disc
      for(bin = 0; bin < self.streamData.length; bin ++) {
        //for disc
//      for(bin = 0; bin < self.streamData.length; bin +=3) {
            
        var val = self.streamData[bin];
            
        //line based
//        var red = val;
//        var green = 0;
//        var blue = 255 - val;
//        context.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
            
        //line based 2
        var h = Math.floor((self.volume / 66.667));
        var s = Math.floor(val / 2.55); //0 none 100 full
        var l = 50;
        var a = 1;
        context.fillStyle = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
            
        //for both line based
        context.fillRect(bin * 4, 270 - val, 3, 270);
            
        //arc based 1
//        var red = val;
//        var green = 0;
//        var blue = 0;
//        context.beginPath();
//        context.arc(10,canvas.height/2,bin*2, 0 , (val / 177.5),false);
//        context.lineWidth = 2;
//        context.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//        context.stroke();
//        context.beginPath();
//        context.arc(10,canvas.height/2,bin*2, 0, (Math.PI * 2) - (val / 177.5),true);
//        context.lineWidth = 2;
//        context.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//        context.stroke();
            
            
        //arc based 2
//        var h = Math.floor((self.volume / 66.667));
//        var s = Math.floor(val / 2.55); //0 none 100 full
//        var l = Math.floor(val / 2.55);
//        var a = 1;
//        context.beginPath();
//        context.arc(10,canvas.height/2,bin*2, 0 , (val / 177.5),false);
//        context.lineWidth = 2;
//        context.strokeStyle = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
//        context.stroke();
//        context.beginPath();
//        context.arc(10,canvas.height/2,bin*2, 0, (Math.PI * 2) - (val / 177.5),true);
//        context.lineWidth = 2;
//        context.strokeStyle = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
//        context.stroke();
            
        //disc
//        var h = Math.floor((self.volume / 66.667));
//        var s = Math.floor(val / 2.55); //0 none 100 full
//        var l = Math.floor(val / 2.55);
//        var a = 1;
//        context.beginPath();
//        context.arc(canvas.width/2,canvas.height/2,(bin/3)*2+25, 0 , Math.PI*2,false);
//        context.lineWidth = 3;
//        context.strokeStyle = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
//        context.stroke();
            
        //hexagon based  - this sucks currently
//        var green = val;
//        context.lineWidth = 4;
//        context.lineCap = 'round';
//        context.shadowColor = '#000';
//        context.shadowBlur= 16;
//        context.fillStyle = 'rgba(0,0,0,.5)';
//        context.moveTo(points[0].x, points[0].y);
//
//        context.beginPath();
//        context.fillStyle = 'rgb(0,' + green + ',0)';
//        for (var i = 0; i < n + 1; i++) {
//          x = Math.round(points[bin].x + r * Math.cos(2 * Math.PI * i / n));
//          y = Math.round(points[bin].y + r * Math.sin(2 * Math.PI * i / n));
//          context.lineTo(x, y);
//          if (i === 0) {
//
//            points.push({x:x, y:y});
//
//            points.push({x:x, y:Math.sin(x*3)*5+(canvas.height/2)});
//
//            if (bin === Math.round(self.streamData.length / 2)) {
//              points.push({x:0, y:Math.sin(x*5)*35+(canvas.height/2)});
//            } else if (bin < Math.round(self.streamData.length / 2)) {
//              points.push({x:x, y:Math.sin(x*5)*35+(canvas.height/2)});
//            } else {
//              points.push({x:x, y:(Math.sin(x*5)*35+(canvas.height/2))+15});
//            }
//          }
//        }
//        context.fill();
      }
    }
    var clear = function() {
      context.fillStyle = 'rgb(0,0,0)';
      context.fillRect(0,0,canvas.width,canvas.height);
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
//  loader.loadStream('https://soundcloud.com/chris_brown/chris-brown-x-tyga-ayo', function() {
//    audioSource.playStream(loader.streamUrl());
//  });
  loader.loadStream('https://soundcloud.com/monstercat/fool-keep-on-rocking', function() {
    audioSource.playStream(loader.streamUrl());
  });
}