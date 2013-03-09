basis.require('basis.ui');
basis.require('basis.timer');
basis.require('app.files');

var GraphNode = basis.ui.Node.subclass({
  template: resource('template/node.tmpl'),
  binding: {
    type: 'data:',
    color: {
      events: 'update',
      getter: function(node){
        return colors[node.data ? node.data.type : 'unknown'] || 'black';
      }
    },
    x: function(node){ return node.x && node.x.toFixed(4); },
    y: function(node){ return node.y && node.y.toFixed(4); }
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
    x1: function(node){ return node.x1 && node.x1.toFixed(4); },
    y1: function(node){ return node.y1 && node.y1.toFixed(4); },
    x2: function(node){ return node.x2 && node.x2.toFixed(4); },
    y2: function(node){ return node.y2 && node.y2.toFixed(4); }
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

  handler: {
    ownerChanged: function(){
      setTimeout(function(){
        renderer.reset()
      }, 0);
    }
  },
  // Called by Viva.Graph.View.renderer to let concrete graphic output
  // provider prepare to render.
  template: resource('template/graph.tmpl'),
  binding: {
    matrix: 'matrix'
  },
  init: function (container) {
    basis.ui.Node.prototype.init.call(this);
    this.init = function(){}
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

  node: function(graphNode){
    var file = app.files.File(graphNode.id);
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

  link: function(graphNode){
    var fileLink = app.files.FileLink.get({
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

  updateTransform: function(matrix){
    this.matrix = matrix || 'matrix(' + this.actualScale + ', 0, 0,' + this.actualScale + ',' + this.offsetX + ',' + this.offsetY + ')';
    this.updateBind('matrix');
  },

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

    this.updateTransform('matrix(' + t.a + ', 0, 0,' + t.d + ',' + t.e + ',' + t.f + ')');
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
    this.updateTransform('matrix(1, 0, 0, 1, 0, 0)');
  },

  beginRender: function(){},
  endRender: function(){}
});

var graph = Viva.Graph.graph();

/*var nodes = [];
app.files.File.all.getItems().forEach(function(f){
  if (!f.data.isDir)
    nodes.push(f.getId());
});*/
var links = [];
app.files.FileLink.all.getItems().forEach(function(f){
  //graph.addLink(f.data.from, f.data.to);
  links.push([f.data.from, f.data.to]);
});

var popNode = function(){
  graph.addLink.apply(graph, links.shift());
  if (links.length)
    setTimeout(popNode, 100);
};
setTimeout(popNode, 50);

var renderer = Viva.Graph.View.renderer(graph, {
//  container: canvas,
  container: svgGraphics.element,
  graphics: svgGraphics,
  prerender: 30
});
renderer.run();

module.exports = svgGraphics;
