var DatasetWrapper = require('basis.data').DatasetWrapper;
var Split = require('basis.data.dataset').Split;
var entity = require('basis.entity');

var File = entity.createType('File', {
  filename: entity.StringId,
  isDir: Boolean,
  type: String,
  files: Object,
  parent: entity.calc('filename', function(filename){
    var result = filename.replace(/\/[^\/]*$/, '');
    return result != filename ? result : '';
  }),
  name: entity.calc('filename', function(filename){
    return (filename || '').split(/\//).pop();
  }),
  matched: Boolean
});

var FileLink = entity.createType('FileLink', {
  from: entity.StringId,
  to: entity.StringId
});

function loadMap(fileMap){
  var files = [];

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

var fileDirSplit = new Split({
  source: File.all,
  rule: 'data.isDir'
});
var files = fileDirSplit.getSubset(false, true);
var dirs = fileDirSplit.getSubset(true, true);

var splitByParent = new Split({
  source: File.all,
  rule: 'data.parent'
});

var linkFrom = new Split({
  source: FileLink.all,
  rule: 'data.to'
});

var linkTo = new Split({
  source: FileLink.all,
  rule: 'data.from'
});

var matched = new DatasetWrapper();

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
