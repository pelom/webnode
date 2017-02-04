'use strict';

describe('Directive: nomeproprio', function() {
  // load the directive's module
  beforeEach(module('oauthApplicationApp.directive.nomeproprio'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<nomeproprio></nomeproprio>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the nomeproprio directive');
  }));
});
