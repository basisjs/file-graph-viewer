basis.require('basis.ui');
basis.require('basis.ui.tree');
;;;basis.require('basis.devpanel');

basis.ready(function(){
  var list = resource('module/list/index.js').fetch();
  var details = resource('module/details/index.js').fetch();
  var fileStat = resource('module/fileStat/index.js').fetch();
  var graph = resource('module/graph/index.js').fetch();

  list.selection.addHandler({
    datasetChanged: function(sender){
      details.setDelegate(sender.pick());
    }
  }, details);

  new basis.ui.Node({
    container: document.body,

    template: resource('app/template/layout.tmpl'),

    binding: {
      list: list,
      details: details,
      fileStat: fileStat,
      graph: graph
    }
  });
});
