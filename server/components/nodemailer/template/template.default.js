'use strict';

import * as fs from 'fs';
import path from 'path';
import _ from 'lodash';
export default class TemplationDefault {
  constructor(options) {
    var defaultOptions = {
      attachments: [],
      templates: {
        defaultTemplate: path.resolve(__dirname, './template.default.html')
      },
      defaultTemplate: path.resolve(__dirname, './template.default.html'),
      templateOptions: {
        interpolate: /{{([\s\S]+?)}}/g
      }
    };
    this.options = _.assign({}, defaultOptions, options);
  }
  /**
   *
   */
  bindDataHtml(data) {
    //Get required data to generate HTML
    var templateName = this.options.defaultTemplate;
    //Resolve our template path using the path of a template given in options,
    //or if the path is the template name itself
    var templatePath = this.options.templates[templateName] || templateName;
    var templateContent = fs.readFileSync(templatePath, 'utf8');

    //Return the rendered version of our template via lodash template method.
    return _.template(templateContent, this.options.templateOptions)(data);
  }
}
