
function makePromise() {
  var consumers = [], success, result;

  function notifyConsumer(consumer) {
    if(success) {
      var nextValue;
      if(consumer.fulfilled) {
        try {
          nextValue = [consumer.fulfilled.apply(null, result)];
        } catch(exc) {
          consumer.promise.reject(exc);
          return;
        }
      } else {
        nextValue = result;
      }
      if(nextValue[0] && typeof(nextValue[0].then) === 'function') {
        nextValue[0].then(consumer.promise.fulfill, consumer.promise.reject);
      } else {
        consumer.promise.fulfill.apply(null, nextValue);
      }
    } else {
      if(consumer.rejected) {
        var ret;
        try {
          ret = consumer.rejected.apply(null, result);
        } catch(exc) {
          consumer.promise.reject(exc);
          return;
        }
        if(typeof(ret) !== 'undefined') {
          if(typeof(ret.then) === 'function') {
            ret.then(consumer.promise.fulfill, consumer.promise.reject);
          } else {
            consumer.promise.fulfill(ret);
          }
        }
      } else {
        consumer.promise.reject.apply(null, result);
      }
    }
  }

  function resolve(succ, res) {
    if(result) {
      throw new Error("Can't resolve promise, already resolved!");
    }
    success = succ;
    result = Array.prototype.slice.call(res);
    setTimeout(function() {
      var cl = consumers.length;
      for(var i=0;i<cl;i++) {
        notifyConsumer(consumers[i]);
      }
      consumers = undefined;
    }, 0);
  }

  return {

    then: function(fulfilled, rejected) {
      var consumer = {
        fulfilled: fulfilled,
        rejected: rejected,
        promise: makePromise()
      };
      if(result) {
        setTimeout(function() {
          notifyConsumer(consumer)
        }, 0);
      } else {
        consumers.push(consumer);
      }
      return consumer.promise;
    },

    fulfill: function() {
      resolve(true, arguments);
    },

    reject: function() {
      resolve(false, arguments);
    }

  };
}

exports.makePromise = makePromise;

exports.adapter = {
  fulfilled: function(value) {
    var promise = makePromise();
    promise.fulfill(value);
    return promise;
  },
  rejected: function(reason) {
    var promise = makePromise();
    promise.reject(reason);
    return promise;
  },
  pending: function() {
    var promise = makePromise();
    return {
      promise: promise,
      fulfill: promise.fulfill,
      reject: promise.reject
    };
  }
};
