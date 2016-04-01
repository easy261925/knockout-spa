define(['app/shared/api/api', 'ko', 'sugar', 'css!./dependencies.css'], function (Api, ko) {

  var allDependencies = ko.observable({});

  var Page = {
    init: function () {
      Object.isEmpty(allDependencies()) && Api.call('file', 'dependencies', null, null, Page.error,
        Page.loading).done(allDependencies);
    },
    dispose: function () {
      return false; // return false to prevent public primitive/observable params to be reset when leaving the page
    },
    loading: ko.observable(false),
    error: ko.observable(''),
    selectedNode: ko.observable('')
  };

  Page.graph = ko.computed(function () {
    var edges = [];
    Object.each(allDependencies(), function (key, values) {
      values.each(function (value) {
        edges.push({ data: { source: value, target: key } });
      });
    });

    return {
      nodes: Object.keys(allDependencies()).union(Object.values(allDependencies())).flatten().unique()
        .remove(function (node) {
          return node.startsWith('.');
        }).map(function (node) {
          return { data: { id: node } };
        }),
      edges: edges
    }
  });

  Page.nodeGraph = ko.computed(function () {
    var edges = Page.graph().edges.findAll(function (edge) {
      return (edge.data.source === Page.selectedNode()) || (edge.data.target == Page.selectedNode());
    });
    var nodes = edges.map(function (edge) { return [edge.data.source, edge.data.target];}).flatten().unique().map(
      function (node) { return { data: { id: node } }; }
    );
    return {
      nodes: (nodes.length && nodes) || [{ data: { id: Page.selectedNode() } }],
      edges: edges
    };
  });

  return Page;

});
