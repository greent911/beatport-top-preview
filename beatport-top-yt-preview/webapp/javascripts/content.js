import Base from './base';
import ajaxRequest from './ajaxRequest';
/* global YT */
class Content extends Base {
  constructor() {
    super();
    this.element = {
      content: document.getElementById('content'),
      ytplayer: document.getElementById('yt-player'),
      playlist: document.getElementById('playlist'),
    };
    this.overlay = null;
    this.isPlayerInitBuffered = false;
    this.isShuffle = false;
    this.initShuffle = false;
    this.clickedNodeIdx = -1;
    this.isRepeat = false;
    this.videoIdsString = '';
    this.currentTracks = [];
    this._initLayout();
    this.listen();
  }
  listen() {
    this._initListener();
  }
  _setLayoutMode(condition) {
    if (condition.matches) {
      document.body.appendChild(this.element['playlist']);
    } else {
      this.element['content'].appendChild(this.element['playlist']);
    }
  }
  _initLayout() {
    let condition = window.matchMedia('(max-width: 600px)');
    this._setLayoutMode(condition);
    condition.addListener(this._setLayoutMode.bind(this, condition));
  }
  _initListener() {
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube Iframe API Ready');
      this.player = new YT.Player('yt-player-inner', {
        height: '100%',
        width: '100%',
        events: {
          'onReady': window.onPlayerReady,
          'onStateChange': window.onPlayerStateChange,
          'onError': window.onPlayerError
        },
        playerVars: {
          playlist: this.videoIdsString,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          autoplay: 1,
          loop: 1,
          wmode: 'transparent',
          modestbranding: 1,
        },
      });
      this.player.currentTracks = this.currentTracks;
    };
    window.onPlayerReady = (event) => {
      console.log('Youtube Player Ready');
      if (event.target && this.player.currentTracks) {
        let playlistIdx = event.target.getPlaylistIndex();
        // console.log(playlistIdx);
        if (playlistIdx < 0) {
          location.reload();
        } else {
          // console.log(this.player.currentTracks);
          this.player.currentTracks.forEach((track, i) => {
            let {num, title, artists, imglink, video_id:videoId} = track;
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
            let style = 'background-image: url("' + imglink + '");background-size: cover;';
            leftNode.setAttribute('style', style);
            let numNode = document.createElement('div');
            numNode.setAttribute('class', 'num');
            numNode.innerHTML = num;
            let trackNode = document.createElement('div');
            trackNode.setAttribute('class', 'track');
            trackNode.setAttribute('id', videoId + '-' + i);
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
                  // Youtube playlist data is only updated when buffering.
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
          // Solution for Safari 11 issue: CUED status not emitted when Youtube API ready
          setInterval(() => {
            this.emit(Content.CUED);
          }, 1000);
        }
      }
      // Add overlay after Youtube iframe generated
      let ytoverlay = document.createElement('div');
      ytoverlay.setAttribute('class', 'yt-overlay');
      ytoverlay.setAttribute('id', 'yt-overlay');
      this.element['ytplayer'].appendChild(ytoverlay);
      this.overlay = document.getElementById('yt-overlay');
      this.overlay.addEventListener('touchend', (event) => {
        event.preventDefault();
        this.overlay.removeAttribute('style');
        this.emit(Content.OVERLAY_CLICKED);
      });
      this.overlay.addEventListener('click', (event) => {
        event.preventDefault();
        this.overlay.removeAttribute('style');
        this.emit(Content.OVERLAY_CLICKED);
      });
    };
    window.onPlayerStateChange = (event) => {
      if (this.player.timer) {
        clearInterval(this.player.timer);
      }
      let playerStatus = event.data;
      console.log(playerStatus);
      if (playerStatus == YT.PlayerState.BUFFERING) {
        if (event.target && this.player.currentTracks) {
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
          let track = this.player.currentTracks[playlistIdx];
          let videoId = track['video_id'];
          let videoIds = this.player.currentTracks.map((track) => track['video_id']);
          videoIds.forEach((id, i) => {
            document.getElementById(id + '-' + i).style.backgroundColor = (id==videoId && i==playlistIdx)? '#e6f596': '';
          });
          this.emit(Content.BUFFERING, track);
        }
      } else if (playerStatus == -1) {
        this.player.timer = setInterval(() => {
          this.player.nextVideo();
        }, 10000);
      } else if (playerStatus == YT.PlayerState.PLAYING) {
        this.emit(Content.PLAYING);
      } else if (playerStatus == YT.PlayerState.PAUSED) {
        this.emit(Content.PAUSED);
      } else if (playerStatus == YT.PlayerState.CUED) {
        this.emit(Content.CUED);
      } else if (playerStatus == YT.PlayerState.ENDED) {
        if (this.isRepeat) {
          this.player.stopVideo();
          this.player.previousVideo();
        }
      }
    };
    window.onPlayerError = (event) => {
      console.log(event);
    };
  }
  openOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }
  }
  hideOverlay() {
    if (this.overlay) {
      this.overlay.removeAttribute('style');
    }
  }
  async getTracks() {
    const urlParams = new URLSearchParams(window.location.search);
    let type = urlParams.get('type');
    let url = '/tracks/' + ((type)? type: '');
    let request = await ajaxRequest(url);
    return JSON.parse(request.response);
  }
  async initPlayerTracks() {
    let tracks = await this.getTracks();
    if (tracks && tracks.length > 0) {
      tracks = tracks.filter((track) => track['video_id'] != null);
      this.currentTracks = tracks;
      let videoIds = tracks.map((track) => track['video_id']);
      this.videoIdsString = videoIds.join();
      // Youtube iframe initialize
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      console.log('Oops! Track data not found.');
    }
  }
  setShuffleMap() {
    if (this.isShuffle && !this.initShuffle) {
      this.shuffleVideoIds = this.player.getPlaylist();
      let trackIdxMap = new Map();
      this.currentTracks.forEach((track, i) => {
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
Content.OVERLAY_CLICKED = 'OVERLAY_CLICKED';
Content.BUFFERING = 'BUFFERING';
Content.PLAYING = 'PLAYING';
Content.PAUSED = 'PAUSED';
Content.CUED = 'CUED';
export default Content;