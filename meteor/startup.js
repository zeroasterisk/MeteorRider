if (Meteor.isClient) {
  Meteor.startup(function () {
    // verify if we are within a cordova wrapper
    if (typeof cordova === 'undefined') {
      return;
    }
    // verify if we have a MeteorRider object too
    if (typeof MeteorRider === 'undefined') {
      return;
    }
    // attempt to setup a callback handler for hot reloads
    if (typeof Reload !== 'undefined' && typeof Reload._onMigrate === 'function') {
      // this is the newer method, internal?
      Reload._onMigrate('cordovaapp', function () {
        MeteorRider.init();
        return [false];
      });
      return;
    }

    if (typeof Meteor._reload.onMigrate === 'function') {
      // this is the older method, deprecated?
      // it does not seem to be deprecated in meteor 0.8.2
      Meteor._reload.onMigrate('cordovaapp', function () {
        MeteorRider.init();
        return [false];
      });
      return;
    }

  });
}
