import Base from './base';
import ajaxRequest from './ajaxRequest';
class Navbar extends Base {
  constructor() {
    super();
    this.element = {
      navbar: document.getElementById('navbar'),
      about: document.getElementById('about'),
      menu: document.getElementById('menu'),
      close: document.getElementById('close'),
      aboutDropdown: document.getElementById('about-dropdown'),
      sidenav: document.getElementById('sidenav'),
      overlay: document.getElementById('overlay'),
    };
    document.documentElement.style.setProperty('--typeNodeDisplay', 'inline');
    this._setTypes();
  }
  listen() {
    this.element['menu'].addEventListener('touchend', this._openSidenav.bind(this));
    this.element['menu'].addEventListener('click', this._openSidenav.bind(this));
    this.element['overlay'].addEventListener('touchend', this._closeSidenav.bind(this));
    this.element['overlay'].addEventListener('click', this._closeSidenav.bind(this));
    this.element['close'].addEventListener('touchend', this._closeSidenav.bind(this));
    this.element['close'].addEventListener('click', this._closeSidenav.bind(this));
    this.element['about'].addEventListener('touchend', this._showHideAboutDialog.bind(this));
    this.element['about'].addEventListener('click', this._showHideAboutDialog.bind(this));
    this.element['about'].addEventListener('mouseover', this._showAboutDialog.bind(this));
    this.element['about'].addEventListener('mouseout', this.hideAboutDialog.bind(this));
  }
  _openSidenav(event) {
    event.preventDefault();
    this.element['sidenav'].style.width = '250px';
    this.element['overlay'].style.width = '100%';
    this.element['overlay'].style.opacity = '0.8';
  }
  _closeSidenav(event) {
    event.preventDefault();
    this.element['sidenav'].removeAttribute('style');
    this.element['overlay'].removeAttribute('style');
  }
  _showAboutDialog(event) {
    event.preventDefault();
    this.element['aboutDropdown'].style.display = 'block';
    this.emit(Navbar.ABOUT_DIALOG_SHOWED);
  }
  hideAboutDialog(event) {
    if (event) event.preventDefault();
    if (event && event.type != 'mouseout' && event.target == this.element['aboutDropdown']) return;
    if (event && event.type != 'mouseout' && event.target.parentNode == this.element['aboutDropdown']) return;
    this.element['aboutDropdown'].removeAttribute('style');
    this.emit(Navbar.ABOUT_DIALOG_HID);
  }
  _showHideAboutDialog(event) {
    event.preventDefault();
    let display = this.element['aboutDropdown'].style.display;
    if (display != 'block') {
      this._showAboutDialog(event);
    } else {
      this.hideAboutDialog(event);
    }
  }
  getMinWidth() {
    let style = this.element['about'].currentStyle || window.getComputedStyle(this.element['about']);
    let marginLeftValue = style.marginLeft.replace('px', '');
    let navbarWidth = this.element['navbar'].scrollWidth;
    this.minWidth = parseInt(navbarWidth - marginLeftValue);
    return this.minWidth;
  }
  async _setTypes() {
    let url = '/types';
    let request = await ajaxRequest(url);
    let types = JSON.parse(request.response);
    types.forEach((type) => {
      let typeNode = document.createElement('a');
      typeNode.setAttribute('href', '/beatport?type=' + type);
      typeNode.innerHTML = type.toUpperCase();
      if (type=='top100') {
        typeNode.innerHTML = 'BP-TOP-PREVIEV';
        typeNode.classList.add('title');
      }
      this.element['navbar'].insertBefore(typeNode, this.element['about']);     
      let typeNodeSide = document.createElement('a');
      typeNodeSide.setAttribute('href', '/beatport?type=' + type);
      typeNodeSide.innerHTML = type.toUpperCase();
      this.element['sidenav'].appendChild(typeNodeSide);
    });
    this.resizeNodes();
    this.listen();
  }
  resizeNodes() {
    let minWidth = this.minWidth || this.getMinWidth();
    if (minWidth > window.innerWidth) {
      this.element['menu'].style.display = 'inline';
      document.documentElement.style.setProperty('--typeNodeDisplay', 'none');
    } else {
      this.element['menu'].removeAttribute('style');
      document.documentElement.style.setProperty('--typeNodeDisplay', 'inline');
    }
  }
}
Navbar.ABOUT_DIALOG_SHOWED = 'ABOUT_DIALOG_SHOWED';
Navbar.ABOUT_DIALOG_HID = 'ABOUT_DIALOG_HID';
export default Navbar;