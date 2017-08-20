const sendgrid = require('sendgrid');
const helper = sendgrid.mail; //don't want to use es6 destructuring b.c we want to call it helper. not mail.
const keys = require('../config/keys');

class Mailer extends helper.Mail {
  // constructor doesn't need to receive a survey model obj.
  // It just has to be an object that has a subject and recipients.
  // the second parameter is the html string, that we'll call content
  // this design lets us use this Mailer for sending more than just surveys
  // this mailer obj is defined here created in the surveyRoutes to send the emails.
  constructor({ subject, recipients }, content) {
    super(); // first runs constructor for Mail class
    // most of the setup here is dictated by sendgrid
    this.sgApi = sendgrid(keys.sendGridKey);
    this.from_email = new helper.Email('no-reply@emaily.com');
    this.subject = subject;
    this.body = new helper.Content('text/html', content);
    this.recipients = this.formatAddresses(recipients);

    this.addContent(this.body); // Mail class function required to actually register the body.
    this.addClickTracking(); // We write this
    this.addRecipients(); // We write this
  }

  formatAddresses(recipients) {
    // ES6 destructuring requires extra parens if you're doing an arrow function
    return recipients.map(({ email }) => {
      return new helper.Email(email);
    });
  }

  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings();
    const clickTracking = new helper.ClickTracking(true, true);

    trackingSettings.setClickTracking(clickTracking);
    this.addTrackingSettings(trackingSettings);
  }

  addRecipients() {
    const personalize = new helper.Personalization();

    this.recipients.forEach(recipient => {
      personalize.addTo(recipient);
    });
    this.addPersonalization(personalize); //addPersonalization class function;
  }

  async send() {
    const request = this.sgApi.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: this.toJSON()
    });
    const response = await this.sgApi.API(request);
    return response;
  }
}

module.exports = Mailer;
