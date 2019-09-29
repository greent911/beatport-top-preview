class Base {
  constructor() {
    this.events = {};
    this.onceEvents = {};
  }
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  once(event, callback) {
    if (!this.onceEvents[event]) {
      this.onceEvents[event] = [];
    }
    this.onceEvents[event].push(callback);
  }
  emit(event, data) {
    let callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(data);
      });
    }
    callbacks = this.onceEvents[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(data);
      });
    }
    this.onceEvents[event] = [];
  }
}
export default Base;
