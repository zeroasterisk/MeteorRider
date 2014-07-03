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

  config: {},
  // config: {meteorUrl: "http://example.com", currentPath: "mypath"},

  init: function(config) {

    // set config
    this.setConfig(config);

    // verify that the meteorUrl exists in the config
    if (!this.config.meteorUrl.length > 0) {
      console.error('MeteorRider: error: unable to determine config.meteorUrl');
      return false;
    }

    // verify the currentPath
    if (typeof this.config.currentPath != "string") {
      this.config.currentPath = '';
    }

    console.log("MeteorRider requesting: " + this.config.meteorUrl);

    // native javascript ajax request
    request = new XMLHttpRequest();
    request.open('GET', this.config.meteorUrl, true);
    request.onload = this.onSuccess.bind(this);
    request.onerror = this.onError;
    request.send();

  },

  setConfig: function (config) {
    // support for global config variable if set
    if (typeof __MeteorRiderConfig__ == "object") {
      for (var k in __MeteorRiderConfig__) {
        this.config[k] = __MeteorRiderConfig__[k];
      }
    }

    // support for passed in config variable if set
    if (typeof config == "object") {
      for (var k in config) {
        this.config[k] = config[k];
      }
    }

    // clean the meteorUrl, remove the trailing slash
    if (typeof this.config.meteorUrl == "string") {
      this.config.meteorUrl = this.config.meteorUrl.replace(/\/$/, '');
    }

  },

  onSuccess: function () {

    if (!(request.status >= 200 && request.status < 400)) {
      // We reached our target server, but it returned an error
      //   (status not between 200-399)
      console.error("MeteorRider response.status = " + response.status);
      console.error(request.statusText);
      return;
    }

    // We reached our target server, and we got valid HTML response back
    //   (status is between 200-399)
    console.log("MeteorRider success");

    // Setup
    // -----------------------
    var meteorHtml = request.responseText;
    // console.log(meteorHtml); // show if you need to debug

    // set 'meteorUrl' to empty string if not passed
    var meteorUrl = (typeof this.config.meteorUrl === 'string' ? this.config.meteorUrl : '');

    // set 'currentPath' to empty string if not passed
    var currentPath = (typeof this.config.currentPath === 'string' ? this.config.currentPath : '');

    // clean the currentPath, if it isn't empty and doesn't start with a "/", prefix
    if (currentPath.length > 0 && currentPath.indexOf('/') != 1) {
      currentPath = '/' + currentPath;
    }

    // Setup Window History
    // -----------------------
    // set the window.history state
    //   so iron-router and other packages which depend on window.location work correctly
    //     window.history.replaceState() not supported in all clients
    if (typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, "", meteorUrl + currentPath);
    } else if (typeof window.history.pushState === 'function') {
      window.history.pushState({}, "", meteorUrl + currentPath);
    } else {
      // TODO: should we do window.history.add() or something?
    }

    // Alter HTML
    // -----------------------

    // update URLs in the HTML to include domain prefix
    //   so Cordova knows "where" to get the Meteor assets from once loaded
    meteorHtml = meteorHtml.replace(/(href|src|manifest)\=\"\//gm, '$1="' + meteorUrl + '/');
    // console.log(meteorHtml); // show if you need to debug


    // Hijack DOM & Load
    // -----------------------

    // replace the document with the new document/meteorHtml
    // this is the REAL hijacking...
    //   all old JS remains (unless overwritten, name collision)
    //   all HTML is replaced/overwritten
    //   all new CSS/JS is loaded
    document.open();
    document.write(meteorHtml);
    document.close();


    // Trigger Events on the DOM
    // -----------------------

    // trigger the "loaded" events
    //   TODO: it'd be nice to do this AFTER Meteor's JS has loaded (?)

    function triggerEvent (eventName) {
      var event = document.createEvent('Event');
      event.initEvent(eventName);
      document.dispatchEvent(event);
    }

    triggerEvent('DOMContentLoaded');
    triggerEvent('load');
    triggerEvent('complete');

  },

  onError: function () {

    // There was a connection error of some sort
    console.error("MeteorRider failure");
    console.error(request.statusText);

  }
}
//});
