basis.require('basis.timer');
basis.require('basis.ui');
basis.require('basis.ui.slider');
basis.require('basis.ui.popup');

var type = resource('../../type.js').fetch();
var Viva = resource('vivagraph.js').fetch();

var fileInfoPopup = new basis.ui.popup.Balloon({
  template: resource('template/popup.tmpl'),
  dir: 'center top center bottom',
  autorotate: true,
  handler: {
    delegateChanged: function(){
      if (this.delegate)
        this.show(this.delegate.element);
      else
        this.hide();
    }
  },
  childNodes: [
    {
      autoDelegate: true,
      template: resource('template/fileInfo.tmpl'),
      binding: {
        filename: 'data:',
        name: 'data:',
        parent: 'data:'
      }
    }
  ]
});

var GraphNode = basis.ui.Node.subclass({
  matched: false,

  template: resource('template/node.tmpl'),
  binding: {
    type: 'data:',
    matched: 'data:matched',
    x: function(node){ return node.x && node.x.toFixed(2); },
    y: function(node){ return node.y && node.y.toFixed(2); }
  },
  action: {
    hover: function(){
      fileInfoPopup.setDelegate(this);
    },
    unhover: function(){
      fileInfoPopup.setDelegate();
    }
  },

  updatePos: function(pos){
    this.x = pos.x;
    this.y = pos.y;
    this.updateBind('x');
    this.updateBind('y');
  }
});

var GraphLink = basis.ui.Node.subclass({
  template: resource('template/link.tmpl'),
  binding: {
    x1: function(node){ return node.x1 && node.x1.toFixed(2); },
    y1: function(node){ return node.y1 && node.y1.toFixed(2); },
    x2: function(node){ return node.x2 && node.x2.toFixed(2); },
    y2: function(node){ return node.y2 && node.y2.toFixed(2); }
  },

  updatePos: function(pos1, pos2){
    this.x1 = pos1.x;
    this.y1 = pos1.y;
    this.x2 = pos2.x;
    this.y2 = pos2.y;
    this.updateBind('x1');
    this.updateBind('y1');
    this.updateBind('x2');
    this.updateBind('y2');
  }
});

