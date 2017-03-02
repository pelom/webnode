'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor(Auth, User) {
    this.getCurrentUser = Auth.getCurrentUserSync;
    // Use the User $resource to fetch all users
    //this.users = User.query();
  }
}
