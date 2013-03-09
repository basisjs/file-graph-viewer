
  basis.require('basis.ui.tree');
  basis.require('app.files');

  function childFactory(config){
    return config.delegate.data.isDir
      ? new Dir(config)
      : new File(config);
  }

  var Dir = basis.ui.tree.Folder.subclass({
    childFactory: childFactory,

    sorting: 'data.name.toLowerCase()',
    grouping: {
      groupGetter: 'data.isDir',
      sorting: 'data.title',
      sortingDesc: true,
      childClass: {
        template: '<div/>'
      }
    },

    selectable: false,
    //collapsed: true,
    binding: {
      title: 'data:name'
    },
    init: function(){
      basis.ui.tree.Folder.prototype.init.call(this);
      this.setDataSource(app.files.splitByParent.getSubset(this.data.filename, true));
    }
  });

  var File = basis.ui.tree.Node.subclass({
    binding: {
      title: 'data:name'
    }
  });

  var tree = new basis.ui.tree.Tree({
    template: resource('templates/list.tmpl'),

    dataSource: app.files.splitByParent.getSubset('', true),
    sorting: 'data.name.toLowerCase()',
    grouping: {
      groupGetter: 'data.isDir',
      sorting: 'data.title',
      sortingDesc: true,
      childClass: {
        template: '<div/>'
      }
    },

    childFactory: childFactory
  });

  module.exports = tree;
