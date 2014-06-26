/**
 * Meteor Rider
 * ===================
 *
 * This script is to facilitate an easy means of "taking over" or "hijacking"
 * a HTML page, with a Meteor app.
 *
 * Use Case
 * ----------------
 * The Use Case for this, is for a PhoneGap application.  On the device, you
 * load a basic HTML file, and it initializes the phone and device specific JS.
 * Then you use Meteor Rider to connect to your Meteor backend and "take over"
 * the HTML.
 *
 * Requirements
 * ----------------
 * jQuery or Zepto are required, because I'm lazy and want to use their API for
 * AJAX+DOM
 *
 * Gotchas
 * ----------------
 * Cross Origin Request Security doesn't allow this in a browser,
 *   but PhoneGap does, and if we can inject CORS headers into Meteor it might
 *   work in a browser sometime
 * Meteor Rider can not remove CSS... so anything loaded on the root page, remains.
 *
 *
 *
 */

//define('MeteorRider', ['jquery'], function($) {
var MeteorRider = {

  init: function(currentPath) {

    this.meteorUrl = __MeteorRiderConfig__.meteorUrl;
    this.currentPath = currentPath;

    if (! (this.meteorUrl.length > 0)) {
      console.error('MeteorRider: error: unable to determine config.meteorUrl');
      return false;
    }

    // non zepto/jquery request
    request = new XMLHttpRequest();
    request.open('GET', this.meteorUrl, true);
    request.onload = this.onSuccess;
    request.onerror = this.onError;
    request.send();

  },

  onSuccess: function () {
    if (request.status >= 200 && request.status < 400) {

      var data = request.responseText;

      console.log("MeteorRider success");
      console.log(data);
      // update URLs to include domain prefix
      data = data.replace(/(href|src|manifest)\=\"\//gm, '$1="' + this.meteorUrl + '/');
      console.log(this.meteorUrl);
      console.log(data);

      // set 'currentPath' to empty string if not passed
      this.currentPath = (typeof this.currentPath === 'string' ? this.currentPath : '');
      // set the window.location object correctly so iron-router
      // and other packages that depend on window.location work correctly
      if (typeof window.history.replaceState === 'function') {
        // window.history.replaceState() not supported in all clients
        window.history.replaceState({}, "", this.meteorUrl + this.currentPath);
      } else {
        // TODO: should we do window.history.add() or something?
      }

      // replace the document with the new document/data
      //   this is the REAL hijacking...
      //     all old JS remains (unless overwritten, name collision)
      //     all HTML is replaced/overwritten
      //     all new CSS/JS is loaded
      document.open();
      document.write(data);
      document.close();

      // trigger the "loaded" events (it'd be nice to do this AFTER JS has loaded
      function triggerEvent (eventName) {
        var event = document.createEvent('Event');
        event.initEvent(eventName);
        document.dispatchEvent(event);
      }

      triggerEvent('DOMContentLoaded');
      triggerEvent('load');
      triggerEvent('complete');

    } else {
      // We reached our target server, but it returned an error
      console.error(request.statusText);
    }

  },

  onError: function () {
    // There was a connection error of some sort
    console.error("MeteorRider failure");
    console.error(request.statusText);
  }
}
//});