var svgBase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
var svgGraphics = new basis.ui.Node({
  actualScale: 1,
  offsetX: 0,
  offsetY: 0,
  hasMatched: false,

  // Called by Viva.Graph.View.renderer to let concrete graphic output
  // provider prepare to render.
  template: resource('template/graph.tmpl'),
  binding: {
    matrix: function(node){
      return 'matrix(' + node.actualScale + ', 0, 0,' + node.actualScale + ',' + node.offsetX + ',' + node.offsetY + ')';
    },
    hasSelected: 'selection.itemCount > 0',
    hasMatched: 'hasMatched'
  },
  action: {
    resetSelection: function(){
      this.selection.clear();
    }
  },
  updateTransform: function(matrix){
    this.updateBind('matrix');
  },

  init: function (container) {
    basis.ui.Node.prototype.init.call(this);
    this.init = function(){}
  },

  handler: {
    ownerChanged: function(){
      setTimeout(function(){
        renderer.reset()
      }, 0);
    }
  },
  listen: {
    selection: {
      datasetChanged: function(selection){
        this.updateBind('hasSelected');
      }
    }
  },

  selection: {
    multiple: true    
  },
  grouping: {
    groupGetter: function(node){
      return node instanceof GraphNode;
    },
    sorting: 'data.id',
    childClass: {
      template: '<svg:g/>'
    }
  },

  //
  // node
  //
  node: function(graphNode){
    var file = type.File.getSlot(graphNode.id);
    var child = new GraphNode({
      delegate: file
    });

    file.graphNode = child;
    this.appendChild(child);

    return child;
  },
  initNode: function(){},
  updateNodePosition: function(node, pos) {
    node.updatePos(pos);
  },
  releaseNode: function(node){
    node.destroy();
  },

  //
  // link
  //
  link: function(graphNode){
    var fileLink = type.FileLink.getSlot({
      from: graphNode.fromId,
      to: graphNode.toId
    });
    var child = new GraphLink({
      delegate: fileLink
    });

    fileLink.graphNode = child;
    this.appendChild(child);
        
    return child;
  },
  initLink: function(){},
  updateLinkPosition: function(node, fromPos, toPos){
    node.updatePos(fromPos, toPos);
  },
  releaseLink: function(node){
    node.destroy();
  },

  //
  // transformation
  //

  // Sets translate operation that should be applied to all nodes and links.
  graphCenterChanged: function (x, y) {
    this.offsetX = x;
    this.offsetY = y;
    this.updateTransform();
  },

  // Default input manager listens to DOM events to process nodes drag-n-drop
  inputManager: function (graph, graphics) {
    return {
      bindDragNDrop: function (node, handlers) {
        if (handlers)
        {
          var events = Viva.Graph.Utils.dragndrop(node.ui.element);
          if (typeof handlers.onStart === 'function') {
            events.onStart(handlers.onStart);
          }
          if (typeof handlers.onDrag === 'function') {
            events.onDrag(handlers.onDrag);
          }
          if (typeof handlers.onStop === 'function') {
            events.onStop(handlers.onStop);
          }

          node.events = events;
        }
        else
        {
          if (node.events)
          { // TODO: i'm not sure if this is required in JS world...
            node.events.release();
            node.events = null;
          }
        }
      }
    };
  },

  translateRel: function (dx, dy) {
    var p = svgBase.createSVGPoint();
    var t = this.tmpl.transformElement.getCTM();
    var origin = svgBase.createSVGPoint().matrixTransform(t.inverse());

    p.x = dx;
    p.y = dy;

    p = p.matrixTransform(t.inverse());
    p.x = (p.x - origin.x) * t.a;
    p.y = (p.y - origin.y) * t.d;

    t.e += p.x;
    t.f += p.y;

    this.actualScale = t.a;
    this.offsetX = t.e;
    this.offsetY = t.f;
    this.updateTransform();
  },

  scale: function(scaleFactor, scrollPoint){
    var p = svgBase.createSVGPoint();
    p.x = scrollPoint.x;
    p.y = scrollPoint.y;

    p = p.matrixTransform(this.tmpl.transformElement.getCTM().inverse()); // translate to svg coordinates

    // Compute new scale matrix in current mouse position
    var k = svgBase.createSVGMatrix().translate(p.x, p.y).scale(scaleFactor).translate(-p.x, -p.y);
    var t = this.tmpl.transformElement.getCTM().multiply(k);

    this.actualScale = t.a;
    this.offsetX = t.e;
    this.offsetY = t.f;

    this.updateTransform();

    return this.actualScale;
  },

  resetScale: function(){
    this.actualScale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.updateTransform();
  },

  beginRender: function(){},
  endRender: function(){}
});

type.matched.addHandler({
  datasetChanged: function(matched, delta){
    svgGraphics.hasMatched = matched.itemCount > 0;
    svgGraphics.updateBind('hasMatched');

    var array;
    if (array = delta.inserted)
      for (var i = 0, item; item = array[i]; i++)
        item.set('matched', true);

    if (array = delta.deleted)
      for (var i = 0, item; item = array[i]; i++)
        item.set('matched', false);
  }
})

var graph = Viva.Graph.graph();

var renderer = Viva.Graph.View.renderer(graph, {
  container: svgGraphics.element,
  graphics: svgGraphics,
  prerender: 50
});
renderer.run();

var speedSlider = new basis.ui.slider.Slider({
  max: 100,
  step: 10,
  value: 30
});

// sync links & nodes with graph
(function(){
  var links = type.FileLink.all.getItems().map(function(link){
    return [link.data.from, link.data.to];
  });

  type.File.all.addHandler({
    datasetChanged: function(dataset, delta){
      if (delta.deleted)
        delta.deleted.forEach(function(file){
          graph.removeNode(file.getId());
        });
    }
  });

  type.FileLink.all.addHandler({
    datasetChanged: function(dataset, delta){
      if (delta.inserted)
      {
        delta.inserted.forEach(function(link){
          return links.push([link.data.from, link.data.to]);
        });
      }

      if (delta.deleted)
      {
        delta.deleted.forEach(function(link){
          graph.removeLink(link.data.from, link.data.to);
        });
      }
    }
  });

  var popNode = function(){
    if (links.length)
    {  
      var link;
      while (link = links.shift())
      {
        var fileLink = type.FileLink.get({
          from: link[0],
          to: link[1]
        });
        if (fileLink)
        {
          graph.addLink.apply(graph, link);
          break;
        }
      }
    }
    setTimeout(popNode, speedSlider.value);
  };
  popNode();
})();



module.exports = new basis.ui.Node({
  template: resource('template/view.tmpl'),
  binding: {
    graph: svgGraphics,
    speedSlider: speedSlider
  }
});
