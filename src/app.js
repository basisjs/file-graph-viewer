basis.require('basis.ui');
;;;basis.require('basis.devpanel');

basis.ready(function(){
  var view = resource('module/view/index.js').fetch();
  new basis.ui.Node({
    container: document.body,
    template: resource('app/template/layout.tmpl'),
    binding: {
      view: view
    },
    action: {
      loadDefault: function(){
        view.dataType.loadMap(resource('data/file-map.json').fetch());
      },
      loadDocs: function(){
        view.dataType.loadMap(resource('data/file-map.docs.json').fetch());
      }
    }
  });
});
