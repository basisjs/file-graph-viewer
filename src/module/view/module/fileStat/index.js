require('basis.data.dataset');
require('basis.data.index');
require('basis.ui');

var type = require('../../type.js');
var countIndex = basis.data.index.count;
var fileByType = new basis.data.dataset.Split({
  source: type.files,
  rule: 'data.type'
});

module.exports = new basis.ui.Node({
  dataSource: fileByType,

  template: resource('./template/fileStat.tmpl'),
  binding: {
    totalCount: countIndex(type.files),
    noSelected: function(node){
      return countIndex(node.selection).as(basis.bool.invert);
    }
  },
  action: {
    resetSelection: function(){
      this.selection.clear();
    }
  },

  listen: {
    selection: {
      itemsChanged: function(selection){
        var selected = selection.pick();
        type.matched.setDataset(selected ? selected.delegate : null);
      }
    }
  },

  selection: true,
  childClass: {
    template: resource('./template/type.tmpl'),
    binding: {
      type: 'data:title',
      count: {
        events: 'delegateChanged',
        getter: function(node){
          return node.delegate ? countIndex(node.delegate) : 0;
        }
      }
    }
  }
});
