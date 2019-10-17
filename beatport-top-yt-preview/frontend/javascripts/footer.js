import Base from './base';
import Content from './content';
/* global YT */
class Footer extends Base {
  constructor() {
    super();
    this.element = {
      artwork: document.getElementById('artwork'),
      title: document.getElementById('title'),
      artist: document.getElementById('artist'),
      playToggle: document.getElementById('playToggle'),
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
    this.isPlayerInitBuffered = false;
    this.isShuffle = false;
    this.isRepeat = false;
    this.element['moreDropup'].style.display = 'block';
  }
  setup(player) {
    this.init(player);
  }
  init(player) {
    this.player = player;
    this.initVolume();
    this.element['repeatonce'].style.display = 'none';
    this.element['repeatonceM'].style.display = 'none';
    this.element['moreDropup'].removeAttribute('style');
    document.getElementById('footer').removeAttribute('style');
    this.listen();
  }
  initVolume() {
    this.player.unMute();
    setInterval(() => {
      if (this.player.isMuted()) {
        this.element['volumeProgress'].style.height = '0%';
        this.updateVolume(0);
      } else {
        this.element['volumeProgress'].style.height = this.player.getVolume() + '%';
        this.updateVolume(this.player.getVolume() / 100);
      }
    }, 500);
  }
  listen() {
    this.element['playToggle'].addEventListener('touchend', (event) => {
      if (!this.isPlayerInitBuffered) {
        return;
      }
      this.playPauseVideo(event);
    });
    this.element['playToggle'].addEventListener('click', this.playPauseVideo.bind(this));
    this.element['external'].addEventListener('touchend', this.openLink.bind(this));
    this.element['external'].addEventListener('click', this.openLink.bind(this));
    this.element['externalM'].addEventListener('touchend', this.openLink.bind(this));
    this.element['externalM'].addEventListener('click', this.openLink.bind(this));
    this.element['openYt'].addEventListener('touchend', this.openYtLink.bind(this));
    this.element['openYt'].addEventListener('click', this.openYtLink.bind(this));
    this.element['random'].addEventListener('touchend', this.toggleRandom.bind(this));
    this.element['random'].addEventListener('click', this.toggleRandom.bind(this));
    this.element['randomM'].addEventListener('touchend', this.toggleRandom.bind(this));
    this.element['randomM'].addEventListener('click', this.toggleRandom.bind(this));
    this.element['playBack'].addEventListener('touchend', (event) => {
      if (!this.isPlayerInitBuffered) {
        return;
      }
      this.togglePlayBack(event);
    });
    this.element['playBack'].addEventListener('click', this.togglePlayBack.bind(this));
    this.element['playForward'].addEventListener('touchend', (event) => {
      if (!this.isPlayerInitBuffered) {
        return;
      }
      this.togglePlayForward(event);
    });
    this.element['playForward'].addEventListener('click', this.togglePlayForward.bind(this));
    this.element['repeat'].addEventListener('touchend', this.toggleRepeat.bind(this));
    this.element['repeat'].addEventListener('click', this.toggleRepeat.bind(this));
    this.element['repeatM'].addEventListener('touchend', this.toggleRepeat.bind(this));
    this.element['repeatM'].addEventListener('click', this.toggleRepeat.bind(this));
    this.element['repeatonce'].addEventListener('touchend', this.toggleRepeat.bind(this));
    this.element['repeatonce'].addEventListener('click', this.toggleRepeat.bind(this));
    this.element['repeatonceM'].addEventListener('touchend', this.toggleRepeat.bind(this));
    this.element['repeatonceM'].addEventListener('click', this.toggleRepeat.bind(this));
    this.element['more'].addEventListener('touchend', this.showHideMoreMenu.bind(this));
    this.element['more'].addEventListener('click', this.showHideMoreMenu.bind(this));
    this.element['moreM'].addEventListener('touchend', this.showHideMoreMenu.bind(this));
    this.element['moreM'].addEventListener('click', this.showHideMoreMenu.bind(this));
    this.element['moreCancel'].addEventListener('touchend', this.hideMoreMenu.bind(this));
    this.element['moreCancel'].addEventListener('click', this.hideMoreMenu.bind(this));
    this.element['volumeBtn'].addEventListener('touchend', this.showHideVolumeBtn.bind(this));
    this.element['volumeBtn'].addEventListener('click', this.showHideVolumeBtn.bind(this));
  }
  playPauseVideo(event) {
    if (event) event.preventDefault();
    if (this.player.getPlayerState() != YT.PlayerState.BUFFERING) {     
      let classList = this.element['playToggle'].classList;
      if (classList.contains('fa-play-circle')) {
        classList.add('fa-pause-circle');
        classList.remove('fa-play-circle');
        this.player.playVideo();
      } else {
        classList.add('fa-play-circle');
        classList.remove('fa-pause-circle');
        this.player.pauseVideo();
      }
    }
  }
  openLink(event) {
    event.preventDefault();
    let link = this.element['external'].link;
    if (link) {
      window.open(link);
    }
  }
  openYtLink(event) {
    event.preventDefault();
    let link = this.element['openYt'].link;
    if (link) {
      this.player.pauseVideo();
      window.open(link + '&t=' + parseInt(this.player.getCurrentTime()));
      this.hideMoreMenu();
    }
  }
  toggleRandom(event) {
    event.preventDefault();
    this.isShuffle = !this.isShuffle;
    let classList = this.element['random'].classList;
    let classListM = this.element['randomM'].classList;
    if (this.isShuffle) {
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
    this.emit(Footer.SHUFFLE_CLICKED, this.isShuffle);
  }
  togglePlayBack(event) {
    event.preventDefault();
    let classList = this.element['playToggle'].classList;
    this.player.previousVideo();
    if (classList.contains('fa-play-circle')) {
      classList.add('fa-pause-circle');
      classList.remove('fa-play-circle');
    }
  }
  togglePlayForward(event) {
    event.preventDefault();
    let classList = this.element['playToggle'].classList;
    this.player.nextVideo();
    if (classList.contains('fa-play-circle')) {
      classList.add('fa-pause-circle');
      classList.remove('fa-play-circle');
    }
  }
  toggleRepeat(event) {
    event.preventDefault();
    this.isRepeat = !this.isRepeat;
    let repeat = this.element['repeat'];
    let repeatonce = this.element['repeatonce'];
    let repeatM = this.element['repeatM'];
    let repeatonceM = this.element['repeatonceM'];
    if (this.isRepeat) {
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
    this.emit(Footer.REPEAT_CLICKED, this.isRepeat);
  }
  showMoreMenu(event) {
    event.preventDefault();
    this.element['moreDropup'].style.display = 'block';
    this.emit(Footer.MORE_MENU_SHOWED);
  }
  hideMoreMenu(event) {
    if(event) event.preventDefault();
    this.element['moreDropup'].removeAttribute('style');
    this.emit(Footer.MORE_MENU_HID);
  }
  showHideMoreMenu(event) {
    event.preventDefault();
    let display = this.element['moreDropup'].style.display;
    if (display != 'block') {
      this.showMoreMenu(event);
    } else {
      this.hideMoreMenu(event);
    }
  }
  showVolumeControls(event) {
    event.preventDefault();
    this.element['volumeControls'].style.display = 'flex';
    this.emit(Footer.VOLUME_SHOWED);
  }
  hideVolumeControls(event) {
    if(event) event.preventDefault();
    this.element['volumeControls'].removeAttribute('style');
    this.emit(Footer.VOLUME_HID);
  }
  showHideVolumeBtn(event) {
    event.preventDefault();
    let display = this.element['volumeControls'].style.display;
    if (display != 'flex') {
      this.showVolumeControls(event);
    } else {
      this.hideVolumeControls(event);
    }
  }
  setTrackInfo(track) {
    this.element['title'].innerHTML = track.title;
    // this.element['title'].href = 'https://www.beatport.com' + track.link;
    this.element['openYt'].link = 'https://www.youtube.com/watch?v=' + track['video_id'];
    this.element['external'].link = 'https://www.beatport.com' + track.link;
    this.element['artist'].innerHTML = track.artists;
    this.element['updatedTime'].innerHTML = 'Latest Update: ' + this.formatUTCDate(new Date(track['updated_at']));
    this.element['artwork'].style.backgroundImage = 'url(' + track.imglink + ')';
    let total = this.formatTime(this.player.getDuration());
    this.element['totalTime'].textContent = total;
    this.element['totalTimeM'].textContent = total;
    this.setStatus(Content.PLAYING);
  }
  setStatus(status) {
    let classList = this.element['playToggle'].classList;
    switch (status) {
    case Content.PLAYING:
      this.updateProgress();
      if (classList.contains('fa-play-circle')) {
        classList.add('fa-pause-circle');
        classList.remove('fa-play-circle');
      }
      break;
    case Content.PAUSED:
      this.stopUpdateProgress();
      if (classList.contains('fa-pause-circle')) {
        setTimeout(() => {
          if (this.player.getPlayerState() == YT.PlayerState.PAUSED) {
            classList.add('fa-play-circle');
            classList.remove('fa-pause-circle');
          }
        }, 0);
      }
      break;
    default:
      break;
    }
  }
  formatUTCDate(date) {
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
  formatTime(time) {
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    return min + ':' + ((sec<10) ? ('0' + sec) : sec);
  }
  updateProgress() {
    if (this.lockUpdateProgress) {
      return;
    }
    this.stopUpdateProgress();
    this.updateProgressTimer = setInterval(() => {
      let current = this.player.getCurrentTime();
      let duration = this.player.getDuration();
      let percent = (current / duration) * 100;
      this.element['progress'].style.width = percent + '%';
      current = this.formatTime(current);
      this.element['currentTime'].textContent = current;
      this.element['currentTimeM'].textContent = current;
    }, 100);
  }
  stopUpdateProgress() {
    if (this.updateProgressTimer) {
      clearInterval(this.updateProgressTimer);
    }
  }
  forceStopUpdateProgress() {
    this.lockUpdateProgress = true;
    this.stopUpdateProgress();
  }
  updateVolume(coefficient) {
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
}
Footer.MORE_MENU_SHOWED = 'MORE_MENU_SHOWED';
Footer.MORE_MENU_HID = 'MORE_MENU_HID';
Footer.VOLUME_SHOWED = 'VOLUME_SHOWED';
Footer.VOLUME_HID = 'VOLUME_HID';
Footer.SHUFFLE_CLICKED = 'SHUFFLE_CLICKED';
Footer.REPEAT_CLICKED = 'REPEAT_CLICKED';
export default Footer;