define([
  'backbone',
  'i18n-abide-utils',
  'jquery',
  'log',
  'underscore',
  'utils',
  'views/create-pin',
  'views/enter-pin',
  'views/locked',
  'views/login',
  'views/reset-pin',
  'views/reset-start',
  'views/throbber',
  'views/wait-for-tx',
  'views/was-locked',
], function(Backbone, i18n, $, log, _, utils, CreatePinView, EnterPinView, LockedView, LoginView, ResetPinView, ResetStartView, throbber, WaitView, WasLockedView){

  'use strict';

  var console = log('router');

  /*
   * BaseRouter allows conditionally to run a before
   * route function.
   */
  var BaseRouter = Backbone.Router.extend({

    // Execute happens when ever a route is matched
    // but before the callback is run.
    execute: function(callback, args) {
      var result = this.before.apply(this, args);
      // If `before()` returns false return false to prevent
      // the route from happening.
      if (result === false) {
        return false;
      }
      if (callback) {
        callback.apply(this, args);
      }
      this.after.apply(this, args);
    },

    before: function(){},
    after: function(){},

    currentView: null,

  });

  var AppRouter = BaseRouter.extend({
    root: '/mozpay',

    routes: {
      '': 'showIndex',
      'create-pin': 'showCreatePin',
      'enter-pin': 'showEnterPin',
      'locked': 'showLocked',
      'login': 'showLogin',
      'reset-pin': 'showResetPin',
      'reset-start': 'showResetStart',
      'wait-for-tx': 'showWaitForTX',
      'was-locked': 'showWasLocked',
    },

    before: function() {
      // If logged_in state hasn't yet been set we need to prevent
      // routing until it is.
      if (app.user.get('logged_in') === null) {
        console.log('Preventing navigation as logged_in state is unknown.');
        return false;
      }
      // If logged_in state is false then we need to always show the login page.
      // assuming that's not where we already are.
      if (app.user.get('logged_in') === false && Backbone.history.fragment !== 'login') {
        console.log('Not login page and logged_out so navigating to /login');
        this.navigate('/login', {trigger: true});
        return false;
      }
    },

    /*
     * Special navigation function that will navigates to route to
     * ensure a view is called even if we're already on the same url.
     */
    forceNavigate: function(path, config) {
      config = config || {trigger: true};
      this.navigate('', {replace: true});
      this.navigate(path, config);
    },

    showLogin: function() {
      var loginView = new LoginView({
        model: app.user
      });
      loginView.render();
    },

    showCreatePin: function() {
      var createPinView = new CreatePinView();
      createPinView.render();
    },

    showEnterPin: function() {
      var enterPinView = new EnterPinView({
        model: app.user
      });
      enterPinView.render();
    },

    showResetPin: function() {
      var resetPinView = new ResetPinView();
      resetPinView.render();
    },

    showResetStart: function() {
      var resetStartView = new ResetStartView();
      resetStartView.render();
    },

    showLocked: function() {
      var lockedView = new LockedView();
      lockedView.render();
    },

    showWasLocked: function() {
      var wasLockedView = new WasLockedView();
      wasLockedView.render();
    },

    showWaitForTX: function() {
      var waitView = new WaitView();
      waitView.render();
    },

    showIndex: function() {
      // Default page will just show "Loading..."
      console.log('Showing default throbber');
      throbber.show();
    }

  });

  return {
    AppRouter: AppRouter,
    BaseRouter: BaseRouter
  };

});
