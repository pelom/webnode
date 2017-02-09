'use strict';

const EventEmitter = require('events');

// CONSTANTS
let APP_ROLE_SEPARATOR = '.';
let name = '';
let applications = {};
let profiles = {};
let users = {};

let Monitor = class Monitor extends EventEmitter {
  constructor() {
    super();
  }
};

let Application = class Application extends EventEmitter {
  constructor(name, roles) {
    super();

    this.name = name;
    this.roles = [];

    if(roles && roles.length) {
      this.addRoles.apply(this, roles);
    }
  }

  addRoles() {
    for(var i = 0; i < arguments.length; i++) {
      if(this.roles.indexOf(arguments[i]) == -1) {
        this.roles.push(arguments[i]);

        this.emit('role.add', arguments[i]);
        monitor.emit('app.addrole', this.name, arguments[i]);
      }
    }
    return this;
  }

  removeRoles() {
    for(var i = 0; i < arguments.length; i++) {
      if(this.roles.indexOf(arguments[i]) != -1) {
        this.roles.splice(this.roles.indexOf(arguments[i]), 1);

        this.emit('role.del', arguments[i]);
        monitor.emit('app.delrole', this.name, arguments[i]);
      }
    }
    return this;
  }

  write(data) {
    this.emit('data', data);
  }
};

let Profile = class Profile extends EventEmitter {
  constructor(name, roles) {
    super();

    this.name = name;
    this.roles = [];
    this.applications = [];

    if(roles && roles.length) {
      this.addRoles.apply(this, roles);
    }
  }

  addRoles() {
    for(var i = 0; i < arguments.length; i++) {
      var role = arguments[i];

      if(role.indexOf(APP_ROLE_SEPARATOR) <= 0) {
        throw new Error('A role must have an associated application');
      }

      role = role.split(APP_ROLE_SEPARATOR, 2);

      if(!applications.hasOwnProperty(role[0])) {
        throw new Error('Application not found');
      }

      if(role[1] == '*') {
        for(var j = 0; j < applications[role[0]].roles.length; j++) {
          this.__addRole(role[0], applications[role[0]].roles[j]);
        }

        if(this.applications.indexOf(role[0]) == -1) {
          applications[role[0]].on('role.add', this.__watchNewRoles(this, role[0]));
          applications[role[0]].on('role.del', this.__watchRemoveRoles(this, role[0]));

          this.applications.push(role[0]);
        }
      } else {
        if(applications[role[0]].roles.indexOf(role[1]) == -1) {
          if(monitor.listeners('role.invalid').length == 0) {
            throw new Error('Application ' + role[0] + ' does not have ' + role[1] + ' role');
          } else {
            monitor.emit('role.invalid', role[0], role[1]);
          }
        }

        this.__addRole(role[0], role[1]);
      }
    }
    return this;
  }

  removeRoles() {
    for(var i = 0; i < arguments.length; i++) {
      var role = arguments[i];

      if(role.indexOf(APP_ROLE_SEPARATOR) <= 0) {
        throw new Error('A role must have an associated application');
      }

      role = role.split(APP_ROLE_SEPARATOR, 2);

      if(!applications.hasOwnProperty(role[0])) {
        throw new Error('Application not found');
      }

      if(role[1] == '*') {
        for(var j = 0; j < applications[role[0]].roles.length; j++) {
          this.__removeRole(role[0], applications[role[0]].roles[j]);
        }

        if(this.applications.indexOf(role[0]) != -1) {
          applications[role[0]].removeListener('role.add', this.__watchNewRoles(this, role[0]));
          applications[role[0]].removeListener('role.del', this.__watchRemoveRoles(this, role[0]));

          this.applications.splice(this.applications.indexOf(role[0]), 1);
        }
      } else {
        if(applications[role[0]].roles.indexOf(role[1]) == -1) {
          if(monitor.listeners('role.invalid').length == 0) {
            throw new Error('Application ' + role[0] + ' does not have ' + role[1] + ' role');
          } else {
            monitor.emit('role.invalid', role[0], role[1]);
          }
        }

        this.__removeRole(role[0], role[1]);
      }
    }
    return this;
  }

   hasRoles() {
    for(var i = 0; i < arguments.length; i++) {
      var role = arguments[i];

      if(role.indexOf(APP_ROLE_SEPARATOR) <= 0) return false;
      role = role.split(APP_ROLE_SEPARATOR, 2);

      if(!applications.hasOwnProperty(role[0])) return false;

      if(role[1] == '*') {
        for(var j = 0; j < applications[role[0]].roles.length; j++) {
          if(this.roles.indexOf(role[0] + APP_ROLE_SEPARATOR + applications[role[0]].roles[j]) == -1) return false;
        }
      } else {
        if(applications[role[0]].roles.indexOf(role[1]) == -1) {
          if(monitor.listeners('role.invalid').length == 0) {
            throw new Error('Application ' + role[0] + ' does not have ' + role[1] + ' role');
          } else {
            monitor.emit('role.invalid', role[0], role[1]);
          }
        }
        if(this.roles.indexOf(role.join(APP_ROLE_SEPARATOR)) == -1) return false;
      }
    }
    return true;
  }

  hasAnyRoles() {
    for(var i = 0; i < arguments.length; i++) {
      var role = arguments[i];

      if(role.indexOf(APP_ROLE_SEPARATOR) <= 0) continue;

      role = role.split(APP_ROLE_SEPARATOR, 2);

      if(!applications.hasOwnProperty(role[0])) continue;

      if(role[1] == '*') {
        for(var j = 0; j < applications[role[0]].roles.length; j++) {
          if(this.roles.indexOf(role[0] + APP_ROLE_SEPARATOR + applications[role[0]].roles[j]) != -1) return true;
        }
      } else {
        if(applications[role[0]].roles.indexOf(role[1]) == -1) {
          if(monitor.listeners('role.invalid').length == 0) {
            throw new Error('Application ' + role[0] + ' does not have ' + role[1] + ' role');
          } else {
            monitor.emit('role.invalid', role[0], role[1]);
          }
        }
        if(this.roles.indexOf(role.join(APP_ROLE_SEPARATOR)) != -1) return true;
      }
    }
    return false;
  }

  __addRole(app, role) {
    var app_role = app + APP_ROLE_SEPARATOR + role;

    if(this.roles.indexOf(app_role) == -1) {
      this.roles.push(app_role);
      monitor.emit('profile.addrole', this.name, app, role);
    }
  }
  __removeRole(app, role) {
    var app_role = app + APP_ROLE_SEPARATOR + role;

    if(this.roles.indexOf(app_role) != -1) {
      this.roles.splice(this.roles.indexOf(app_role), 1);
      monitor.emit('profile.delrole', this.name, app, role);
    }
  }
  __watchNewRoles(profile, app) {
    return function(role) {
      var app_role = app + APP_ROLE_SEPARATOR + role;
      if(profile.roles.indexOf(app_role) == -1) {
        profile.roles.push(app_role);
      }
    };
  }
  __watchRemoveRoles(profile, app) {
    return function(role) {
      var app_role = app + APP_ROLE_SEPARATOR + role;
      if(profile.roles.indexOf(app_role) != -1) {
        profile.roles.splice(profile.roles.indexOf(app_role), 1);
      }
    };
  }
};

