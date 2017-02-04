'use strict';

import * as fs from 'fs';
import path from 'path';
import _ from 'lodash';
import smtpTransport from 'nodemailer-smtp-transport';
import emailer from 'nodemailer';

export default class Templation {
  constructor(options) {
    var defaultOptions = {
      attachments: [],
      templates: {
        defaultTemplate: path.resolve(__dirname, 'templates/default.html')
      },
      defaultTemplate: path.resolve(__dirname, 'templates/default.html'),
      templateOptions: {
        interpolate: /{{([\s\S]+?)}}/g
      },
      generateTextFromHTML: true
    };

    this.options = _.assign({}, defaultOptions, options);
  }

  send(data, callback) {
    //Get required data to generate HTML
    var template = data.template || this.options.defaultTemplate;

    var html = this._getHtml(data.messageData, template);
    var attachments = this._getAttachments(html);

    var emailData = {
      from: data.from || this.options.from,
      subject: data.subject,
      html: html,
      generateTextFromHTML: this.options.generateTextFromHTML,
      attachments: attachments
    };

    if(typeof data.to === 'object') {
      emailData.to = data.to.name + ' <' + data.to.email + '>';
    } else {
      emailData.to = data.to;
    }
    var transportOptions = data.transportOptions || this.options.transportOptions;

    return this._getTransport(transportOptions).sendMail(emailData, callback);
  }
  _getTransport(options) {
    return emailer.createTransport(smtpTransport(options));
  }
  _getHtml = function(data, templateName) {
    //Resolve our template path using the path of a template given in options,
    //or if the path is the template name itself
    var templatePath = this.options.templates[templateName] || templateName;
    var templateContent = fs.readFileSync(templatePath, 'utf8');

    //Return the rendered version of our template via lodash template method.
    return _.template(templateContent, this.options.templateOptions)(data);
  }
  _getAttachments(html) {
    var attachments = [];
    this._attachments = this.options.attachments;
    //Go through each attachment in our options and find out which ones our template is using
    _.forEach(this._attachments, function(attachment) {
    if(html.indexOf('cid:' + attachment.cid) > -1)
      attachments.push(attachment);
    });
    return attachments;
  }
}
