var localforageCordovasqlitedriverDemo = (function () {
  function simpleTest() {
    try {
      localforage.defineDriver(window.cordovaSQLiteDriver).then(function() {
          return localforage.setDriver([
              window.cordovaSQLiteDriver._driver,
              localforage.INDEXEDDB,
              localforage.WEBSQL,
              localforage.LOCALSTORAGE
          ]);
      }).then(function() {
        alert(localforage.driver());
        return localforage.setItem('testPromiseKey', 'testPromiseValue');
      }).then(function() {
        return localforage.getItem('testPromiseKey');
      }).then(function(value) {
        alert(value);
      }).catch(function(err) {
        alert(err);
      });
    } catch (e) {
      alert(e);
    }
  }

  // no need to wait for anything
  simpleTest();

  function perfTest() {
    var items = [];

    for (var i = 0; i < 200; i++) {
      items.push({
        key: 'key' + i,
        value: 'value' + i
      });
    }

    var t0 = +new Date();

    function timeAddAndRemove() {
      window.driverErrors = window.driverErrors || {};
      var driverErrors = window.driverErrors;
      var driverName = localforage.driver();

      t0 = +new Date();
      return Promise.all(items.map(function(item){
        return localforage.setItem(item.key, item.value);
      })).then(function(){
        return Promise.all(items.map(function(item){
          return localforage.getItem(item.key);
        }));
      }).then(function(results){
        var t1 = +new Date();
        driverErrors[driverName] = driverErrors[driverName] || [];
        for (var i = 0; i < results.length; i++) {
          if (results[i] !== 'value' + i) {
            driverErrors[driverName].push({
              i: i,
              value: results[i]
            });
          }
        }
        var msg = driverName + ' Time: ' + (t1 - t0);
        if (driverErrors[driverName] && driverErrors[driverName].length) {
          msg += ', Errors: ' + driverErrors[driverName].length;
        }
        alert(msg);
        console.log(msg);
      });
    }


    localforage.setDriver(window.cordovaSQLiteDriver._driver).then(function(){
      return localforage.clear();
    }).then(timeAddAndRemove).then(function(){
      return localforage.setDriver([
          // localforage.INDEXEDDB,
          localforage.WEBSQL,
          localforage.LOCALSTORAGE
      ]).then(function(){
        return localforage.clear();
      });
    }).then(timeAddAndRemove);

  }

  return {
    simpleTest: simpleTest,
    perfTest: perfTest
  };
})();
