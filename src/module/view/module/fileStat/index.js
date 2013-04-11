basis.require('basis.ui');
basis.require('basis.data.dataset');

var type = resource('../../type.js').fetch();

var fileByType = new basis.data.dataset.Split({
  source: type.files,
  rule: 'data.type'
});

var view = new basis.ui.Node({
  dataSource: fileByType,

  template: resource('template/fileStat.tmpl'),
  binding: {
    totalCount: function(){
      return type.files.itemCount;
    },
    noSelected: 'selection.itemCount == 0'
  },
  action: {
    resetSelection: function(){
      this.selection.clear();
    }
  },

  listen: {
    selection: {
      itemsChanged: function(selection){
        this.updateBind('noSelected');
        type.matched.setSources(selection.getItems().map(function(node){
          return node.delegate;
        }));
      }
    }
  },

  selection: true,
  childClass: {
    template: resource('template/type.tmpl'),
    binding: {
      type: 'data:title',
      count: function(node){
        return node.delegate && node.delegate.itemCount;
      }
    },
    listen: {
      delegate: {
        itemsChanged: function(){
          this.updateBind('count');
        }
      }
    }
  }
});

type.files.addHandler({
  itemsChanged: function(){
    view.updateBind('totalCount');
  }
});

module.exports = view;