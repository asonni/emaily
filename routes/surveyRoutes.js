const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const Survey = mongoose.model('surveys');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

module.exports = app => {
  app.get('/api/surveys', requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false
    });
    res.send(surveys);
  });

  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.send('Thanks for voting!');
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');

    _.chain(req.body)
      .map(({ email, url }) => {
        // const pathname = new URL(url).pathname;
        const match = p.test(new URL(url).pathname);
        if (match) {
          // const { surveyId, choice } = match;
          // return { email, surveyId, choice };
          return { email, ...match };
        }
      })
      .compact()
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false }
            }
          },
          {
            $inc: { [choice]: 1 },
            $set: { 'recipients.$.responded': true },
            lastResponded: new Date()
          }
        ).exec();
      })
      .value();

    res.send({}); // This line to tell sendgrid the request is fine
  });

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    // ES6 restructuring. Out of req.body, I want to get all of these properties
    // off the body thats added to req. The actual adding logic has to be added in.
    const { title, subject, body, recipients } = req.body;
    // use Survey.js model to represent a new instance of the survey being created
    // stored in memory. Has not been persisted at this point.
    const survey = new Survey({
      // ES6 syntax, instead of doing title: title
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      // takes the list of email addresses, split into array, and return an obj
      // with key of email and value of email address. Hs been shortened ES6 style
      _user: req.user.id, //this is mongo mongoose generated id
      dateSent: Date.now()
    });
    // place to send the email
    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();
      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
};
