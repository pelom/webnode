'use strict';

export default class LoginController {
  user = {
    username: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $scope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.referrer = $state.params.referrer || $state.current.referrer || 'home';
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.login({
        username: this.user.username, password: this.user.password
      })
      .then(/*user*/() => {
        this.$state.go(this.referrer);
      })
      .catch(err => {
        this.errors.login = err.message;
      });
    }
  }
}
