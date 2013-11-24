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
  init: function() {
    var meteorUrl = __MeteorRiderConfig__.meteorUrl;
    if (! (meteorUrl.length > 0)) {
      console.error('MeteorRider: error: unable to determine config.meteorUrl');
      return false;
    }
    // trigger request
    $.ajax({
      url: __MeteorRiderConfig__.meteorUrl,
      cache: false,
      // TODO: split to method on MeteorRider
      error: function( jqXHR, textStatus, errorThrown ) {
        console.error("MeteorRider failure");
        console.error(jqXHR, textStatus, errorThrown);
      },
      // TODO: split to method on MeteorRider
      success: function( data, textStatus, jqXHR ) {
        console.log("MeteorRider success");
        console.log(textStatus);
        console.log(data);
        // update URLs
        data = data.replace(/(href|src|manifest)\=\"\//gm, '$1="' + meteorUrl + '/');
          console.log(meteorUrl);
        console.log(data);
        
        // set the window.location object correctly so iron-router 
        // and other packages that depend on window.location work correctly
        window.history.replaceState({}, "", meteorUrl);
        
        // replace the document with the new document/data
        document.open();
        document.write(data);
        document.close();
        // trigger the "loaded" events (it'd be nice to do this AFTER JS has loaded
        $(document).trigger('DOMContentLoaded');
        $(document).trigger('load');
        $(document).trigger('complete');
      }
    });
  }
}
//});
