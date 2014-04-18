basis.require('basis.entity');
basis.require('basis.data.dataset');

var File = basis.entity.createType('File', {
  filename: basis.entity.StringId,
  isDir: Boolean,
  type: String,
  files: Object,
  parent: basis.entity.calc('filename', function(filename){
    var result = filename.replace(/\/[^\/]*$/, '');
    return result != filename ? result : '';
  }),
  name: basis.entity.calc('filename', function(filename){
    return (filename || '').split(/\//).pop();
  }),
  matched: Boolean
});

var FileLink = basis.entity.createType('FileLink', {
  from: basis.entity.StringId,
  to: basis.entity.StringId
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

  FileLink.all.sync(fileMap.links.map(function(link){
    return {
      from: link[0],
      to: link[1]
    };
  }));
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

var matched = new basis.data.DatasetWrapper();

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
