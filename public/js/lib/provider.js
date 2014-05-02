define([
  'jquery',
  'log',
  'utils'
], function($, log, utils) {

  'use strict';

  var provider = {

    _simChanged: function _simChanged() {
      var changed = false;
      var iccKey;
      var lastIcc;

      // Compare the last used SIM(s) to the current SIM(s).

      // TODO: Bug 942361 Implement algorithm proposed at
      // https://wiki.mozilla.org/WebAPI/WebPayment/Multi-SIM#Firefox_OS_v1.4

      // Since Firefox OS 1.4 the mozPaymentProvider API does not include
      // separated properties for the ICC ID, MCC and MNC values anymore,
      // but an 'iccInfo' object containing these values and extra
      // improved logic for the multi-SIM scenario.
      // information that allows the payment provider to deliver an
      if (utils.mozPaymentProvider.iccInfo) {
        // Firefox OS version >= 1.4
        // Until Bug 942361 is done, we just take the iccInfo of the
        // first SIM.
        var paymentServiceId = '0';
        if (utils.mozPaymentProvider.iccInfo[paymentServiceId]) {
          iccKey = utils.mozPaymentProvider.iccInfo[paymentServiceId].iccId;
        }
      } else if (utils.mozPaymentProvider.iccIds) {
        // Firefox OS version < 1.4
        iccKey = utils.mozPaymentProvider.iccIds.join(';');
      }

      if (iccKey) {
        lastIcc = window.localStorage.getItem('lastIcc');
        window.localStorage.setItem('lastIcc', iccKey);
        if (lastIcc && lastIcc !== iccKey) {
          console.log('new icc', iccKey, '!== saved icc', lastIcc);
          changed = true;
          console.log('sim changed');
          utils.trackEvent({'action': 'sim change detection',
                                'label': 'Sim Changed'});
        } else {
          console.log('sim did not change');
        }
      } else {
        console.log('iccKey unavailable');
      }
      return changed;
    },

    prepareSim: function _prepareSim() {
      if (provider._simChanged()) {
        // Log out if a new SIM is used.
        return provider.logout();
      } else {
        // Nothing to do so return a resolved deferred.
        return $.Deferred().resolve();
      }
    },

    prepareAll: function _prepareAll(userHash) {
      var doLogout = false;
      if (!userHash) {
        throw new Error('userHash was empty');
      }
      var existingUser = window.localStorage.getItem('userHash');
      window.localStorage.setItem('userHash', userHash);

      if (existingUser && existingUser !== userHash) {
        console.log('logout: new user hash', userHash, '!== saved hash', existingUser);
        utils.trackEvent({'action': 'user change detection',
                              'label': 'User Changed'});
        doLogout = true;
      }

      if (provider._simChanged()) {
        // Log out if a new SIM is used.
        doLogout = true;
      }

      if (doLogout) {
        // Clear Provider cookies.
        return provider.logout();
      } else {
        // Nothing to do so return a resolved deferred.
        return $.Deferred().resolve();
      }
    },

    // Log out of Provider so that cookies are cleared.
    logout: function _providerLogout() {
      console.log('Logging out of Provider');
      var providerReq = $.ajax({
        url: utils.bodyData.providerLogoutUrl,
        dataType: 'script'
      }).done(function(data, textStatus, $xhr) {
        console.log('logout responded: ' + $xhr.status);
        if ($xhr.status.toString()[0] !== '2') { // 2xx status
          providerReq.reject();
          return;
        }
        utils.trackEvent({'action': 'provider logout',
                              'label': 'Provider Logout Success'});
      })
      .fail(function($xhr, textStatus, errorThrown) {
        console.log('logout failed with status=' + $xhr.status +
                    '; resp=' + textStatus + '; error=' + errorThrown);
        utils.trackEvent({'action': 'provider logout',
                                'label': 'Provider Logout Failure'});
      });
      return providerReq;
    }
  };

  return provider;
});
