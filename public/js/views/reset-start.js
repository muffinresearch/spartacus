define([
  'i18n-abide-utils',
  'jquery',
  'log',
  'provider',
  'settings',
  'underscore',
  'utils',
  'views/base',
  'views/error-overlay',
  'views/throbber'
], function(i18n, $, log, provider, settings, _, utils, BaseView, ErrorOverlay, throbber){

  'use strict';


  var console = log('view', 'reset-start');
  console.dir(settings);

  var ResetStartView = BaseView.extend({

    events: {
      'click .back': 'handleBack',
      'click .cta:enabled': 'handleResetStart',
    },

    handleBack: function(e) {
      e.preventDefault();
      app.router.navigate('/enter-pin', {trigger: true});
    },

    handleResetStart: function(e) {
      e.stopPropagation();
      e.preventDefault();

      throbber.show(i18n.gettext('Connecting to Persona'));

      function runForgotPinLogout() {

        var error = new ErrorOverlay();
        var personaLoggedOut = $.Deferred();

        // Override logout handler so we can
        // control authResetUser.
        var oldLogout = app.user.logoutHandler;
        console.log(oldLogout);

        app.user.logoutHandler = function() {
          console.log('forgot-pin onLogout');
          personaLoggedOut.resolve();
          app.user.logoutHandler = oldLogout;
        };

        console.log(app.user.logoutHandler);
        // Logout promises.
        var authResetUser = app.user.resetUser();
        var providerLogout = provider.logout();

        console.log('starting logout timer.');

        var resetLogoutTimeout = window.setTimeout(function() {
          // If the log-out times-out then abort/reject the requests/deferred.
          console.log('logout timed-out');
          authResetUser.abort();
          providerLogout.abort();
          personaLoggedOut.reject();
        }, settings.logout_timeout);

        $.when(authResetUser, providerLogout, personaLoggedOut).done(function _allLoggedOut() {
          console.log('Clearing logout reset timer.');
          window.clearTimeout(resetLogoutTimeout);
          utils.trackEvent({action: 'forgot pin',
                            label: 'Logout Success'});
          console.log('Navigating to /reset-pin');
          app.router.navigate('/reset-pin', {'trigger': true});
        })
        .fail(function _failedLogout() {
          // Called when we manually abort everything
          // or if something fails.
          console.log('Clearing logout reset timer.');
          window.clearTimeout(resetLogoutTimeout);
          utils.trackEvent({'action': 'forgot pin',
                                  'label': 'Logout Error'});
          // This can be a timeout or a failure. So a more generic message is needed.
          error.render({msg: i18n.gettext('Something went wrong. Try again?'),
                        errorCode: 'LOGOUT_ERROR', buttonFunc: runForgotPinLogout});
        })
        .always(function _idLogout() {
          // Finally, log out of Persona so that the user has to
          // re-authenticate before resetting a PIN.
          if (app.user.get('logged_in') === true) {
            console.log('[pay] Logging out of Persona');
            navigator.id.logout();
          } else {
            console.log('[pay] Already logged out of Persona, calling activeOnLogout ourself.');
            app.user.logoutHandler();
          }
        });
      }
      runForgotPinLogout();

    },

    render: function(){
      console.log('rendering reset-start view');
      this.setTitle(this.gettext('Reset your Pin?'));
      this.renderTemplate('reset-start.html');
      throbber.hide();
      return this;
    }

  });

  return ResetStartView;
});
