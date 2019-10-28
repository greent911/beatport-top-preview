import Base from './base';

class Footer extends Base {
  constructor() {
    super();
    this.element = {
      artwork: document.getElementById('artwork'),
      title: document.getElementById('title'),
      artist: document.getElementById('artist'),
      playPause: document.getElementById('play-pause'),
      external: document.getElementById('external'),
      externalM: document.getElementById('external-m'),
      random: document.getElementById('random'),
      randomM: document.getElementById('random-m'),
      playBack: document.getElementById('play-back'),
      playForward: document.getElementById('play-forward'),
      repeat: document.getElementById('repeat'),
      repeatonce: document.getElementById('repeatonce'),
      repeatM: document.getElementById('repeat-m'),
      repeatonceM: document.getElementById('repeatonce-m'),
      more: document.getElementById('more'),
      moreM: document.getElementById('more-m'),
      moreDropup: document.getElementById('more-dropup'),
      progress: document.getElementById('progress'),
      currentTime: document.getElementById('current-time'),
      totalTime: document.getElementById('total-time'),
      currentTimeM: document.getElementById('current-time-m'),
      totalTimeM: document.getElementById('total-time-m'),
      progressPin: document.getElementById('progress-pin'),
      audioSlider: document.getElementById('audio-slider'),
      volumeBtn: document.getElementById('volume-btn'),
      volumeControls: document.getElementById('volume-controls'),
      volumePin: document.getElementById('volume-pin'),
      volumeSlider: document.getElementById('volume-slider'),
      volumeProgress: document.getElementById('volume-progress'),
      speaker: document.getElementById('speaker'),
      openYt: document.getElementById('open-yt'),
      moreCancel: document.getElementById('more-cancel'),
      updatedTime: document.getElementById('updated-time'),
    };

    this.isPlayerFirstBuffering = false;
    this._isShuffle = false;
    this._isRepeat = false;

    // Dirty way to preload yt icon in moreDropup
    this.element['moreDropup'].style.display = 'block';
  }

  setup() {
    // Hide repeatonce icon buttons
    this.element['repeatonce'].style.display = 'none';
    this.element['repeatonceM'].style.display = 'none';

    this.element['moreDropup'].removeAttribute('style');

    // Display footer
    document.getElementById('footer').removeAttribute('style');
    
    this._setEventListeners();
  }

  _setEventListeners() {
    this.element['playPause'].addEventListener('touchend', (event) => {
      if (!this.isPlayerFirstBuffering) {
        return;
      }
      this._togglePlayPause(event);
    });
    this.element['playPause'].addEventListener('click', this._togglePlayPause.bind(this));

    this.element['external'].addEventListener('touchend', this._openBeatportLink.bind(this));
    this.element['external'].addEventListener('click', this._openBeatportLink.bind(this));
    this.element['externalM'].addEventListener('touchend', this._openBeatportLink.bind(this));
    this.element['externalM'].addEventListener('click', this._openBeatportLink.bind(this));

    this.element['openYt'].addEventListener('touchend', this._openYoutube.bind(this));
    this.element['openYt'].addEventListener('click', this._openYoutube.bind(this));

    this.element['random'].addEventListener('touchend', this._toggleRandom.bind(this));
    this.element['random'].addEventListener('click', this._toggleRandom.bind(this));
    this.element['randomM'].addEventListener('touchend', this._toggleRandom.bind(this));
    this.element['randomM'].addEventListener('click', this._toggleRandom.bind(this));

    this.element['playBack'].addEventListener('touchend', (event) => {
      if (!this.isPlayerFirstBuffering) {
        return;
      }
      this._togglePlayBack(event);
    });
    this.element['playBack'].addEventListener('click', this._togglePlayBack.bind(this));

    this.element['playForward'].addEventListener('touchend', (event) => {
      if (!this.isPlayerFirstBuffering) {
        return;
      }
      this._togglePlayForward(event);
    });
    this.element['playForward'].addEventListener('click', this._togglePlayForward.bind(this));

    this.element['repeat'].addEventListener('touchend', this._toggleRepeat.bind(this));
    this.element['repeat'].addEventListener('click', this._toggleRepeat.bind(this));
    this.element['repeatM'].addEventListener('touchend', this._toggleRepeat.bind(this));
    this.element['repeatM'].addEventListener('click', this._toggleRepeat.bind(this));
    this.element['repeatonce'].addEventListener('touchend', this._toggleRepeat.bind(this));
    this.element['repeatonce'].addEventListener('click', this._toggleRepeat.bind(this));
    this.element['repeatonceM'].addEventListener('touchend', this._toggleRepeat.bind(this));
    this.element['repeatonceM'].addEventListener('click', this._toggleRepeat.bind(this));

    this.element['more'].addEventListener('touchend', this._showHideMoreMenu.bind(this));
    this.element['more'].addEventListener('click', this._showHideMoreMenu.bind(this));
    this.element['moreM'].addEventListener('touchend', this._showHideMoreMenu.bind(this));
    this.element['moreM'].addEventListener('click', this._showHideMoreMenu.bind(this));

    this.element['moreCancel'].addEventListener('touchend', this.hideMoreMenu.bind(this));
    this.element['moreCancel'].addEventListener('click', this.hideMoreMenu.bind(this));

    this.element['volumeBtn'].addEventListener('touchend', this._showHideVolumeBtn.bind(this));
    this.element['volumeBtn'].addEventListener('click', this._showHideVolumeBtn.bind(this));
  }

