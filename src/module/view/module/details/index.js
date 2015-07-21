var Node = require('basis.ui').Node;
var files = require('app.type');

var FileView = Node.subclass({
  autoDelegate: true,
  handler: {
    update: function(sender, delta){
      if ('filename' in delta)
        this.setDataSource(this.data.filename ? this.dataset.getSubset(this.data.filename, true) : null);
    }
  },

  template: resource('templates/fileList.tmpl'),
  binding: {
    name: 'name'
  },

  childClass: {
    template: resource('templates/file.tmpl')
  }
});

var linkToView = new FileView({
  dataset: files.linkTo,
  name: 'File reference to',

  sorting: 'data.to',
  childClass: {
    binding: {
      title: 'data:to'
    }
  }
});

var linkFromView = new FileView({
  dataset: files.linkFrom,
  name: 'Referenced files',

  sorting: 'data.from',
  childClass: {
    binding: {
      title: 'data:from'
    }
  }
});

module.exports = new Node({
  template: resource('templates/layout.tmpl'),
  binding: {
    filename: 'data:',
    hasModel: {
      events: 'delegateChanged',
      getter: function(node){
        return node.delegate ? 'hasModel' : '';
      }
    },
    linkTo: 'satellite:',
    linkFrom: 'satellite:'
  },
  satellite: {
    linkTo: linkToView,
    linkFrom: linkFromView
  }
});
