
  basis.require('basis.ui');
  basis.require('app.files');

  var fileByType = new basis.data.dataset.Split({
    source: app.files.files,
    rule: 'data.type'
  });

  var view = new basis.ui.Node({
    dataSource: fileByType,

    template: resource('template/fileStat.tmpl'),
    binding: {
      totalCount: function(){
        return app.files.files.itemCount;
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
        datasetChanged: function(selection){
          this.updateBind('noSelected');
          app.files.matched.setSources(selection.getItems().map(function(node){
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
          datasetChanged: function(){
            this.updateBind('count');
          }
        }
      }
    }
  });

  app.files.files.addHandler({
    datasetChanged: function(){
      view.updateBind('totalCount');
    }
  });

  module.exports = view;