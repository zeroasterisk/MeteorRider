if (Meteor.isClient) {
  Meteor.startup(function () {
    if (typeof phonegapapp === 'undefined') {
      return;
    }
    // we have a phonegap app
    //   attempt to setup a callback handler for hot reloads
    
    if (typeof Reload._onMigrate === 'function') {
      // this is the newer method, internal?
      Reload._onMigrate('phonegapapp', function () {
        phonegapapp.meteorRider();
        return [false];
      });
      return;
    }
    
    if (typeof Meteor._reload.onMigrate === 'function') {
      // this is the older method, deprecated?
      Meteor._reload.onMigrate('phonegapapp', function () {
        phonegapapp.meteorRider();
        return [false];
      });
      return;
    }

  });
}
