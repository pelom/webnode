/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import Application from '../api/application/application.model';
import Profile from '../api/profile/profile.model';
import User from '../api/user/user.model';

Thing.find({}).remove()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, ' +
        'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, ' +
        'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
        'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
        'tests alongside code. Automatic injection of scripts and ' +
        'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
        'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
        'payload, minifies your scripts/css/images, and rewrites asset ' +
        'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
        'and openshift subgenerators'
    });
  });

Profile.find({}).remove()
  .then(() => {
    Application.create([{
      nome: 'profileAdmin',
      descricao: 'Perfil administrador'
    }, {
      nome: 'profileSeller',
      descricao: 'Perfil vendedor'
    }]).then((app)=> {
      console.log('finished populating Application', app);
      let permissionList = [];
      app.forEach(function(ap) {
        permissionList.push(ap._id);
      });
      Profile.create({
          nome: 'Profile Admin',
          descricao: 'Perfil do administrador',
          isAtivo: true,
          applications: permissionList
        })
        .then(() => {
          console.log('finished populating Profile');

          User.find({}).remove()
            .then(() => {
              Profile.findOne({'nome':'Profile Admin'})
              .then(prof => {
                console.log('Find Profile: ', prof);
                User.create([{
                    provider: 'local',
                    nome: 'Test',
                    sobrenome: 'User',
                    email: 'test@example.com',
                    password: 'asdasd',
                    isAtivo: true
                  }, {
                    provider: 'local',
                    role: 'admin',
                    nome: 'Admin',
                    sobrenome: 'Sistemas',
                    email: 'admin@example.com',
                    password: 'admin',
                    isAtivo: true,
                    profileId: prof._id
                  }])
                  .then(users => {
                    console.log('finished populating users', users);
                  });
              });

            });

        });
    });
  });
