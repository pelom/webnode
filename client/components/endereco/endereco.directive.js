'use strict';
/*eslint camelcase: 0*/
import angular from 'angular';
export default angular.module('webnodeApp.endereco', [])
  .directive('endereco', function() {
    return {
      require: 'ngModel',
      replace: true,
      scope: {
        ngModel: '=',
        active: '=',
      },
      template: require('./endereco.html'),
    };
  }).name;
