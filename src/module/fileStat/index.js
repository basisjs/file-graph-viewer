
  basis.require('basis.ui');
  basis.require('app.files');

  var fileByType = new basis.data.dataset.Split({
    source: app.files.files,
    rule: 'data.type'
  });

  var view = new basis.ui.Node({
    template: resource('template/fileStat.tmpl'),
    binding: {
      totalCount: function(){
        return app.files.files.itemCount;
      }
    },

    dataSource: fileByType,
    childClass: {
      template: resource('template/type.tmpl'),
      binding: {
        type: 'data:title',
        count: function(node){
          return node.delegate ? node.delegate.itemCount : 0;
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