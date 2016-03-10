define(['i18n!nls/resources'], function (resources) {

  var resource = function (key) {
    if (!key || !resources) {
      return null;
    }
    return resources[key] || ('MISSING RESOURCE: ' + key);
  };

  return resource;

});
