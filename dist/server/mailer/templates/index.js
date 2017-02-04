'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nodemailerSmtpTransport = require('nodemailer-smtp-transport');

var _nodemailerSmtpTransport2 = _interopRequireDefault(_nodemailerSmtpTransport);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Templation = function () {
  function Templation(options) {
    (0, _classCallCheck3.default)(this, Templation);

    this._getHtml = function (data, templateName) {
      //Resolve our template path using the path of a template given in options,
      //or if the path is the template name itself
      var templatePath = this.options.templates[templateName] || templateName;
      var templateContent = fs.readFileSync(templatePath, 'utf8');

      //Return the rendered version of our template via lodash template method.
      return _lodash2.default.template(templateContent, this.options.templateOptions)(data);
    };

    var defaultOptions = {
      attachments: [],
      templates: {
        defaultTemplate: _path2.default.resolve(__dirname, 'templates/default.html')
      },
      defaultTemplate: _path2.default.resolve(__dirname, 'templates/default.html'),
      templateOptions: {
        interpolate: /{{([\s\S]+?)}}/g
      },
      generateTextFromHTML: true
    };

    this.options = _lodash2.default.assign({}, defaultOptions, options);
  }

  (0, _createClass3.default)(Templation, [{
    key: 'send',
    value: function send(data, callback) {
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

      if ((0, _typeof3.default)(data.to) === 'object') {
        emailData.to = data.to.name + ' <' + data.to.email + '>';
      } else {
        emailData.to = data.to;
      }
      var transportOptions = data.transportOptions || this.options.transportOptions;

      return this._getTransport(transportOptions).sendMail(emailData, callback);
    }
  }, {
    key: '_getTransport',
    value: function _getTransport(options) {
      return _nodemailer2.default.createTransport((0, _nodemailerSmtpTransport2.default)(options));
    }
  }, {
    key: '_getAttachments',
    value: function _getAttachments(html) {
      var attachments = [];
      this._attachments = this.options.attachments;
      //Go through each attachment in our options and find out which ones our template is using
      _lodash2.default.forEach(this._attachments, function (attachment) {
        if (html.indexOf('cid:' + attachment.cid) > -1) attachments.push(attachment);
      });
      return attachments;
    }
  }]);
  return Templation;
}();

exports.default = Templation;
//# sourceMappingURL=index.js.map
