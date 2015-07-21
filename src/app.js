var Node = require('basis.ui').Node;
var view = resource('./module/view/index.js');
/** @cut */ require('basis.devpanel');

module.exports = require('basis.app').create({
  init: function(){
    return new Node({
      template: resource('./app/template/layout.tmpl'),
      binding: {
        view: view
      },
      action: {
        loadDefault: function(){
          view().dataType.loadMap(require('./data/file-map.json'));
        },
        loadDocs: function(){
          view().dataType.loadMap(require('./data/file-map.docs.json'));
        }
      }
    });
  }
});