  _togglePlayPause(event) {
    if (event) event.preventDefault();

    this.emit(Footer.PLAY_PAUSE_TOGGLED);
  }

  _openBeatportLink(event) {
    event.preventDefault();

    let link = this.element['external'].link;
    if (link) {
      window.open(link);
    }
  }

  _openYoutube(event) {
    event.preventDefault();

    let ytLink = this.element['openYt'].link;
    if (ytLink) {
      this.emit(Footer.OPEN_YOUTUBE_CLICKED, ytLink);
    }
  }

  _toggleRandom(event) {
    event.preventDefault();

    this._isShuffle = !this._isShuffle;
    let classList = this.element['random'].classList;
    let classListM = this.element['randomM'].classList;
    if (this._isShuffle) {
      classList.add('green');
      classListM.add('green');
    } else {
      if (classList.contains('green')) {
        classList.remove('green');
      }
      if (classListM.contains('green')) {
        classListM.remove('green');
      }
    }
    this.emit(Footer.SHUFFLE_TOGGLED, this._isShuffle);
  }

  _togglePlayBack(event) {
    event.preventDefault();

    this.setPlay();
    this.emit(Footer.PLAY_BACK_TOGGLED);
  }

  _togglePlayForward(event) {
    event.preventDefault();

    this.setPlay();
    this.emit(Footer.PLAY_FORWARD_TOGGLED);
  }

  _toggleRepeat(event) {
    event.preventDefault();

    this._isRepeat = !this._isRepeat;
    let repeat = this.element['repeat'];
    let repeatonce = this.element['repeatonce'];
    let repeatM = this.element['repeatM'];
    let repeatonceM = this.element['repeatonceM'];
    if (this._isRepeat) {
      repeat.style.display = 'none';
      repeatM.style.display = 'none';
      repeatonce.removeAttribute('style');
      repeatonceM.removeAttribute('style');
    } else {
      repeatonce.style.display = 'none';
      repeatonceM.style.display = 'none';
      repeat.removeAttribute('style');
      repeatM.removeAttribute('style');
    }
    this.emit(Footer.REPEAT_TOGGLED, this._isRepeat);
  }
  
  _showMoreMenu(event) {
    event.preventDefault();

    this.element['moreDropup'].style.display = 'block';
    this.emit(Footer.MORE_MENU_SHOWED);
  }

  hideMoreMenu(event) {
    if(event) event.preventDefault();

    this.element['moreDropup'].removeAttribute('style');
    this.emit(Footer.MORE_MENU_HID);
  }

  _showHideMoreMenu(event) {
    event.preventDefault();

    let display = this.element['moreDropup'].style.display;
    if (display != 'block') {
      this._showMoreMenu(event);
    } else {
      this.hideMoreMenu(event);
    }
  }

  _showVolumeControls(event) {
    event.preventDefault();

    this.element['volumeControls'].style.display = 'flex';
    this.emit(Footer.VOLUME_SHOWED);
  }

  hideVolumeControls(event) {
    if(event) event.preventDefault();

    this.element['volumeControls'].removeAttribute('style');
    this.emit(Footer.VOLUME_HID);
  }

  _showHideVolumeBtn(event) {
    event.preventDefault();
    
    let display = this.element['volumeControls'].style.display;
    if (display != 'flex') {
      this._showVolumeControls(event);
    } else {
      this.hideVolumeControls(event);
    }
  }

  _formatUTCDate(date) {
    let month = date.getUTCMonth() + 1; // months from 1-12
    let day = date.getUTCDate();
    let year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
        
    return year + '-' + month + '-' + day + ' ' 
    + ((hours<10) ? ('0' + hours) : hours) + ':' 
    + ((minutes<10) ? ('0' + minutes) : minutes) + ':' 
    + ((seconds<10) ? ('0' + seconds) : seconds);
  }

  setPlayButton() {
    let classList = this.element['playPause'].classList;
    if (classList.contains('fa-play-circle')) {
      classList.add('fa-pause-circle');
      classList.remove('fa-play-circle');
      this.isPlay = true;
    } else {
      classList.add('fa-play-circle');
      classList.remove('fa-pause-circle');
      this.isPlay = false;
    }
  }

