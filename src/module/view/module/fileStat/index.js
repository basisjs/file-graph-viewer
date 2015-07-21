var Split = require('basis.data.dataset').Split;
var countIndex = require('basis.data.index').count;
var Node = require('basis.ui').Node;
var type = require('../../type.js');

var fileByType = new Split({
  source: type.files,
  rule: 'data.type'
});

module.exports = new Node({
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
