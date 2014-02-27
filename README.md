MeteorRider
===========

An approach for integrating PhoneGap/Cordova + Meteor (telling PhoneGap where to get content from, letting Meteor hijack your PhoneGap app's HTML/CSS/JS)

NOTE: This is perhaps the "simplest" approach as of right now... 
but I have noticed when using PhoneGap plugins some complications with this approach and am in fact using 
the "iframe" appraoch from @raix for larger projects.

For more info, [a comparison of approaches](http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/)

That said, this remains a very fast and simple approach - keeping it an option makes sense.


Installation / Usage
--------------

There are only a couple of files, and you can choose to manage them however you
like... but here's a quick set of commands to get you going...

```
cp pathtoyourphonegap/../
git clone <git-url>
cp pathtoyourphonegap/assets/www/index.html pathtoyourphonegap/assets/www/index_old.html
cp MeteorRider/www/index.html pathtoyourphonegap/assets/www/index.html
cp MeteorRider/www/js/* pathtoyourphonegap/assets/www/js/
```

To enable hot code push reload, without losing the phonegap context, copy the code from MeteorRider/startup.js to your meteor app.

Configuration
--------------

Edit your index.html file.

Put in whatever "loading" code you want.
(note: we may provide a means of caching a loaded Meteor app page, for a future release)

edit the JS object `__MeteorRiderConfig__`
and most importantly the `meteorUrl` property - it should be the full URL to
your meteor app, and it should not have a trailing slash.

Note: phonegap has to be able to find that URL, so if you are running a local
development Meteor application, it has to be available on your LAN, and
PhoneGap has to be able to route to it.

Configuration for PhoneGap
--------------

In the PhoneGap configuration, you will have to allow access to the Meteor app
url/domain.  Refer to the configuration documentation for your version of
PhoneGap.

Roadmap / Goals
--------------

The main goal is to provide a simple, fast, and standardized way to connect
PhoneGap to Meteor.  The combination is very powerful, and there are a few
approaches for this, but our aim is to be the best.

Goals:

* PhoneGap version agnostic
* Meteor version agnostic
* Device agnostic (Android and iOS only ones experiemented with)
* Minimal configuration / setup

Tasks:

* standarize the JS and tighten it up
* remove the temp hack for loading the '/' url -- figure out how to trigger that without the hack
* invesigate loading just the HEAD data from the AJAX reques
* invesigate loading the JS files (from Meteor) via AJAX so that we know when completed and could trigger callbacks
* make the meteorUrl strip tailing slahes, so config doesn't matter
* implement a custom event for "MeteorRiderFinished"
* implement a warning/alerting system for device/connection state (PhoneGap version dependancies?)
* we may provide a means of caching a loaded Meteor app's HTML, and using that as a loading page.
* we may provide a means of setting up an "offline" page

Authors / Acknowledgements
--------------

This is the "Option 3" approach I've been thinking about for a while.

Inspiration and collaboration from:

* Abigail: https://github.com/awatson1978/cordova-phonegap
* Morten: https://github.com/raix/Meteor-Cordova

I'd like to thank both of them for communicating with me while figuring out what my
options were and for collaboration on this project.

Background:

http://prezi.com/ig9gjm11mwsi/from-zero-to-mobile-web-app-in-sixty-minutes/

http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/
