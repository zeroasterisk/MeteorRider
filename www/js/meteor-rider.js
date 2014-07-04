/**
 * Meteor Rider
 * ===================
 *
 * This script is to facilitate an easy means of "taking over" or "hijacking"
 * a HTML page, with a Meteor app.
 *
 * 3 Steps
 * ----------------
 *  1. Setup a "Loading" interface, get from localStorage if we can
 *  2. Request Meteor URL via AJAX
 *  2. Replace the DOM with Meteor's HTML
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
 *   - depot.js is required as a simple API into localStorage
 *     https://github.com/mkuklis/depot.js
 *
 * Gotchas
 * ----------------
 *   - Cross Origin Request Security doesn't allow this in a browser,
 *     but PhoneGap does, and if we can inject CORS headers into Meteor it might
 *     work in a browser sometime
 *
 *   - Meteor Rider can not remove CSS... so anything loaded on the root page, remains.
 *
 *   - Local development might be complicated by routing/URLs, be sure you can
 *     request from Meteor server from device/emulator
 *
 *
 */

//define('MeteorRider', ['jquery'], function($) {
var MeteorRider = {

  // config object, will be overwritten by setup()
  config: {
    meteorUrl: '',
    currentPath: '',
    localStorage: true,
    // step 1) loading text
    doLoading: true,
    // step 2) AJAX request
    doRequest: true,
    // step 3) AJAX response (or cache) replacing DOM
    doReplace: true
  },

  // placeholder for localStorage API
  depot: {},

  // placeholder for XMLHttpRequest
  XHR: {},

  // placeholder for HTML response
  meteorHtml: '',

  // placeholder for localStorage response
  storedHtml: '',

  /**
   * This is the main initialize method - use this to "fire off" MeteorRider
   *  -- all setup done here
   *  -- all "steps" triggered here (unless depending on AJAX response callback)
   *
   * @param mixed
   *   object config optional config overrides defaults & global
   *   string meteorUrl optional string to define the MeteorUrl
   */
  init: function(config) {
    if (typeof config == 'string') {
      this.config.meteorUrl = config;
      var config = {};
    }
    this.setup(config);
    if (this.config.doLoading) {
      this.loading();
    }
    if (this.config.doRequest) {
      this.request();
    }
  },

  /**
   * Basic setup, config setup and verification
   */
  setup: function(config) {

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

    // verify the meteorUrl is set and is a string
    if (typeof this.config.meteorUrl != "string") {
      this.config.meteorUrl = '';
    }

    // clean the meteorUrl, remove the trailing slash
    this.config.meteorUrl = this.config.meteorUrl.replace(/\/$/, '');

    // setup depot for localStorage API
    if (this.config.localStorage && typeof window.localStorage.getItem != "function") {
      console.error('MeteorRider localStorage Not Available ' + typeof window.localStorage.getItem);
      this.config.localStorage = false;
    }

    // verify the currentPath is set and is a string
    if (typeof this.config.currentPath != "string") {
      this.config.currentPath = '';
    }

    // clean the currentPath, if it isn't empty and doesn't start with a "/", prefix
    if (this.config.currentPath.indexOf('/') != 0) {
      this.config.currentPath = '/' + this.config.currentPath;
    }

  },

  // Step 1) loading

  /**
   * !!! Step 1 !!!
   * This happens when first initialized
   *  - shows the initial "Loading" interface
   *  - looks for existing localStorage cached content and replaces with that, if we have it
   */
  loading: function() {
    console.log("MeteorRider Step 1) Loading");
    this.loadingStoredHtml();
  },


  /**
   * part of loading...  before AJAX request made
   *  - do we already have a cached response from last time the AJAX request happened?
   *  - call replace() with it right now...
   */
  loadingStoredHtml: function () {
    if (!this.config.localStorage) {
      return;
    }

    this.storedHtml = window.localStorage.getItem( 'MeteorRider' );
    if (typeof this.storedHtml != "string" || this.storedHtml.length < 1) {
      return;
    }
    console.log("MeteorRider Stored HTML Found (Replace before Request)");
    this.storedHtml = decodeURI(this.storedHtml);
    this.meteorHtml = this.storedHtml;
    // skip to step 3
    this.replace();
  },

  // Step 2) requesting

  /**
   * !!! Step 2 !!!
   * Does a basic AJAX request to your Meteor server
   */
  request: function() {
    console.log("MeteorRider Step 2) Requesting");
    console.log("MeteorRider url: " + this.config.meteorUrl);

    // verify that the meteorUrl exists in the config
    if (!this.config.meteorUrl.length > 0) {
      console.error('MeteorRider: error: unable to determine config.meteorUrl');
      return;
    }

    // native javascript ajax request
    this.XHR = new XMLHttpRequest();
    this.XHR.open('GET', this.config.meteorUrl, true);
    this.XHR.onload = this.onSuccess.bind(this);
    this.XHR.onerror = this.onError.bind(this);
    this.XHR.send();
  },


  /**
   * There was a connection error of some sort
   */
  onError: function () {
    console.error("MeteorRider AJAX Error State");
    this.requestBad();

    if (this.config.localStorage) {
      // there is a chance, we still have our staticly loaded cache from before
      //   we didn't trigger it's events, but we are going to now...
      this.replaceDoneTriggerEvents();
    }

  },

  /**
   * This callback happens when the MeteorRider AJAX request is successful
   * validates http status codes
   */
  onSuccess: function () {
    if (!(this.XHR.status >= 200 && this.XHR.status < 400)) {
      return this.requestBad();
    }
    this.meteorHtml = this.XHR.responseText;
    return this.requestGood();
  },

  /**
   * We reached our target server, but it returned an error
   * (status not between 200-399)
   */
  requestBad: function () {
    console.error("MeteorRider Request Bad");
    console.error("MeteorRider Request.status = " + this.XHR.status + ": " + this.XHR.statusText);
    console.error("MeteorRider Step 3) ABORT - can not continue");
    this.triggerEvent('MeteorRiderResponseError');
    // request stops here
  },

  /**
   * We reached our target server, and we got valid HTML response back
   * (status is between 200-399)
   *
   * Will trigger Step 3) replace
   *
   * @return void
   */
  requestGood: function () {
    console.log("MeteorRider Request Good");
    this.triggerEvent('MeteorRiderResponseSuccess');

    // Alter HTML (fix paths)
    // console.log("MeteorRider meteorHtml = " + this.meteorHtml); // show if you need to debug
    this.requestCleanHtml();
    // console.log("MeteorRider meteorHtml = " + this.meteorHtml); // show if you need to debug

    if (this.storedHtml == this.meteorHtml) {
      console.log("MeteorRider Request SAME - no need to continue");
      return;
    }

    // Trigger Step 3) replace
    this.replace();
  },

  /**
   * update URLs in the HTML to include domain prefix
   *   so Cordova knows "where" to get the Meteor assets from once loaded
   */
  requestCleanHtml: function() {
    this.meteorHtml = this.meteorHtml.replace(/(href|src|manifest)\=\"\//gm, '$1="' + this.config.meteorUrl + '/');
  },

  // Step 3) replacing

  /**
   * !!! Step 3 !!!
   * Does a full DOM replacement with the content from the AJAX request
   *  - called in AJAX request handler
   *  - called in loading handler (if local cache found)
   */
  replace: function () {
    if (!this.config.doReplace) {
      return;
    }
    console.log("MeteorRider Step 3) doing replacement");
    // update the History with the current URL/path
    this.replaceHistoryState();
    // Hijack DOM & Load
    this.replaceDom();
    // Trigger Events on the DOM
    this.replaceDoneTriggerEvents();

    // Store this HTML for next time
    this.replaceStoreHtml();

    // we are done
    console.log("MeteorRider COMPLETE");
  },


  /**
   * history.replaceState()
   * set the window.history state
   *   so iron-router and other packages which depend on window.location work correctly
   *     window.history.replaceState() not supported in all clients
   *
   * @return void
   */
  replaceHistoryState: function() {
    var url = this.config.meteorUrl + this.config.currentPath
    if (typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, "", url);
      return;
    }
    if (typeof window.history.pushState === 'function') {
      window.history.pushState({}, "", url);
      return;
    }
    // TODO: should we do window.history.add() or something?
  },

  /**
   * replace the document with the new document/meteorHtml
   * this is the REAL hijacking...
   *   all old JS remains (unless overwritten, name collision)
   *   all HTML is replaced/overwritten
   *   all new CSS/JS is loaded
   */
  replaceDom: function() {
    console.log("MeteorRider replaceDom init");
    if (this.meteorHtml.length < 20) {
      console.log("MeteorRider replaceDom ABORT - too short: [" + this.meteorHtml + "]");
      return;
    }
    this.triggerEvent('MeteorRiderReplaceInit');
    document.open();
    document.write(this.meteorHtml);
    console.log("MeteorRider replaceDom wrote: [" + this.meteorHtml + "]");
    document.close();
    this.triggerEvent('MeteorRiderReplaceComplete');
    console.log("MeteorRider replaceDom complete");
  },

  /**
   * trigger the "loaded" events
   *   TODO: it'd be nice to do this AFTER Meteor's JS has loaded (?)
   */
  replaceDoneTriggerEvents: function() {
    this.triggerEvent('DOMContentLoaded');
    this.triggerEvent('load');
    this.triggerEvent('complete');
  },

  /**
   * After we replace the DOM we should store this copy of the HTML for next time
   */
  replaceStoreHtml: function() {
    if (!this.config.localStorage) {
      return;
    }
    if (this.meteorHtml.length == 0) {
      return;
    }

    if (this.storedHtml == this.meteorHtml) {
      console.log("MeteorRider replaceStoreHtml SAME - no need to replace");
      return;
    }

    window.localStorage.removeItem('MeteorRider');
    window.localStorage.setItem('MeteorRider', encodeURI(this.meteorHtml));
    console.log("MeteorRider replaceStoreHtml complete");
  },


  // Misc...

  /**
   * Super Generic trigger event function
   */
  triggerEvent: function(eventName) {
    var event = document.createEvent('Event');
    event.initEvent(eventName);
    document.dispatchEvent(event);
  }

};
//});

