
  basis.require('basis.entity');
  basis.require('basis.data.dataset');

  var fileMap = resource('../data/file-map.docs.json').fetch();

  var File = new basis.entity.EntityType({
    fields: {
      filename: basis.entity.StringId,
      isDir: Boolean,
      type: String,
      files: Object,
      parent: {
        calc: basis.entity.CalculateField('filename', function(filename){
          return filename.replace(/\/[^\/]*$/, '');
        })
      },
      name: {
        calc: basis.entity.CalculateField('filename', function(filename){
          return (filename || '').split(/\//).pop();
        })
      }
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

  fileMap.files.forEach(function(file){
    var parts = file.name.split('/');
    var path = '';
    var name;
    while (name = parts.shift())
    {
      path += '/' + name;
      File({
        filename: path,
        type: file.type,
        isDir: !!parts.length
      });
    }
  });

  fileMap.links.forEach(function(link){
    return FileLink({
      from: '/' + link[0],
      to: '/' + link[1]
    });
  });

  var splitByType = new basis.data.dataset.Split({
    source: File.all,
    rule: 'data.isDir'
  });
  var files = splitByType.getSubset(false, true);
  var dirs = splitByType.getSubset(true, true);

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

  module.exports = {
    File: File,
    FileLink: FileLink,
    files: files,
    dirs: dirs,
    splitByType: splitByType,
    splitByParent: splitByParent,
    linkTo: linkTo,
    linkFrom: linkFrom
  };
