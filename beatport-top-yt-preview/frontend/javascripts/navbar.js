import Base from './base';

class Navbar extends Base {
  constructor(types) {
    super();

    this.element = {
      topnav: document.getElementById('topnav'),
      about: document.getElementById('about'),
      menu: document.getElementById('menu'),
      close: document.getElementById('close'),
      aboutDropdown: document.getElementById('about-dropdown'),
      sidenav: document.getElementById('sidenav'),
      overlay: document.getElementById('overlay'),
    };

    document.documentElement.style.setProperty('--topnavElementDisplay', 'inline');

    this._setTypeLinkElements(types);
    this.adjustDisplayMode();
    this._setEventListeners();
  }
  _setTypeLinkElements(types) {
    types.forEach((type) => {
      let element = document.createElement('a');
      element.setAttribute('href', `/beatport?type=${type}`);
      element.innerHTML = type.toUpperCase();
      if (type == 'top100') {
        element.innerHTML = 'BP-TOP-PREVIEV';
        element.classList.add('title');
      }
      this.element['topnav'].insertBefore(element, this.element['about']);  

      let sideElement = document.createElement('a');
      sideElement.setAttribute('href', `/beatport?type=${type}`);
      sideElement.innerHTML = type.toUpperCase();
      this.element['sidenav'].appendChild(sideElement);
    });
  }
  adjustDisplayMode() {
    let topnavMinWidth = this._topnavMinWidth || this._getTopnavMinWidth();
    if (topnavMinWidth > window.innerWidth) {
      // Mobile mode: use sidenav layout
      this.element['menu'].style.display = 'inline';
      document.documentElement.style.setProperty('--topnavElementDisplay', 'none');
    } else {
      // Desktop mode: use topnav layout
      this.element['menu'].removeAttribute('style');
      document.documentElement.style.setProperty('--topnavElementDisplay', 'inline');
    }
  }
  _getTopnavMinWidth() {
    let aboutIconStyle = this.element['about'].currentStyle || window.getComputedStyle(this.element['about']);
    let marginLeftValue = aboutIconStyle.marginLeft.replace('px', '');
    let topnavWidth = this.element['topnav'].scrollWidth;
    this._topnavMinWidth = parseInt(topnavWidth - marginLeftValue);
    return this._topnavMinWidth;
  }
  _setEventListeners() {
    this.element['menu'].addEventListener('touchend', this._openSidenav.bind(this));
    this.element['menu'].addEventListener('click', this._openSidenav.bind(this));
    this.element['overlay'].addEventListener('touchend', this._closeSidenav.bind(this));
    this.element['overlay'].addEventListener('click', this._closeSidenav.bind(this));
    this.element['close'].addEventListener('touchend', this._closeSidenav.bind(this));
    this.element['close'].addEventListener('click', this._closeSidenav.bind(this));
    this.element['about'].addEventListener('touchend', this._showHideAboutDropdown.bind(this));
    this.element['about'].addEventListener('click', this._showHideAboutDropdown.bind(this));
    this.element['about'].addEventListener('mouseover', this._showAboutDropdown.bind(this));
    this.element['about'].addEventListener('mouseout', this.hideAboutDropdown.bind(this));
  }
  _openSidenav(event) {
    event.preventDefault(); // prevent default href action for Anchor tag
    this.element['sidenav'].style.width = '250px';
    this.element['overlay'].style.width = '100%';
    this.element['overlay'].style.opacity = '0.8';
  }
  _closeSidenav(event) {
    event.preventDefault(); // prevent default href action for  Anchor tag
    this.element['sidenav'].removeAttribute('style');
    this.element['overlay'].removeAttribute('style');
  }
  _showAboutDropdown(event) {
    event.preventDefault(); // prevent default href action for Anchor tag
    this.element['aboutDropdown'].style.display = 'block';
    this.emit(Navbar.ABOUT_SHOWED);
  }
  hideAboutDropdown(event) {
    if (event) event.preventDefault(); // prevent default href action if click or touch event
    if (event && event.type != 'mouseout' && event.target == this.element['aboutDropdown']) return;
    if (event && event.type != 'mouseout' && event.target.parentNode == this.element['aboutDropdown']) return;
    this.element['aboutDropdown'].removeAttribute('style');
    this.emit(Navbar.ABOUT_HID);
  }
  _showHideAboutDropdown(event) {
    event.preventDefault(); // prevent default href action for Anchor tag
    let display = this.element['aboutDropdown'].style.display;
    if (display != 'block') {
      this._showAboutDropdown(event);
    } else {
      this.hideAboutDropdown(event);
    }
  }
  isAboutClicked(event) {
    let about = this.element['about'];
    let aboutDropdown = this.element['aboutDropdown'];
    if (event.target != about && event.target != aboutDropdown 
      && event.target.parentNode != about && event.target.parentNode != aboutDropdown) {
      return false;
    } else {
      return true;
    }
  }
}

Navbar.ABOUT_SHOWED = Symbol();
Navbar.ABOUT_HID = Symbol();

export default Navbar;