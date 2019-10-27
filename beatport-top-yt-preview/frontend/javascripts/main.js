import '../stylesheets/all.css'; // Font Awesome css
import Navbar from './navbar';
import Content from './content';
import Footer from './footer';
import ajaxRequest from './ajaxRequest';
import '../stylesheets/style.css';
import '../stylesheets/navbar.css';
import '../stylesheets/content.css';
import '../stylesheets/footer.css';
/* global YT */
class Main {
  constructor() {
    this.isTouchMoved = false;
    this.isPinTouched = false;
    this.isPlayerFirstBuffering = false;

    this.updatePlayerProgressTimer = null;

    this.navbar = null;
    this.content = null;
    this.footer = null;

    this.typesUrl = '/api/types';
    this.tracksUrl = '/api/tracks';

    this.setup();
  }
  async setup() {
    try {
      let [types, tracks] = await Promise.all([
        this.getTypes(), 
        this.getTracks(),
      ]);
      this.navbar = new Navbar(types);
      this.content = new Content(tracks);
      this.footer = new Footer();
      
      this.listen();
      this.adjustViewHeight();

    } catch (err) {
      console.error(err);
    }
  }
  async getTypes() {
    try {
      let request = await ajaxRequest(this.typesUrl);
      let types = JSON.parse(request.response);
      return types;
    } catch (err) {
      console.error('Get types data error');
      throw err;
    }
  }
  async getTracks() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let type = urlParams.get('type');
      let url = this.tracksUrl + '/' + ((type)? type: '');
      let request = await ajaxRequest(url);
      let tracks = JSON.parse(request.response);
      return tracks;
    } catch (err) {
      console.error('Get tracks data error');
      throw err;
    }
  }
  listen() {
    window.addEventListener('resize', () => {
      console.log('window resize');
      this.navbar.adjustDisplayMode();
      if (this.getOrientation() == 'portrait') {
        this.adjustViewHeight();
      }
    }); 
    window.addEventListener('touchstart', (e) => {
      console.log('touchstart');
      this.isTouchMoved = false;
      this.isPinTouched = false;
      if (e.target == this.footer.element['progressPin']) {
        this.isPinTouched = true;
        this.progressPinDragging(e, 'touch');
      }
    }, true);
    window.addEventListener('touchmove', () => {this.isTouchMoved = true;console.log('touchmove');}, true);
    window.addEventListener('mousedown', (e) => {
      if (e.target == this.footer.element['progressPin']) {
        this.progressPinDragging(e, 'mousedown');
      } else if (e.target == this.footer.element['volumePin']) {
        this.volumePinDragging(e);
      }
    }, true);
    window.addEventListener('touchend', this.windowClicked.bind(this), true);
    window.addEventListener('click', this.windowClicked.bind(this), true);
    this.footer.on(Footer.PLAY_PAUSE_TOGGLED, () => {
      if (this.content.getState() != Content.BUFFERING) { 
        this.footer.setPlayButton();
        if (this.footer.isPlay) {
          this.content.playVideo();
        } else {
          this.content.pauseVideo();
        }
      }
    });
    this.footer.on(Footer.PLAY_BACK_TOGGLED, () => {
      this.content.playPreviousVideo();
    });
    this.footer.on(Footer.PLAY_FORWARD_TOGGLED, () => {
      this.content.playNextVideo();
    });
    this.footer.on(Footer.OPEN_YOUTUBE_CLICKED, (ytLink) => {
      this.content.pauseVideo();
      window.open(ytLink + '&t=' + this.content.getVideoElapsedSeconds());
      this.footer.hideMoreMenu();
    });
    this.footer.on(Footer.MORE_MENU_SHOWED, () => {
      this.content.openOverlay();
    });
    this.footer.on(Footer.MORE_MENU_HID, () => {
      this.hideOverlay();
    });
    this.footer.on(Footer.VOLUME_SHOWED, () => {
      this.content.openOverlay();
    });
    this.footer.on(Footer.VOLUME_HID, () => {
      this.hideOverlay();
    });
    this.navbar.on(Navbar.ABOUT_SHOWED, () => {
      this.content.openOverlay();
    });
    this.navbar.on(Navbar.ABOUT_HID, () => {
      this.hideOverlay();
    });
    this.content.once(Content.CUED, () => {
      this.content.unMute();
      // When the player is ready, set up and display footer
      this.footer.setup();
      this.syncPlayerVolume();
    });
    this.content.on(Content.BUFFERING, (track) => {
      // TO-DO: refactor
      this.isPlayerFirstBuffering = true;
      this.footer.isPlayerFirstBuffering = true;

      let duration = this.content.getVideoDuration();
      this.footer.setTrackInfo(track, duration);
      this.footer.setPlay();
      this.syncPlayerProgress();
    });
    this.content.on(Content.PLAYING, () => {
      this.syncPlayerProgress();
      this.footer.setPlay();
    });
    this.content.on(Content.PAUSED, () => {
      this.stopSyncPlayerProgress();
      // Wait a little bit to prevent quickly switch to pause before playing next video
      setTimeout(() => {
        if (this.content.getState() == Content.PAUSED) {
          this.footer.setPause();
        }
      }, 0);  
    });
    this.footer.on(Footer.SHUFFLE_TOGGLED, (isShuffle) => {
      this.content.setShuffle(isShuffle);
    });
    this.footer.on(Footer.REPEAT_TOGGLED, (isRepeat) => {
      this.content.setRepeat(isRepeat);
    });
  }
  syncPlayerVolume() {
    setInterval(() => {
      this.footer.updateVolume(this.content.getVolume());
    }, 500);
  }
  syncPlayerProgress() {
    this.stopSyncPlayerProgress();
    this.updatePlayerProgressTimer = setInterval(() => {
      let seconds = this.content.getVideoElapsedSeconds();
      let duration = this.content.getVideoDuration();
      this.footer.updateProgress(seconds, duration);
    }, 100);
  }
  stopSyncPlayerProgress() {
    if (this.updatePlayerProgressTimer) {
      clearInterval(this.updatePlayerProgressTimer);
    }
  }
  adjustViewHeight() {
    // correct height for mobile browsers
    // ref: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  windowClicked(event) {
    // Solution for Opera mini issue: loading stuck for the first time after touchended or clicked
    // Special works for the first time running Youtube player
    if (!this.isPlayerFirstBuffering && (this.footer.isPlayButtonClicked(event) || this.content.isTopPlaylistClicked(event))) {
      if (!this.footer.isMoreMenuClicked(event)) {
        this.footer.hideMoreMenu();
      }
      if (!this.navbar.isAboutClicked(event)) {
        this.navbar.hideAboutDropdown();
      }
      if (!this.footer.isVolumeClicked(event)) {
        this.footer.hideVolumeControls();
      }
      return;
    }
    if (this.isTouchMoved && !this.isPinTouched) {
      // If is touchmove, no more click or touchend event
      event.stopPropagation();
    } else {
      if (!this.footer.isMoreMenuClicked(event)) {
        this.footer.hideMoreMenu();
      }
      if (!this.navbar.isAboutClicked(event)) {
        this.navbar.hideAboutDropdown();
      }
      if (!this.footer.isVolumeClicked(event)) {
        this.footer.hideVolumeControls();
      }
    }
  }
  hideOverlay() {
    if (this.footer.element['moreDropup'].style.display != 'block' 
    && this.navbar.element['aboutDropdown'].style.display != 'block'
    && this.footer.element['volumeControls'].style.display != 'flex') {
      this.content.hideOverlay();
    }
  }
  progressPinDragging(e, mouseOrTouch) {
    if (e.target != this.footer.element['progressPin']) {
      return;
    }
    let eventMove = 'mousemove';
    let eventUp = 'mouseup';
    switch (mouseOrTouch) {
    case 'touch':
      eventMove = 'touchmove';
      eventUp = 'touchend';
      break;
    case 'mousedown':
    default:
      break;
    }
    let self = this;
    let nextVideo = false;
    let mousedownStatus = this.content.player.getPlayerState();
    let mousemove = function(event) {
      // prevent default text selection feature
      event.preventDefault();
      self.content.openOverlay();
      let posX = (mouseOrTouch != 'touch')? event.clientX: event.touches[0].clientX;
      let progressCoef = self.footer.getProgressCoef(posX);
      self.footer.element['progress'].style.width = (progressCoef*100) + '%';
      let newDuration = self.content.player.getDuration() * progressCoef;
      let newFormattedDuration = self.footer.formatTime(newDuration);
      self.footer.element['currentTime'].textContent = newFormattedDuration;
      self.footer.element['currentTimeM'].textContent = newFormattedDuration;
      if (progressCoef >= 1) {
        nextVideo = true;
      } else {
        nextVideo = false;
        self.content.player.seekTo(newDuration);
      }
    };
    window.addEventListener(eventUp, () => {
      self.content.hideOverlay();
      window.removeEventListener(eventMove, mousemove, {passive: false});
      if (nextVideo) {
        self.content.player.nextVideo();
        nextVideo = false;
      } else {
        if (mousedownStatus != YT.PlayerState.PAUSED) {
          self.content.player.playVideo();
        }
      }
    }, {once: true, passive: false});

    window.addEventListener(eventMove, mousemove, {passive: false});
    this.content.player.pauseVideo();
  }
  volumePinDragging(e) {
    if (e.target != this.footer.element['volumePin']) {
      return;
    }
    let self = this;
    let mousemoving = function(event) {
      event.preventDefault();
      let volumeSlider = self.footer.element['volumeSlider'];
      let rect = volumeSlider.getBoundingClientRect();
      let min = rect.top;
      let max = min + volumeSlider.offsetHeight;
      let coefficient = self.content.player.getVolume() / 100;
      if (event.clientY < min) {
        coefficient = 1;
      } else if (event.clientY > max) {
        coefficient = 0;
      } else {
        let height = volumeSlider.clientHeight;
        let offsetY = event.clientY - rect.top;
        coefficient = 1 - offsetY / height;
      }

      self.footer.updateVolume(coefficient*100);
      self.content.unMute();
      self.content.player.setVolume(parseInt((coefficient * 100)));
    };
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', mousemoving);
    }, {once: true});
    window.addEventListener('mousemove', mousemoving);
  }
  getOrientation() {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return 'portrait';
    }
    if (window.matchMedia('(orientation: landscape)').matches) {
      return 'landscape';
    }
  }
}

window.addEventListener('load', function() {
  new Main();
});