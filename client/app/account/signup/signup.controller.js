'use strict';

import angular from 'angular';

export default class SignupController {
  user = {
    name: '',
    nome: '',
    sobrenome: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  errors = {};
  conta = false;
  /*@ngInject*/
  constructor(Auth, $state, appConfig/*$scope*/) {
    var isSignup = Boolean(appConfig.signup);
    if(!isSignup) {
      $state.go('login');
      return;
    }
    this.Auth = Auth;
    this.$state = $state;

    /*$scope.$watch('vm.user.nome', function() {
      $scope.vm.user.nome = $scope.vm.user.nome.toLowerCase();
    });*/
  }

  register(form) {
    if(form.$valid) {
      //console.log(this.user);
      return this.Auth.createUser({
        nome: this.user.nome,
        sobrenome: this.user.sobrenome,
        email: this.user.email,
        username: this.user.email,
        password: this.user.password
      })
      .then(() => {
        this.conta = true;
        // Account created, redirect to home
        //this.$state.go('main');
      })
      .catch(err => {
        err = err.data;
        this.errors = {};
        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, (error, field) => {
          //form[field].$setValidity('mongoose', false);
          this.errors[field] = error.message;
        });
      });
    }
  }
}
