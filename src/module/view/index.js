var Node = require('basis.ui').Node;
var type = require('./type.js');

module.exports = new Node({
  dataType: type,

  template: resource('./template/view.tmpl'),
  binding: {
    //list: list,
    //details: require('./module/details/index.js'),
    fileStat: require('./module/fileStat/index.js'),
    graph: require('./module/graph/index.js')
  }
});

