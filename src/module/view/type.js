basis.require('basis.entity');
basis.require('basis.data.dataset');

var File = new basis.entity.EntityType({
  fields: {
    filename: basis.entity.StringId,
    isDir: Boolean,
    type: String,
    files: Object,
    parent: {
      calc: basis.entity.CalculateField('filename', function(filename){
        var result = filename.replace(/\/[^\/]*$/, '');
        return result != filename ? result : '';
      })
    },
    name: {
      calc: basis.entity.CalculateField('filename', function(filename){
        return (filename || '').split(/\//).pop();
      })
    },
    matched: Boolean
  }
});

var FileLink = new basis.entity.EntityType({
  fields: {
    id: {
      type: basis.entity.StringId,
      calc: basis.entity.CalculateField('from', 'to', function(from, to){
        return from + '->' + to;
      })
    },
    from: String,
    to: String
  }
});

function loadMap(fileMap){
  var files = [];
  var links = [];

  fileMap.files.forEach(function(file){
    var parts = file.name.split('/');
    var path = '';
    var name;
    var first = true;
    while (name = parts.shift())
    {
      path += (first ? '' : '/') + name;
      first = false;
      files.push({
        filename: path,
        type: file.type,
        isDir: !!parts.length
      });
    }
  });
  File.all.sync(files);

  fileMap.links.forEach(function(link){
    return links.push({
      from: link[0],
      to: link[1]
    });
  });
  FileLink.all.sync(links);
}

var fileDirSplit = new basis.data.dataset.Split({
  source: File.all,
  rule: 'data.isDir'
});
var files = fileDirSplit.getSubset(false, true);
var dirs = fileDirSplit.getSubset(true, true);

var splitByParent = new basis.data.dataset.Split({
  source: File.all,
  rule: 'data.parent'
});

var linkFrom = new basis.data.dataset.Split({
  source: FileLink.all,
  rule: 'data.to'
});

var linkTo = new basis.data.dataset.Split({
  source: FileLink.all,
  rule: 'data.from'
});

var matched = new basis.data.dataset.Merge();

module.exports = {
  loadMap: loadMap,
  File: File,
  FileLink: FileLink,
  files: files,
  dirs: dirs,
  matched: matched,
  splitByParent: splitByParent,
  linkTo: linkTo,
  linkFrom: linkFrom
};
