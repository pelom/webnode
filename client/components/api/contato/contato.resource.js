export function ContatoResource($resource) {
  'ngInject';
  return $resource('/api/contact/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
  });
}
