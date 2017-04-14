'use strict';

export default class HomeController {
  /*@ngInject*/
  constructor(Auth) {
    this.getCurrentUser = Auth.getCurrentUserSync;
  }
}
