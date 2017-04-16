'use strict';
/* eslint no-sync: 0 */
export default class HomeController {
  /*@ngInject*/
  constructor(Auth) {
    this.getCurrentUser = Auth.getCurrentUserSync;
  }
}
