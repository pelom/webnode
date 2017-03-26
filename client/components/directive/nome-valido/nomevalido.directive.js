'use strict';
const angular = require('angular');
export default angular.module('webnodeApp.directive.nomevalido', [])
  .directive('nomevalido', function() {
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }
        let config = attrs.nomevalido;
        let param = (config.trim() === 'false') ? false : true;

        ngModelCtrl.$parsers.push(function(val) {

          if (angular.isUndefined(val)) {
            var val = '';
          }
          //var clean = val.replace(/[^0-9]+/g, '');
          let clean = '';
          if (!param) {
            clean = val.replace(/[^a-záéíóúàâêôãõüç]/i, '');
          } else {
            clean = val.replace(/[^a-záéíóúàâêôãõüç ]/i, '');
          }
          if (val !== clean) {
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
          }
          return clean;
        });
        element.bind('keypress', function(event) {
          if (event.keyCode === 32 && !param) { //space
            event.preventDefault();
          }
        });
      }
    };
  }).name;