  setPlay() {
    let classList = this.element['playPause'].classList;
    if (classList.contains('fa-play-circle')) {
      classList.add('fa-pause-circle');
      classList.remove('fa-play-circle');
    }
    this.isPlay = true;
  }

  setPause() {
    let classList = this.element['playPause'].classList;
    if (classList.contains('fa-pause-circle')) {
      classList.add('fa-play-circle');
      classList.remove('fa-pause-circle');
    }
    this.isPlay = false;
  }

  formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return min + ':' + ((sec<10) ? ('0' + sec) : sec);
  }

  setTrackInfo(track, duration) {
    let { title, video_id: videoId, link, artists, updated_at: updatedAt, imglink  } = track;
    let totalTime = this.formatTime(duration);
    let updatedTime = this._formatUTCDate(new Date(updatedAt));

    this.element['title'].innerHTML = title;
    // this.element['title'].href = `https://www.beatport.com${link}`;
    this.element['openYt'].link = `https://www.youtube.com/watch?v=${videoId}`;
    this.element['external'].link = `https://www.beatport.com${link}`;
    this.element['artist'].innerHTML = artists;
    this.element['updatedTime'].innerHTML = `Latest Update: ${updatedTime}`;
    this.element['artwork'].style.backgroundImage = `url(${imglink})`;
    this.element['totalTime'].textContent = totalTime;
    this.element['totalTimeM'].textContent = totalTime;
  }

  setProgress(percent) {
    this.element['progress'].style.width = `${percent}%`;
  }

  setCurrentTimeText(currentTime) {
    this.element['currentTime'].textContent = currentTime;
    this.element['currentTimeM'].textContent = currentTime;
  }

  updateProgress(seconds, duration) {
    let percent = (seconds / duration) * 100;
    let currentTime = this.formatTime(seconds);

    this.setProgress(percent);
    this.setCurrentTimeText(currentTime);
  }

  /**
   * @param {number} value a value between 0-100
   */
  updateVolume(value) {
    this.element['volumeProgress'].style.height = `${value}%`;
    let coefficient = value / 100;
    if(coefficient >= 0.5) {
      this.element['speaker'].attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';  
    } else if(coefficient < 0.5 && coefficient > 0.05) {
      this.element['speaker'].attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
    } else if(coefficient <= 0.05) {
      this.element['speaker'].attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
    }
  }

  getProgressCoef(posX) {
    let coefficient = 0; 
    let slider = this.element['audioSlider'];
    let min = slider.offsetLeft;
    let max = min + slider.clientWidth;
    if (posX < min) {
      coefficient = 0;
    } else if (posX > max) {
      coefficient = 1;
    } else {
      let offsetX = posX - slider.offsetLeft;
      let width = slider.clientWidth;
      coefficient = offsetX / width;  
    }
    return coefficient;
  }

  isMoreMenuClicked(event) {
    let more = this.element['more'];
    let moreM = this.element['moreM'];
    let dropup = this.element['moreDropup'];
    if (event.target != more && event.target != moreM 
      && event.target != dropup && event.target.parentNode != dropup) {
      return false;
    } else {
      return true;
    }
  }

  isVolumeClicked(event) {
    let volumeBtn = this.element['volumeBtn'];
    let volumeControls = this.element['volumeControls'];
    if (event.target != volumeBtn && event.target.parentNode != volumeBtn && event.target.parentNode.parentNode != volumeBtn 
      && event.target != volumeControls && event.target.parentNode != volumeControls
      && event.target.parentNode.parentNode != volumeControls && event.target.parentNode.parentNode.parentNode != volumeControls) {
      return false;
    } else {
      return true;
    }
  }

  isPlayButtonClicked(event) {
    let playPause = this.element['playPause'];
    let playBack = this.element['playBack'];
    let playForward = this.element['playForward'];
    if (event.target == playPause || event.target == playBack || event.target == playForward) {
      return true;
    }
    return false;
  }
}

Footer.PLAY_PAUSE_TOGGLED = Symbol('PLAY_PAUSE_TOGGLED');
Footer.PLAY_BACK_TOGGLED = Symbol('PLAY_BACK_TOGGLED');
Footer.PLAY_FORWARD_TOGGLED = Symbol('PLAY_FORWARD_TOGGLED');
Footer.OPEN_YOUTUBE_CLICKED = Symbol('OPEN_YOUTUBE_CLICKED');
Footer.MORE_MENU_SHOWED = Symbol('MORE_MENU_SHOWED');
Footer.MORE_MENU_HID = Symbol('MORE_MENU_HID');
Footer.VOLUME_SHOWED = Symbol('VOLUME_SHOWED');
Footer.VOLUME_HID = Symbol('VOLUME_HID');
Footer.SHUFFLE_TOGGLED = Symbol('SHUFFLE_TOGGLED');
Footer.REPEAT_TOGGLED = Symbol('REPEAT_TOGGLED');

export default Footer;