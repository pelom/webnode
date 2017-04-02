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
    this.token = $state.params.token;
    this.$state = $state;
    this.Auth = Auth;
    this.user = Auth.getCurrentUserSync();
    this.initToken();
  }
  initToken() {
    if(angular.isUndefined(this.token)) {
      return;
    }
    this.Auth.getSignupValid(this.token)
      .then(user => {
        if(!user) {
          this.$state.go('login');
          return null;
        }
        this.user = user;
        return user;
      })
      .catch(err => {
        console.log(err);
        this.$state.go('login');
      });
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
      requiredPassword: '=',
      title: '@'
    },
  })
  .name;
