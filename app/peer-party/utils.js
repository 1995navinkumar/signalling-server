function uuid() {
    return Math.random().toString(36).substr(2, 9);
}

const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

const AssetLoader = (function AssetLoader(promiseImpl) {
    var dependencyConfig, version;
    var elementCreator = {
        script: function createScriptElement(config) {
            var script = document.createElement("script");
            var url = version ? `${config.url}?version=${version}` : config.url;
            script.src = url;
            script.charset = 'utf-8'; //No I18N
            script.id = `DMS-${config.id}`;
            return script;
        },
        stylesheet: function createLinkElement(config) {
            var link = document.createElement("link");
            var url = version ? `${config.url}?version=${version}` : config.url;
            link.rel = "stylesheet";
            link.href = url;
            link.id = `DMC${config.id}`;
            return link;
        }
    }

    function setDependencyConfig(config) {
        dependencyConfig = config;
    }

    function setPromiseImpl(promise) {
        promiseImpl = promise;
    }

    function setVersion(versionValue) {
        version = versionValue;
    }

    function getConfig(id) {
        return dependencyConfig[id];
    }

    function require(id) {
        var config = getConfig(id);
        return loadAsset(config);
    }

    function requireAll(ids) {
        var promises = ids.map(id => require(id));
        return promiseImpl.all(promises);
    }

    function unMount(id) {
        var config = getConfig(id);
        var link = document.getElementById(`DMC${id}`);
        link && document.head.removeChild(link);
        delete config.state;
    }

    function loadAsset(config) {
        var state = config.state;
        var dependencyPromise, assetPromise;
        if (state) {
            assetPromise = state;
        } else {
            var dependencies = config.dependencies || [];
            dependencyPromise = (requireAll(dependencies));
            assetPromise = dependencyPromise.then(() => mount(config));
            config.state = assetPromise;
        }
        return promiseImpl.resolve(assetPromise);
    }

    function mount(config) {
        return new promiseImpl((resolve, reject) => {
            var element = elementCreator[config.type](config);
            element.onload = function () {
                config.module = config.id;
                config.didMount && config.didMount(config.module);
                resolve(config.module);
            }
            element.onerror = function (event) {
                reject({
                    message: `cannot load element with id : ${config.id}`,
                    event
                })
            }
            document.head.appendChild(element);
        })
    }

    return {
        setDependencyConfig,
        setPromiseImpl,
        setVersion,
        require,
        requireAll,
        unMount
    }
})(typeof Promise != "undefined" ? Promise : undefined); //No I18N


function composeEventHandler(eventHandler = {}) {
    var events = {};


    function off(eventName) {
        events[eventName] = undefined;
    }

    function trigger(eventName) {
        var callbacks = events[eventName] || [];
        var args = Array.prototype.slice.call(arguments, 1);
        callbacks.forEach(callback => setTimeout(() => {
            callback.call(this, ...args);
        }, 0));
    }

    function on(eventName, callback) {
        var event = events[eventName];
        if (!event) {
            event = [];
            events[eventName] = event;
        }
        event.push(callback);
    }

    function getEvents() {
        return events;
    }

    var composedEventHandler = {
        on,
        off,
        trigger,
        getEvents
    }

    assignEvents.call(composedEventHandler, eventHandler);

    return composedEventHandler;
}

function assignEvents(eventHandler) {
    var keys = Object.keys(eventHandler);
    if (keys.length > 0) {
        keys.forEach(eventName => {
            this.getEvents()[eventName] = [];
            var callback = eventHandler[eventName];
            this.on(eventName, callback);
        }, this);
    }
}

