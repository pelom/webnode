'use strict';
exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],
  signup: true,
  applicationDefault: {
    name: 'WebNode',
    show: true,
    menuLeft: [
      /*{ state: 'login', title: 'Meu test', show: true }*/
    ],
    menuRight: [
      { state: 'signup', title: 'Cadastre-se', icon: 'fa-edit', show: false },
      { state: 'login', title: 'Entrar', icon: 'fa-sign-in', show: true }
    ]
  }
};
