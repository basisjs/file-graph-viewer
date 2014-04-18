require('basis.ui');

var type = require('./type.js');

module.exports = new basis.ui.Node({
  dataType: type,

  template: resource('./template/view.tmpl'),
  binding: {
    //list: list,
    //details: details,
    fileStat: require('./module/fileStat/index.js'),
    graph: require('./module/graph/index.js')
  }
});

