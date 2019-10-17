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
    this.isPlayerInitBuffered = false;

    this.navbar = null;
    this.content = null;
    this.footer = null;

    this.typesUrl = '/api/types';
    this.tracksUrl = '/api/tracks';

    this.initialize();
  }
  async initialize() {
    console.log('initialize');
    try {
      let [types, tracks] = await Promise.all([
        this.getTypes(), 
        this.getTracks(),
      ]);
      this.navbar = new Navbar(types);
      this.content = new Content(tracks);
      // TODO: refactor later
      this.footer = new Footer();
      this.listen();
      this.setup();

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
      this.footer.setup(this.content.player);
    });
    this.content.on(Content.BUFFERING, (track) => {
      this.isPlayerInitBuffered = true;
      this.footer.isPlayerInitBuffered = true;
      this.footer.setTrackInfo(track);
    });
    this.content.on(Content.PLAYING, () => {
      this.footer.setStatus(Content.PLAYING);
    });
    this.content.on(Content.PAUSED, () => {
      this.footer.setStatus(Content.PAUSED);
    });
    this.footer.on(Footer.SHUFFLE_CLICKED, (isShuffle) => {
      this.content.setShuffle(isShuffle);
    });
    this.footer.on(Footer.REPEAT_CLICKED, (isRepeat) => {
      this.content.setRepeat(isRepeat);
    });
  }
  setup() {
    this.adjustViewHeight();
  }
  adjustViewHeight() {
    // correct height for mobile browsers
    // ref: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  windowClicked(event) {
    // Solution for Opera mini issue: loading stuck for the first time after touchended or clicked
    // Special works for the first time toggling Youtube player
    if (!this.isPlayerInitBuffered && (this.isPlayButtonClicked(event) || this.isPlaylistClicked(event))) {
      if (!this.isMoreMenuClicked(event)) {
        this.footer.hideMoreMenu();
      }
      if (!this.navbar.isAboutClicked(event)) {
        this.navbar.hideAboutDropdown();
      }
      if (!this.isVolumeClicked(event)) {
        this.footer.hideVolumeControls();
      }
      return;
    }
    if (this.isTouchMoved && !this.isPinTouched) {
      // If is touchmove, no more click or touchend event
      event.stopPropagation();
    } else {
      if (!this.isMoreMenuClicked(event)) {
        this.footer.hideMoreMenu();
      }
      if (!this.navbar.isAboutClicked(event)) {
        this.navbar.hideAboutDropdown();
      }
      if (!this.isVolumeClicked(event)) {
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
  isMoreMenuClicked(event) {
    let more = this.footer.element['more'];
    let moreM = this.footer.element['moreM'];
    let dropup = this.footer.element['moreDropup'];
    if (event.target != more && event.target != moreM 
      && event.target != dropup && event.target.parentNode != dropup) {
      return false;
    } else {
      return true;
    }
  }
  isVolumeClicked(event) {
    let volumeBtn = this.footer.element['volumeBtn'];
    let volumeControls = this.footer.element['volumeControls'];
    if (event.target != volumeBtn && event.target.parentNode != volumeBtn && event.target.parentNode.parentNode != volumeBtn 
      && event.target != volumeControls && event.target.parentNode != volumeControls
      && event.target.parentNode.parentNode != volumeControls && event.target.parentNode.parentNode.parentNode != volumeControls) {
      return false;
    } else {
      return true;
    }
  }
  isPlayButtonClicked(event) {
    let playToggle = this.footer.element['playToggle'];
    let playBack = this.footer.element['playBack'];
    let playForward = this.footer.element['playForward'];
    if (event.target == playToggle || event.target == playBack || event.target == playForward) {
      return true;
    }
    return false;
  }
  isPlaylistClicked(event) {
    let playlist = this.content.element['playlist'];
    if (event.target == playlist || event.target.parentNode == playlist
      || (event.target.parentNode && event.target.parentNode.parentNode == playlist)
      || (event.target.parentNode.parentNode 
        && event.target.parentNode.parentNode.parentNode == playlist)) {
      return true;
    }
    return false;
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
      self.footer.element['volumeProgress'].style.height = (coefficient*100) + '%';
      self.footer.updateVolume(coefficient);
      self.content.player.unMute();
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