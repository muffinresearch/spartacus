var helpers = require('../helpers');

helpers.startCasper('/mozpay', function(){
  // Make pinStateCheck return true for pin.
  helpers.fakePinData({pin: true});
  // Make reset-pin API call return 201
  helpers.fakePinData({pin: true}, 'POST', 201, '/mozpay/v1/api/pin/reset/');
});

casper.test.begin('Successful Pin Reset Flow', {
  test: function(test) {

    helpers.doLogin();

    casper.waitForUrl('/mozpay/enter-pin', function() {
      test.assertVisible('.pinbox', 'Pin entry widget should be displayed');
      test.assertVisible('.forgot-pin', 'Forgot link should be there');
      this.click('.forgot-pin');
    });

    casper.waitForUrl('/mozpay/reset-start', function() {
      // Should show message with cancel and continue.
      test.assertVisible('.button.cancel', 'Cancel button should be present + visible.');
      test.assertVisible('.button.cta', 'Continue button should be present + visible.');
      this.click('.cta');
    });

    casper.waitForUrl('/mozpay/reset-pin', function() {
      test.assertVisible('.pinbox', 'Pin entry widget should be displayed');
      this.sendKeys('.pinbox', '1234');
      test.assertExists('.cta:enabled', 'Submit button is enabled');
      this.click('.cta');
    });

    casper.waitForSelector('.stage-two', function() {
      test.assertExists('.cta:disabled', 'Submit button is disabled at start of stage two');
      this.sendKeys('.pinbox', '1234');
      test.assertExists('.cta:enabled', 'Submit button is enabled');
      this.click('.cta');
    });

    casper.waitForUrl('/mozpay/wait-for-tx', function() {
      // Throbber should be visible.
      test.assertVisible('progress');
    });

    casper.run(function() {
      test.done();
    });
  },
});
