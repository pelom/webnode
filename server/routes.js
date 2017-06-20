/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app, agenda) {
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/application', require('./api/application'));
  app.use('/api/profile', require('./api/profile'));
  app.use('/api/event', require('./api/event'));
  app.use('/api/lead', require('./api/lead'));
  app.use('/api/contact', require('./api/contact'));
  app.use('/api/account', require('./api/account'));
  app.use('/api/product', require('./api/product'));

  app.use('/api/job', require('./api/job')(agenda));

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
