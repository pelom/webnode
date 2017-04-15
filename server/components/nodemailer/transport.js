'use strict';
import nodemailer from 'nodemailer';
export default class Transport {
  constructor(options) {
    this.options = options;
  }
  send(message, callback) {
    let nodeMail = nodemailer.createTransport(this.options);
    nodeMail.sendMail(message, callback);
  }
}
