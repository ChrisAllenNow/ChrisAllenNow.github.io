function io() { }

// Data structures
//cache record types: ds=dataset, control
// key what, value {t: timeStampMs, d:[{ docId, state: new|dirty | clean, data]}
// key {type: "control" },value {localStorageCount, dirtyCount } todo
//
// what { type:"ds", collection: "products", where: [{ field: "team", value: 1 }, { field: "product", value: "example" }] }
//
// io.options {mode:0=read/1=write,cacheMs:time to cache in ms}

io.cacheMsDEFAULT = 1000 * 60 * 60 * 24 * 30; //s/b maybe 10 hours not 30 days
io.optionsDEFAULT = { mode: 0, cacheMs: io.cacheMsDEFAULT };

io.cache = function () { };
io.cache.get = function (key,ageMs) {
    // todo delete very old caches to save space
    var sKey = JSON.stringify(key);
    var s = window.localStorage.getItem(sKey);
    if (!s) return null;
    var o = JSON.parse(s);
    if (o.t < Date.now() - ageMs) {
        window.localStorage.removeItem(sKey);
        return null;
    }
    return o.d;
};
io.cache.set = function (key, value) {
    var sKey = JSON.stringify(key);
    var o = { t: Date.now(), d: value };
    var s = JSON.stringify(o);
    window.localStorage.setItem(sKey, s);
};

io.db = null;
io.dirtyCount = 0;
io.driver = "driver.asp";
io.jsonpActions = {};
io.jsonpScripts = {};
io.jsonpTimeouts = {};

io.cancelJsonp = function (entity, url) {
    util.log("Not found " + url);
    var script = io.jsonpScripts[entity];
    script.parentNode.removeChild(script);
    delete io.jsonpActions[entity];
    delete io.jsonpScripts[entity];
    delete io.jsonpTimeouts[entity];
};

io.fetch = function (what, action, options) {
    var d = io.cache.get(what, options.cacheMs);
    if (d) {
        io.fetchDbLoaded(what, d, action, options);
    }
    else {
        io.fetchDb(what, action, options);
    };
};

io.fetchDb = function (what, action, options) {
    // todo error checking; for example if no response in 10secs goes to offline and returns no data
    io.openDb();
    var collection = io.db.collection(what.collection);
    var query = collection;
    for (var i = 0; i < what.where.length; i++) {
        query = query.where(what.where[i].field, "==", what.where[i].value);
    }
    query.get().then((querySnapshot) => {
        var a = [];
        var d = {};
        querySnapshot.forEach((doc) => {
            d.docId = doc.id;
            d.state = "clean";
            d.data = doc.data();
            a.push(d);
        });
        io.cache.set(what, a);
        io.fetchDbLoaded(what, a, action, options);
    });
};

io.fetchDbLoaded = function (what, d, action, options) {
    var dirtyMet = false;
    for (var i = 0; i < d.length; i++) {
        d[i] = action(d[i]);
        if (d[i].state != "clean") {
            dirtyMet = true;
            io.dirtyCount++;
            io.openDb();
            var doc = io.db.collection(what.collection).doc(d[i].docId);
            d[i].state = "clean";
            doc.set(d[i].data, { merge: true })
                .then(function () { io.dirtyCount--; console.log("Document successfully written!"); })
                .catch(function (error) { console.error("Error writing document: ", error); });
        };
    }
    if (options.mode == 1) {
        io.dirtyCount++;
        io.openDb();
        d.push({});
        var i = d.length - 1;
        d[i].docId = io.db.collection(what.collection).doc().id;
        d[i].state = "new";
        d[i].data = {};
        d[i] = action(d[i]);
        dirtyMet = true;
        d[i].state = "clean";
        util.log2(i, d[i]);
        var doc = io.db.collection(what.collection).doc(d[i].docId);
        doc.set(d[i].data)
            .then(function () { io.dirtyCount--; console.log("Document successfully added"); })
            .catch(function (error) { console.error("Error adding document: ", error); });
    };
    if (dirtyMet) {
        io.cache.set(what, d);
    };
};

io.flush = function () {
    if (io.dirtyCount > 0) {
        var message = "Please wait - pending updates " + io.dirtyCount;
        if (confirm(message)) return true;
            else return false;
    };
};

io.openDb = function () {
    if (!io.db) {
        var config = {
            apiKey: "AIzaSyBdIrqsJdXamukUL16P0YIccTYwgsysHHw",
            authDomain: "newagent-f3db0.firebaseapp.com",
            databaseURL: "https://newagent-f3db0.firebaseio.com",
            projectId: "newagent-f3db0",
            storageBucket: "newagent-f3db0.appspot.com",
            messagingSenderId: "771733788171"
        };
        firebase.initializeApp(config);
        io.db = firebase.firestore();
        io.db.settings({ timestampsInSnapshots: true });
    };
};

io.receive = function (entity, data) {
    var action = io.jsonpActions[entity];
    clearTimeout(io.jsonpTimeouts[entity]);
    action(entity, data);
    var script = io.jsonpScripts[entity];
    script.parentNode.removeChild(script);
    delete io.jsonpActions[entity];
    delete io.jsonpScripts[entity];
    delete io.jsonpTimeouts[entity];
};

io.request = function (entity, url, action) {
    requestJsonp(entity, io.driver & "?u=" & url, action)
};

io.requestJsonp = function (entity, url, action) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url + "?e=" + entity;
    io.jsonpActions[entity] = action;
    io.jsonpScripts[entity] = script;
    io.jsonpTimeouts[entity] = setTimeout(io.cancelJsonp, 10 * 1000, entity,url);
    document.getElementsByTagName('head')[0].appendChild(script);
  };

io.test = function () {
    util.scriptTest([document.createElement, window.localStorage,Date.now]);
};

io.test();