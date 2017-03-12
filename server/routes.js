/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
export default function(app) {
  // Insert routes below

  /*app.use('/api/*', (req, res, next) => {
    console.log('Time: %d', Date.now());
    console.log(req.originalUrl); // '/admin/new'
    console.log(req.baseUrl); // '/admin'
    console.log(req.path); // '/new'
    console.log(req.method); // '/new'
    next();
  });
  */
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/application', require('./api/application'));
  app.use('/api/profile', require('./api/profile'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
