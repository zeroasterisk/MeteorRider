MeteorRider
===========

An approach for integrating [PhoneGap/Cordova](http://phonegap.com/) + [Meteor](https://www.meteor.com/).

How it works
------------

* Cordova loads it's `www/index.html`
* All Cordova JS loads
* MeteorRider loads
 * MeteorRider does an AJAX request to your Meteor Server
 * MeteorRider fixes paths in the HTML
 * MeteorRider **replaces** the DOM *("hijacking the DOM")*
* The DOM loads all the Meteor JS/CSS
* Meteor connects via DDP to the Meteor Server

![overview](./master/docs/img/how-meteorrider-works.png)

*NOTE: This is perhaps the "simplest" approach as of right now...*

For more info, [a comparison of approaches](http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/)


Installation / Usage
--------------

> NPM installer package under consideration see [this npm package](https://github.com/poetic/meteor-rider) and [this discussion](https://github.com/zeroasterisk/MeteorRider/pull/20)

There are only a couple of files, and you can choose to manage them however you like...

**get the code**

```
cd tmp
git clone https://github.com/zeroasterisk/MeteorRider.git MeteorRider
```

**On PhoneGap/Cordova**

You do not have to replace the whole `index.html` file, but it's a reasonable "fast start".

* `www/js/meteor-rider.js` is our tool for getting the Meteor HTML and taking over the DOM
* `www/js/phonegapapp.js` is where you setup your application and initializer for MeteorRider
 * has a basic structure for handling events and firing up MeteorRider
 * has a stub for a test switcher, to bypass loading MeteorRider for testing on device only
 * *you can override any of this*

```
cd pathtoyourphonegap/assets/www/
cp index.html index_old.html
cp /tmp/MeteorRider/www/index.html index.html
cp /tmp/MeteorRider/www/js/* js/
```

Then edit `index.html` with the appropriate **config** (see Configuration)

**On Meteor**

You do not have to put anything in Meteor, but if you copy in this `startup.js` file, it will handle *hot code pushes* and reload inside PhoneGap/Cordova, without losing the phonegap context.

```
cd pathtoyourmeteorapp
cp /tmp/MeteorRider/meteor/startup.js startup.js
```

You can also look for the `phonegapapp` JS object inside your Meteor app and use it as a means of knowledge about the client.


Configuration
--------------

Edit your `index.html` file.

Put in whatever "loading" HTML code you want.  It will be overwritten when MeteorRider takes over.

> NOTE: we may provide a means of caching a loaded Meteor app page, for a future release.

Edit the JS object `__MeteorRiderConfig__`.

Set the `meteorUrl` property, it should be the full URL to your meteor app.

> NOTE: full public URLs work best.
> Localhost or internal IPs probably wont work.
> If Cordova can't load it, it won't work.

Set the `phonegapVersion` and `phonegapAppVersion` and whatever else you like.

This config will be accessible from the `phonegapapp` and `MeteorRider` JS objects.


Configuration for PhoneGap
--------------

In the PhoneGap configuration, you will have to allow access to the Meteor app
url/domain.  Refer to the configuration documentation for your version of
PhoneGap.


Common Problems / Tips
--------------

**PhoneGap/Cordova Issues? Plugin Issues?**

1. Stop `MeteorRider` (comment it out, or setup `phonegapapp.test = true;`)
2. Run whatever you're doing with just `index.html` and "on device" JS (without Meteor)
3. Still not working as expected?  Enable MeteorRider again and look for a namespace collision...

**Not Loading Meteor?**

1. Check the URL, can Cordova get to it?
2. Check the console from Cordova (Android, iOS, etc)

    MeteorRider requesting: http://example.com
    MeteorRider response.status = 404

You can uncomment the lines in MeteorRider where it logs the `meteorHtml`
  (the HTML content from Meteor).


In the Wild
--------------

* http://blonk.co/
 * https://www.discovermeteor.com/blog/blonk-building-tinder-for-jobs-with-meteor-for-mobile/
* http://grigio.org/meteor_and_phonegap_cordova_3_x_build_native_app_android_and_ios
* http://meteorpedia.org/read/Mobile_support
* ??

Roadmap / Goals
--------------

The main goal is to provide a simple, fast, and standardized way to connect
PhoneGap to Meteor.

The combination is very powerful, and I have high hope for the future.

Goals:

* PhoneGap version agnostic *(mostly done)*
* Meteor version agnostic *(mostly done)*
* Device agnostic *(maybe done ? Android and iOS only ones experiemented with)*
* Minimal configuration / setup *(needs to be simpler to setup)*

Tasks:

* invesigate loading just the HEAD data from the AJAX reques
* invesigate loading the JS files (from Meteor) via AJAX so that we know when completed and could trigger callbacks
* implement a custom event for "MeteorRiderFinished"
* implement a warning/alerting system for device/connection state (PhoneGap version dependancies?)
* we may provide a means of caching a loaded Meteor app's HTML, and using that as a loading page.
* we may provide a means of setting up an "offline" page

Authors / Acknowledgements
--------------

This is the "Option 3" approach I've been thinking about for a while.

Inspiration and collaboration from:

* [Abigail](https://github.com/awatson1978): https://github.com/awatson1978/cordova-phonegap
* [Morten](https://github.com/raix): https://github.com/raix/Meteor-Cordova
* And [pull requests](https://github.com/zeroasterisk/MeteorRider/pulls?direction=desc&page=1&sort=created&state=closed) from
 * [Daniel](https://github.com/DanyHunter)
 * [@cdoe](https://github.com/cdoe)
 * [Guillaume](https://github.com/silently)
 * [Marc](https://github.com/marbemac)

I'd like to thank all of them for communicating with me while figuring out what my
options were and for collaboration on this project.

Background:

http://prezi.com/ig9gjm11mwsi/from-zero-to-mobile-web-app-in-sixty-minutes/

http://zeroasterisk.com/2013/08/22/meteor-phonegapcordova-roundup-fall-2013/
