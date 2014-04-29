var helpers = require('../helpers');

helpers.startCasper('/mozpay', function(){
  helpers.fakePinData({pin: true, pin_is_locked_out: true});
});

casper.test.begin('Login then locked', {
  test: function(test) {

    helpers.doLogin();

    casper.waitForUrl('/mozpay/locked', function() {
      test.assertSelectorHasText('h1', 'Error');
      test.assertVisible('.locked');
      test.assertSelectorHasText('.msg', 'You entered the wrong pin too many times. Your account is locked. Please try your purchase again in 5 minutes.');
    });

    casper.run(function() {
      test.done();
    });

  },
});