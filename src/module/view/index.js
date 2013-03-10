basis.require('basis.ui');

var type = resource('type.js').fetch();

//var list = resource('module/list/index.js').fetch();
//var details = resource('module/details/index.js').fetch();

/*list.selection.addHandler({
  datasetChanged: function(sender){
    details.setDelegate(sender.pick());
  }
}, details);*/

module.exports = new basis.ui.Node({
  dataType: type,

  template: resource('template/view.tmpl'),
  binding: {
    //list: list,
    //details: details,
    fileStat: resource('module/fileStat/index.js').fetch(),
    graph: resource('module/graph/index.js').fetch()
  }
});

