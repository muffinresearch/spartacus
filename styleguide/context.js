// Default Context for styleguide pages.

module.exports = {
  error: {
    pageclass: 'full-error',
    heading: "Error Heading",
    msg: "An error message telling the user what happened",
    errorCode: "ERROR_CODE",
    cancelModifier: 'cancel cta',
    cancelText: 'Cancel',
    showCancel: true,
    showCta: false,
  },
  throbber: {
    msg: "Loading",
  },
  pinForm: {
    pinTitle: "Create PIN",
    ctaText: "Continue"
  },
  locked: {
    pageclass: 'full-error locked',
    heading: 'Pin Locked',
    msg: 'You entered the wrong PIN too many times. Your account is locked. Please try your purchase again in 5 minutes.',
    showCancel: true,
    cancelText: 'OK',
    cancelModifier: 'cancel cta',
  },
  textoverflow: {
    pageclass: 'full-error',
    heading: 'Text Overflow Example',
    errorCode: "ERROR_CODE",
    msg: 'Change the size of the screen representation to see how the button layout changes.',
    showCta: true,
    showCancel: true,
    cancelText: 'A long cancel button',
    ctaText: 'Something quite long'
  }
};
