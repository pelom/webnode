'use strict';
import smtpTransport from 'nodemailer-smtp-transport';
import nodemailer from 'nodemailer';
export default class Transport {
  constructor(options) {
    this.options = options;
  }
  send(message, callback) {
    let smtpTrans = smtpTransport(this.options);
    let nodeMail = nodemailer.createTransport(smtpTrans);
    nodeMail.sendMail(message, callback);
  }
}
