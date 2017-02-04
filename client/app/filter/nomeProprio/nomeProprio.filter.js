'use strict';
const angular = require('angular');

/*@ngInject*/
export function nomeProprioFilter() {
  return function(input) {
    console.log(input);
    if (!input) {
      return input;
    }
    if (input.trim().length < 2) {
      return input;
    }
    let tokens = input.split(' ');
    let inputNew = '';
    tokens.forEach(function(item) {
      inputNew += item.charAt(0).toUpperCase() + item.substring(1).toLowerCase() + ' ';
    });
    return inputNew;
  };
}

export default angular.module('oauthApplicationApp.nomeProprio', [])
  .filter('nomeProprio', nomeProprioFilter)
  .name;
