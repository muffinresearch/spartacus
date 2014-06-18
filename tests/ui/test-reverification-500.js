var helpers = require('../helpers');

helpers.startCasper({
  setUp: function(){
    helpers.fakeVerification();
    helpers.fakeStartTransaction();
    helpers.fakePinData({data: {pin: true}});
  },
});

casper.test.begin('Reverification fails with 500 then retry success.', {
  test: function(test) {

    // Initial auth
    helpers.doLogin();

    // On enter pin page click forgot pin link.
    casper.waitForUrl(helpers.url('enter-pin'), function() {
      this.click('.forgot-pin a');
    });

    // Then continue...
    casper.waitForUrl(helpers.url('reset-start'), function() {
      helpers.fakeLogout();
      this.click('.button.cta');
    });

    // Click for re-auth...
    casper.waitForUrl(helpers.url('force-auth'), function() {
      helpers.fakeVerification({reverify: true, statusCode: 500});
      this.click('#signin');
    });


    casper.waitForSelector('.full-error', function() {
      test.assertVisible('.full-error', 'Error page should be shown');
      helpers.assertErrorCode('REVERIFY_FAILED');

      test.assertVisible('.button.cta', 'CTA buttons should be visible');
      test.assertVisible('.button.cancel', 'Cancel button should be visible');

      helpers.fakeVerification({reverify: true});

      this.click('button.cta');
    });

    casper.waitForUrl(helpers.url('reset-pin'), function() {
      test.assertVisible('.pinbox', 'Pin entry widget should be displayed');
    });

    casper.run(function() {
      test.done();
    });
  },
});
