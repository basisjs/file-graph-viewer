require('basis.ui');
require('basis.app');
/** @cut */ require('basis.devpanel');

module.exports = basis.app.create({
  init: function(){
    var view = require('./module/view/index.js');
    return new basis.ui.Node({
      template: resource('./app/template/layout.tmpl'),
      binding: {
        view: view
      },
      action: {
        loadDefault: function(){
          view.dataType.loadMap(require('./data/file-map.json'));
        },
        loadDocs: function(){
          view.dataType.loadMap(require('./data/file-map.docs.json'));
        }
      }
    });
  }
});
