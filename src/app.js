
  basis.require('basis.ui');
  basis.require('basis.ui.tree');
  ;;;basis.require('basis.devpanel');

  var list = resource('module/list/view.js').fetch();
  var details = resource('module/details/view.js').fetch();
  var fileStat = resource('module/fileStat/view.js').fetch();

  list.selection.addHandler({
    datasetChanged: function(sender){
      details.setDelegate(sender.pick());
    }
  }, details);

  basis.ready(function(){
    new basis.ui.Node({
      container: document.body,

      template: resource('app/templates/layout.tmpl'),

      binding: {
        list: 'satellite:',
        details: 'satellite:',
        fileStat: 'satellite:'
      },

      satellite: {
        list: list,
        details: details,
        fileStat: fileStat
      }
    });

    basis.require('app.files');

    var graph = Viva.Graph.graph();

    app.files.File.all.getItems().forEach(function(f){
      if (!f.data.isDir)
        graph.addNode(f.getId(), f.data);
    });
    app.files.FileLink.all.getItems().forEach(function(f){
      graph.addLink(f.data.from, f.data.to);
    });

    var canvas = details.element.parentNode.appendChild(basis.dom.createElement('div[style="position:absolute;width:100%;height:100%"]'));

    //var webglGraphics = Viva.Graph.View.webglGraphics();

    var colors = {
      'html': '#FF0000',
      'script': '#99BBCC',
      'style': 'orange',
      'template': '#88CC88',
      'l10n': 'rgb(100%, 90%, 50%)',
      'image': 'rgb(60%, 90%, 100%)',
      'json': 'gray'
    };

    var svgGraphics = Viva.Graph.View.svgGraphics();
    window.xx = svgGraphics;
    
    var GraphNode = basis.ui.Node.subclass({
      template: '<svg:circle r="8" stroke="white" stroke-width="2" fill="{color}" cx="{x}" cy="{y}"/>',
      binding: {
        color: {
          events: 'update',
          getter: function(node){
            return colors[node.data ? node.data.type : 'unknown'] || 'black';
          }
        },
        x: function(node){ return node.x && node.x.toFixed(4); },
        y: function(node){ return node.y && node.y.toFixed(4); }
      }
    });

    var GraphLink = basis.ui.Node.subclass({
      template: '<svg:line stroke="rgba(128,128,128,.5)" stroke-width="2" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" />',
      binding: {
        x1: function(node){ return node.x1 && node.x1.toFixed(4); },
        y1: function(node){ return node.y1 && node.y1.toFixed(4); },
        x2: function(node){ return node.x2 && node.x2.toFixed(4); },
        y2: function(node){ return node.y2 && node.y2.toFixed(4); }
      }
    });

    svgGraphics
      .node(function(node){
        //circle.append('title').text(node.id);
        var file = app.files.File(node.id);
        var uiNode = new GraphNode({
          delegate: file
        });

        file.graphNode = uiNode;
        uiNode.element.uiNode = uiNode;
            
        return uiNode.element;
      })
      .placeNode(function(el, pos){
        el.uiNode.x = pos.x;
        el.uiNode.y = pos.y;
        el.uiNode.updateBind('x');
        el.uiNode.updateBind('y');
      })
      .link(function(link){
        var fileLink = app.files.FileLink.get({ from: link.fromId, to: link.toId });
        var uiNode = new GraphLink({
          delegate: fileLink
        });

        fileLink.graphNode = uiNode;
        uiNode.element.uiNode = uiNode;
            
        return uiNode.element;
      })
      .placeLink(function(el, pos1, pos2){
        el.uiNode.x1 = pos1.x;
        el.uiNode.y1 = pos1.y;
        el.uiNode.x2 = pos2.x;
        el.uiNode.y2 = pos2.y;
        el.uiNode.updateBind('x1');
        el.uiNode.updateBind('y1');
        el.uiNode.updateBind('x2');
        el.uiNode.updateBind('y2');
      });


    var renderer = Viva.Graph.View.renderer(graph, {
      container: canvas,
      graphics: svgGraphics,
      prerender: 30
    });
    renderer.run();
  });
