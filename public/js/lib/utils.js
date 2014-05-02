define([
  'jquery',
  'log',
  'underscore'
], function($, log, _) {

  'use strict';

  var console = log('utils');

  console.log({'foo': 'bar'});

  var $body = $('body');
  var netCodeRX = /^[0-9]{2,3}$/;

  var utils =  {
    $body: $body,
    $doc: $(document),
    bodyData: $body.data(),
    encodeURIComponent: function encodeURIComponent(uri) {
      return window.encodeURIComponent(uri).replace(/%20/g, '+');
    },
    decodeURIComponent: function decodeURIComponent(uri) {
      return window.decodeURIComponent(uri.replace(/\+/g, ' '));
    },
    trackClick: function() {
      console.log('trackClick');
      // TODO: Add real functionality here.
    },
    trackEvent: function() {
      console.log('trackEvent');
      // TODO: Add real functionality here.
    },
    mozPaymentProvider: window.mozPaymentProvider || {},
    getNetworkCodes: function() {
      // Returns mcc/mnc if available.
      var mpp = utils.mozPaymentProvider;
      var networkCodes = {};
      var mcc;
      var mnc;

      // Pre 1.4
      if (mpp.mcc && mpp.mnc) {
        mcc = mpp.mcc[0];
        console.log('mcc: ' + mpp.mcc);
        mnc = mpp.mnc[0];
        console.log('mnc: ' + mpp.mnc);
      // 1.4+ multi-sim support
      } else if (mpp.iccInfo) {
        var values = _.values(mpp.iccInfo);
        for (var i=0, j=values.length; i<j; i++) {
          if (values[i].dataPrimary === true) {
            mcc = values[i].mcc;
            mnc = values[i].mnc;
          }
        }
      } else {
        console.log('[cli] mnc/mcc not available');
      }

      if (netCodeRX.test(mcc) && netCodeRX.test(mnc)) {
        networkCodes.mcc = mcc;
        networkCodes.mnc = mnc;
      }

      return networkCodes;
    }
  };

  return utils;
});


