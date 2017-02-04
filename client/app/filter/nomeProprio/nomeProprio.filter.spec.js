'use strict';

describe('Filter: nomeProprio', function() {
  // load the filter's module
  beforeEach(module('oauthApplicationApp.nomeProprio'));

  // initialize a new instance of the filter before each test
  var nomeProprio;
  beforeEach(inject(function($filter) {
    nomeProprio = $filter('nomeProprio');
  }));

  it('should return the input prefixed with "nomeProprio filter:"', function() {
    var text = 'angularjs';
    expect(nomeProprio(text)).toBe('nomeProprio filter: ' + text);
  });
});
