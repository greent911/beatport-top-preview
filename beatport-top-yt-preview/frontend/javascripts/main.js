import '../stylesheets/all.css'; // Font Awesome css
import Navbar from './navbar';
import Content from './content';
import Footer from './footer';
import ajaxRequest from './ajaxRequest';
import '../stylesheets/style.css';
import '../stylesheets/navbar.css';
import '../stylesheets/content.css';
import '../stylesheets/footer.css';

class Main {
  constructor() {
    this.isTouchMoved = false;
    this.isProgressPinTouched = false;
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
      
      this.adjustViewHeight();
      this.setEventListeners();

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
      let href = new URL(window.location.href);
      let type = href.pathname.split('/')[2];
      let url = this.tracksUrl + '/' + ((type)? type: '');
      let request = await ajaxRequest(url);
      let tracks = JSON.parse(request.response);
      return tracks;
    } catch (err) {
      console.error('Get tracks data error');
      throw err;
    }
  }

  adjustViewHeight() {
    // correct height for mobile browsers
    // ref: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setEventListeners() {
    window.addEventListener('resize', () => {
      console.log('window resize');
      this.navbar.adjustDisplayMode();
      if (this.getOrientation() === 'portrait') {
        this.adjustViewHeight();
      }
    });

    window.addEventListener('touchstart', (event) => {
      // console.log('touchstart');
      this.isTouchMoved = false;
      this.isProgressPinTouched = false;
      if (event.target === this.footer.element['progressPin']) {
        this.isProgressPinTouched = true;
        this.progressPinDragging(event, 'touch');
      }
    }, true);
    window.addEventListener('touchmove', () => {
      // console.log('touchmove');
      this.isTouchMoved = true;
    }, true);
    window.addEventListener('touchend', this.windowClickEnd.bind(this), true);

    window.addEventListener('mousedown', (event) => {
      if (event.target === this.footer.element['progressPin']) {
        this.progressPinDragging(event, 'mousedown');
      } else if (event.target === this.footer.element['volumePin']) {
        this.volumePinDragging(event);
      }
    }, true);
    window.addEventListener('click', this.windowClickEnd.bind(this), true);

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
        if (this.content.getState() === Content.PAUSED) {
          this.footer.setPause();
        }
      }, 0);  
    });
    this.footer.on(Footer.PLAY_PAUSE_TOGGLED, () => {
      if (this.content.getState() !== Content.BUFFERING) { 
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
    this.footer.on(Footer.SHUFFLE_TOGGLED, (isShuffle) => {
      this.content.setShuffle(isShuffle);
    });
    this.footer.on(Footer.REPEAT_TOGGLED, (isRepeat) => {
      this.content.setRepeat(isRepeat);
    });
  }

  getOrientation() {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return 'portrait';
    }
    if (window.matchMedia('(orientation: landscape)').matches) {
      return 'landscape';
    }
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

  windowClickEnd(event) {
    // Solution for Opera mini issue: loading stuck for the first time after touchend
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
    // Normal case
    if (this.isTouchMoved && !this.isProgressPinTouched) {
      // no other inner click or touchend event
      event.stopPropagation();
      return;
    }
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

  hideOverlay() {
    if (this.footer.element['moreDropup'].style.display !== 'block' 
    && this.navbar.element['aboutDropdown'].style.display !== 'block'
    && this.footer.element['volumeControls'].style.display !== 'flex') {
      this.content.hideOverlay();
    }
  }

  progressPinDragging(e, mouseOrTouch) {
    if (e.target !== this.footer.element['progressPin']) {
      return;
    }

    let moveEventName = 'mousemove';
    let endEventName = 'mouseup';
    switch (mouseOrTouch) {
    case 'touch':
      moveEventName = 'touchmove';
      endEventName = 'touchend';
      break;
    case 'mousedown':
    default:
      break;
    }

    let self = this;
    let nextVideo = false;
    let playerState = this.content.getState();
    let moving = function(event) {
      // prevent default text selection feature
      event.preventDefault();

      // prevent misclicking on youtube
      self.content.openOverlay();

      let posX = (mouseOrTouch !== 'touch')? event.clientX: event.touches[0].clientX;
      let progressCoef = self.footer.getProgressCoef(posX);
      self.footer.setProgress(progressCoef*100);
      let seconds = self.content.getVideoDuration() * progressCoef;
      let newTime = self.footer.formatTime(seconds);
      self.footer.setCurrentTimeText(newTime);
      if (progressCoef >= 1) {
        nextVideo = true;
      } else {
        nextVideo = false;
        self.content.seekTo(seconds);
      }
    };

    window.addEventListener(endEventName, () => {
      self.content.hideOverlay();
      window.removeEventListener(moveEventName, moving, {passive: false});
      if (nextVideo) {
        self.content.playNextVideo();
        nextVideo = false;
      } else {
        if (playerState !== Content.PAUSED) {
          self.content.playVideo();
        }
      }
    }, {once: true, passive: false});

    // Set up mouse or touch move event handler
    window.addEventListener(moveEventName, moving, {passive: false});

    this.content.pauseVideo();
  }

  volumePinDragging(e) {
    if (e.target !== this.footer.element['volumePin']) {
      return;
    }

    let self = this;
    let moving = function(event) {
      event.preventDefault();
      let volumeSlider = self.footer.element['volumeSlider'];
      let rect = volumeSlider.getBoundingClientRect();
      let min = rect.top;
      let max = min + volumeSlider.offsetHeight;
      let coefficient = self.content.getVolume() / 100;
      if (event.clientY < min) {
        coefficient = 1;
      } else if (event.clientY > max) {
        coefficient = 0;
      } else {
        let height = volumeSlider.clientHeight;
        let offsetY = event.clientY - rect.top;
        coefficient = 1 - offsetY / height;
      }

      self.footer.updateVolume(coefficient * 100);
      self.content.unMute();
      self.content.setVolume(parseInt((coefficient * 100)));
    };

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', moving);
    }, {once: true});

    // Set up mouse move event handler
    window.addEventListener('mousemove', moving);
  }
}

window.addEventListener('load', function() {
  new Main();
});