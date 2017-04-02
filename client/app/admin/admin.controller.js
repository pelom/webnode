'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor(Auth) {
    this.getCurrentUser = Auth.getCurrentUserSync;
  }
}
