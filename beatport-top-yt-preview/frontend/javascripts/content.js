import Base from './base';
/* global YT */
class Content extends Base {
  constructor(tracks) {
    super();

    this.element = {
      content: document.getElementById('content'),
      video: document.getElementById('video'),
      playlist: document.getElementById('playlist'),
    };

    this.mediaQuery = window.matchMedia('(max-width: 600px)');
    this.playlistTracks = [];
    this.player = null;
    this.videoOverlay = null;
    
    this.isPlayerInitBuffered = false;
    this.isShuffle = false;
    this.initShuffle = false;
    this.clickedNodeIdx = -1;
    this.isRepeat = false;

    this.adjustDisplayMode();
    this._setPlayer(tracks);
    this._setEventListeners();
  }
  adjustDisplayMode() {
    if (this.mediaQuery.matches) {
      // Mobile mode (window max-width <= 600px)
      document.body.appendChild(this.element['playlist']);
    } else {
      // Desktop mode (window max-width > 600px)
      this.element['content'].appendChild(this.element['playlist']);
    }
  }
  _setPlayer(tracks) {
    if (!tracks || tracks.length <= 0) {
      console.log('Oops! Track data not found.');
      return;
    }
    this._initializePlayer(tracks);

    // Load Youtube player API
    let tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  _setEventListeners() {
    // Listen if matches the media query
    this.mediaQuery.addListener(this.adjustDisplayMode.bind(this));
  }
  _initializePlayer(tracks) {
    this.playlistTracks = tracks.filter((track) => track['video_id'] != null);
    let videoIds = this.playlistTracks.map((track) => track['video_id']);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube Iframe API Ready');
      this.player = new YT.Player('video-iframe', {
        height: '100%',
        width: '100%',
        events: {
          'onReady': window.onPlayerReady,
          'onStateChange': window.onPlayerStateChange,
          'onError': window.onPlayerError
        },
        playerVars: {
          playlist: videoIds.join(),
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          autoplay: 1,
          loop: 1,
          wmode: 'transparent',
          modestbranding: 1,
        },
      });
    };

    window.onPlayerReady = (event) => {
      if (!event || !event.target) {
        console.log('Youtube Player not Ready');
        return;
      }

      let playlistIdx = event.target.getPlaylistIndex();
      // console.log(playlistIdx);
      if (playlistIdx < 0) {
        console.log('Youtube Player\'s playlist not Ready, reloading...');
        location.reload();
        return;
      }
      console.log('Youtube Player Ready');

      this.playlistTracks.forEach((track, i) => {
        let {num, title, artists, imglink, video_id: videoId} = track;
        let artistsNode = document.createElement('div');
        artistsNode.innerHTML = artists;
        let titleNode = document.createElement('div');
        titleNode.setAttribute('class', 'title');
        titleNode.innerHTML = title;
        let rightNode = document.createElement('div');
        rightNode.setAttribute('class', 'right');
        rightNode.appendChild(titleNode);
        rightNode.appendChild(artistsNode);
        let leftNode = document.createElement('div');
        leftNode.setAttribute('class', 'left');
        let style = `background-image: url("${imglink}");background-size: cover;`;
        leftNode.setAttribute('style', style);
        let numNode = document.createElement('div');
        numNode.setAttribute('class', 'num');
        numNode.innerHTML = num;
        let trackNode = document.createElement('div');
        trackNode.setAttribute('class', 'track');
        trackNode.setAttribute('id', `${videoId}-${i}`);
        trackNode.appendChild(numNode);
        trackNode.appendChild(leftNode);
        trackNode.appendChild(rightNode);
        trackNode.addEventListener('touchend', (event) => {
          // Solution for Opera mini issue: loading stuck for the first time after touchended
          // Pass to click event listener
          if (!this.isPlayerInitBuffered) {
            return;
          }

          event.preventDefault();
          if (this.isShuffle) {
            if (this.initShuffle) {
              this.player.playVideoAt(this.shuffleIdxMap.get(i));
            } else {
              // Youtube playlist data is only updated when BUFFERING state start.
              // The variable shuffleIdxMap is not initialized for the first time.
              // So, record the index of the clicked node.
              this.clickedNodeIdx = i;
              // Call playing nextVideo to trigger buffering
              this.player.nextVideo();
            }
          } else {
            this.player.playVideoAt(i);
          }
        });
        trackNode.addEventListener('click', (event) => {
          event.preventDefault();
          if (this.isShuffle) {
            if (this.initShuffle) {
              this.player.playVideoAt(this.shuffleIdxMap.get(i));
            } else {
              this.clickedNodeIdx = i;
              this.player.nextVideo();
            }
          } else {
            this.player.playVideoAt(i);
          }
        });
        this.element['playlist'].appendChild(trackNode);
      });   
      
      // Add overlay after Youtube iframe generated
      this._initializeVideoOverlay();

      // Solution for Safari 11 issue: CUED state not emitted when Youtube API ready
      setInterval(() => {
        this.emit(Content.CUED);
      }, 1000);  
    };

    window.onPlayerStateChange = (event) => {
      // Clear timer
      if (this.player.timer) {
        clearInterval(this.player.timer);
      }

      let playerState = event.data;
      console.log(playerState);
      if (playerState == YT.PlayerState.BUFFERING) {
        if (this.isShuffle && !this.initShuffle) {
          this.setShuffleMap();
          if (this.clickedNodeIdx >= 0) {
            this.player.playVideoAt(this.shuffleIdxMap.get(this.clickedNodeIdx));
            this.clickedNodeIdx = -1;
            return;
          }
        }
        let playlistIdx = event.target.getPlaylistIndex();
        if (this.isShuffle) {
          playlistIdx = this.shuffleToOriginIdxMap.get(playlistIdx);
        }
        let track = this.playlistTracks[playlistIdx];
        let videoId = track['video_id'];
        let videoIds = this.playlistTracks.map((track) => track['video_id']);
        videoIds.forEach((id, i) => {
          document.getElementById(`${id}-${i}`).style.backgroundColor = (id==videoId && i==playlistIdx)? '#e6f596': '';
        });
        this.emit(Content.BUFFERING, track);
      } else if (playerState == -1) {
        // If state is unstarted for a while, set timer to play next video
        this.player.timer = setInterval(() => {
          this.player.nextVideo();
        }, 10000);
      } else if (playerState == YT.PlayerState.PLAYING) {
        this.emit(Content.PLAYING);
      } else if (playerState == YT.PlayerState.PAUSED) {
        this.emit(Content.PAUSED);
      } else if (playerState == YT.PlayerState.CUED) {
        this.emit(Content.CUED);
      } else if (playerState == YT.PlayerState.ENDED) {
        if (this.isRepeat) {
          this.player.stopVideo();
          this.player.previousVideo();
        }
      }
    };
    window.onPlayerError = (event) => {
      console.error(event);
    };
  }
  _initializeVideoOverlay() {
    let videoOverlay = document.createElement('div');
    videoOverlay.setAttribute('class', 'video-overlay');
    videoOverlay.setAttribute('id', 'video-overlay');
    this.element['video'].appendChild(videoOverlay);
    this.videoOverlay = document.getElementById('video-overlay');
    this.videoOverlay.addEventListener('touchend', (event) => {
      event.preventDefault();
      this.videoOverlay.removeAttribute('style');
      this.emit(Content.OVERLAY_CLICKED);
    });
    this.videoOverlay.addEventListener('click', (event) => {
      event.preventDefault();
      this.videoOverlay.removeAttribute('style');
      this.emit(Content.OVERLAY_CLICKED);
    });
  }
  openOverlay() {
    if (this.videoOverlay) {
      this.videoOverlay.style.display = 'block';
    }
  }
  hideOverlay() {
    if (this.videoOverlay) {
      this.videoOverlay.removeAttribute('style');
    }
  }
  setShuffleMap() {
    if (this.isShuffle && !this.initShuffle) {
      this.shuffleVideoIds = this.player.getPlaylist();
      let trackIdxMap = new Map();
      this.playlistTracks.forEach((track, i) => {
        let {video_id:videoId} = track;
        if (trackIdxMap.has(videoId)) {
          let arr = trackIdxMap.get(videoId);
          arr.push(i);
          trackIdxMap.set(videoId, arr);
        } else {
          trackIdxMap.set(videoId, [i]);
        }
      });
      this.shuffleToOriginIdxMap = new Map();
      for (let index = this.shuffleVideoIds.length - 1; index >= 0; index--) {
        let videoId = this.shuffleVideoIds[index];
        this.shuffleToOriginIdxMap.set(index, trackIdxMap.get(videoId).pop());
      }
      this.shuffleIdxMap = new Map();
      for (const [key, value] of this.shuffleToOriginIdxMap.entries()) {
        this.shuffleIdxMap.set(value, key);
      }
      this.initShuffle = true;
    }
  }
}
Content.OVERLAY_CLICKED = Symbol();
Content.BUFFERING = Symbol();
Content.PLAYING = Symbol();
Content.PAUSED = Symbol();
Content.CUED = Symbol();
export default Content;