File graph viewer.

## Getting Started

Viewer provide interface to view file relationship and their details.

As init version it have no any normal interface to load data. But it being changed in future.

### Input data and format

To view file graph put file-map.json into `src/data` folder. File should has follow format:

```
[
  {
    filename: "foo/bar/baz.html",
    type: "html",
    files: [
      "path/to/image.png",
      ...
    ]
  },
  ...
]
```

Fields:
* filename - required
* type - any of supported file types; otherwise node would be black
* files - list of filenames; required, even if empty

Supported file types:
* html
* image
* script
* style
* template
* l10n

Required file could be generated for some project by [basisjs-tools](https://github.com/lahmatiy/basisjs-tools) with command:

	$ basis build -t file-map

NOTE: Not all project could propertly build with `basisjs-tools`.

### Launch and build

To launch application you need for any http server, because it use dynamicaly resource loading.

But you could build project by [basisjs-tools](https://github.com/lahmatiy/basisjs-tools) (with command `basis build`). Project had already config for build. Build version don't require for any http server.