let addName = function(nam) {
  name = nam;
};
let addApplication = function(name, roles) {
  var app = getApplication(name);

  if(app === null) {
    applications[name] = new Application(name, roles);
  } else if(roles && roles.length) {
    applications[name].addRoles.apply(applications[name], roles);
  }

  if(!module.exports.hasOwnProperty(name)) {
    module.exports[name] = applications[name];
  }
  return applications[name];
};

let getApplication = function(name) {
  if(applications.hasOwnProperty(name)) {
    return applications[name];
  }
  return null;
};

let addProfile = function(name, roles) {
  var profile = getProfile(name);

  if(profile === null) {
    profiles[name] = new Profile(name, roles);
  } else if(roles && roles.length) {
    profiles[name].addRoles.apply(profiles[name], roles);
  }

  if(!module.exports.hasOwnProperty(name)) {
    module.exports[name] = profiles[name];
  }

  return profiles[name];
};

let getProfile = function(name) {
  if(profiles.hasOwnProperty(name)) {
    return profiles[name];
  }
  return null;
};

let exportRoles = function() {
  let modulos = [];
  let perfis = [];

  for(var app in applications) {
    if(applications.hasOwnProperty(app)) {
      let modulo = {
        nome: app,
        funcao: []
      };
      //a[app] = [];
      for(var i = 0; i < applications[app].roles.length; i++) {
        modulo.funcao.push(applications[app].roles[i]);
        //a[app].push(applications[app].roles[i]);
      }
      modulos.push(modulo);
    }
  }
  for(var prof in profiles) {
    if(profiles.hasOwnProperty(prof)) {
      let perfil = {
        nome: prof,
        acesso: []
      };
      //p[prof] = [];
      for(var i = 0; i < profiles[prof].roles.length; i++) {
        perfil.acesso.push(profiles[prof].roles[i]);
        //p[prof].push(profiles[prof].roles[i]);
      }
      perfis.push(perfil);
    }
  }
  return {
    applications: modulos,
    profiles: perfis,
    name: name
  };
};
let monitor = new Monitor();

module.exports = {
  addName: addName,
  getApplication: getApplication,
  addApplication: addApplication,
  getProfile: getProfile,
  addProfile: addProfile,
  export: exportRoles
};
