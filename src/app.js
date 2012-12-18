
  basis.require('basis.ui');

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

      template: resource('templates/layout.tmpl'),

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

    var webglGraphics = Viva.Graph.View.webglGraphics();

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
    svgGraphics
      .node(function(node){
        var circle = Viva.Graph.svg('circle')
          .attr('r', 7)
          .attr('stroke', '#fff')
          .attr('stroke-width', '1.5px')
          .attr('fill', colors[node.data ? node.data.type : 'unknown'] || 'black');
            
        circle.append('title').text(node.id);
            
        return circle;
      })
      .placeNode(function(uiNode, pos){
        uiNode
          .attr('cx', pos.x)
          .attr('cy', pos.y); 
      })
      .link(function(link){
        return Viva.Graph.svg('line')
          .attr('stroke', 'rgba(128,128,128,.5)')
          .attr('stroke-width', 2);
      });


    var renderer = Viva.Graph.View.renderer(graph, {
      container: canvas,
      graphics: svgGraphics,
      prerender: 30
    });
    renderer.run();
  });
