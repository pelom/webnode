'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class ChangePasswordComponent {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;
  /*@ngInject*/
  constructor($state, Auth) {
    'ngInject';
    this.Auth = Auth;
    this.token = $state.params.token;
    console.log('Token: ', this.token);
  }

  changePassword(form) {
    this.submitted = true;
    console.log(this.user);
    console.log(this.requiredPassword);
    if(form.$valid) {
      /*this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
        */
    }
  }
  /*constructor(Auth) {
    'ngInject';
  }*/
}

export default angular.module('directives.changepassword', [])
  .component('changepassword', {
    template: require('./change.password.html'),
    controller: ChangePasswordComponent,
    bindings: {
      requiredPassword: '='
    },
  })
  .name;
