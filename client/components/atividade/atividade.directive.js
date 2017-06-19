'use strict';
/*eslint camelcase: 0*/
import angular from 'angular';
export default angular.module('webnodeApp.atividade', [])
  .directive('atividade', function() {
    return {
      require: 'ngModel',
      replace: true,
      scope: {
        ngModel: '=',
        eventController: '=',
      },
      template: require('./atividade.html'),
    };
  }).name;
