/*
	Load.js - JavaScript js/css, jsonp/ajax, sync/async loader
	Docs and source: https://github.com/articobandurini/load.js
	Distributed under MIT license.
*/

(function(context){
	
	/*
		load
	*/
	var self = context.load = function(options) {
		if (typeof options !== 'object' || options instanceof Array) {
			var args = self.args(arguments);
			options = {
				url: args.url,
				callback: args.callback
			};
		}
		if (options.url && options.url.length) {
			if (typeof options.async === 'undefined') options.async = true;
			if (!options.type) options.type = 'js';
			if (!(options.url instanceof Array)) options.url = [options.url];
			self.sequence(options);
		}
		return self;
	};
	
	
	/*
		sequence
	*/
	self.sequence = function(options) {
		var queue = options.url.length,
			queueCallback = function(amount) {
				if (!amount) amount = 1;
				queue = queue - amount;
				if (!queue && typeof options.callback === 'function') options.callback.call(self);
			},
			sequenceCallback = function(url) {
				return url.length ? (function() {
					queueCallback(url.length);
					self.sequence({
						url: url,
						async: options.async,
						type: options.type,
						callback: queueCallback
					});
				}) : queueCallback;
			};
		for (var i=0; i<options.url.length; i++) {
			if (options.url[i] instanceof Array) {
				self.sequence({
					url: options.url[i],
					async: options.async,
					type: options.type,
					callback: sequenceCallback(options.url.slice(i + 1))
				});
				break;
			}
			else {
				self.one({
					url: options.url[i],
					async: options.async,
					type: options.type,
					callback: queueCallback
				});
			}
		}
		return self;
	};
	
	
	/*
		one
	*/
	self.one = function(options) {
		var tag,
			css = false,
			holder = document.getElementsByTagName('head')[0] || document.body;
		if (options.url in self.map) {
			options.url = self.map[options.url];
		}
		if (options.type === 'css' || options.url.toLowerCase().match(/\.css$/)) {
			css = true;
			tag = document.createElement('link');
			tag.rel = 'stylesheet';
			tag.href = self.path(options.url + (options.url.toLowerCase().match(/\.css$/) ? '' : '.css'));
		}
		else {
			tag = document.createElement('script');
			tag.async = options.async;
			tag.src = self.path(options.url + (options.type === 'jsonp' || options.url.toLowerCase().match(/\.js$/) ? '' : '.js'));
		}
		holder.appendChild(tag);
		var receive = function(tag) {
			if (typeof self.ready === 'function') {
				self.ready.call(self, options.url);
			}
			if (typeof options.callback === 'function') {
				options.callback.call(self);
			}
			if (!css && tag && tag.parentNode) {
				tag.parentNode.removeChild(tag);
			}
		};
		var ie = navigator.userAgent.match(/MSIE\s(\d+)/);
		if (ie && ie[1] < 11) {
			tag.onreadystatechange = function() {
				if (this.readyState === 'loaded' || this.readyState === 'complete') {
					receive(this);
				}
			};
		}
		else {
			tag.onload = function() {
				receive(this);
			};
		}
		if (typeof options.errorHandler === 'function') {
			tag.onerror = function(e) {
				options.errorHandler.call(self, e);
			};
		}
		return self;
	};
	
	
	/*
		js, async
	*/
	self.js =
	self.async = function() {
		var args = self.args(arguments);
		return self({
			url: args.url,
			callback: args.callback
		});
	};
	
	
	/*
		css
	*/
	self.css = function() {
		var args = self.args(arguments);
		return self({
			url: args.url,
			callback: args.callback,
			type: 'css'
		});
	};
	
	
	/*
		sync
	*/
	self.sync = function() {
		var args = self.args(arguments);
		return self({
			url: args.url,
			callback: args.callback,
			async: false
		});
	};
	
	
	/*
		jsonp
	*/
	self.jsonp = function(url, callback, async, errorHandler) {
		if (typeof callback === 'function') {
			if (!self.jsonp.index) {
				self.jsonp.index = 1;
			}
			else {
				self.jsonp.index++;
			}
			window['loadCallback' + self.jsonp.index] = callback;
			url = url.replace('=?', '=loadCallback' + self.jsonp.index);
		}
		return self.one({
			url: url,
			async: async !== false,
			type: 'jsonp',
			errorHandler: errorHandler
		});
	};
	
	
	/*
		ajax
	*/
	self.ajax = function(url, callback, async, errorHandler) {
		var xhr;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		}
		else if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch(e) {
				try {
					xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch(e) {}
			}
		}
		if (!xhr) return null;
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && typeof callback === 'function') callback.call(xhr, xhr.responseText);
		};
		if (typeof errorHandler === 'function') {
			xhr.onerror = function(e) {
				errorHandler.call(self, e);
			};
		}
		xhr.open('GET', self.path(url), async);
		xhr.send();
		return self;
	}
	
	
	/*
		min
	*/
	self.min = function(input) {
		if (input && typeof input === 'string') {
			input = [input];
		}
		if (input instanceof Array) {
			for (var i=0; i<input.length; i++) {
				var min = '', regex = /\.(js|css)$/i;
				if (input[i].match(regex)) {
					min = input[i].replace(regex, function(match, ext, offset, original) {return '.min.' + ext;});
				}
				else {
					min = input[i] + '.min';
				}
				self.map[input[i]] = min;
			}
		}
		return self;
	};
	
	
	/*
		args
	*/
	self.args = function(input) {
		var args = Array.prototype.slice.call(input);
		return {
			url: args,
			callback: (typeof args[args.length - 1] === 'function') ? args.pop() : undefined
		};
	};
	
	
	/*
		path
	*/
	self.path = function(input) {
		return input.match(/^(https?\:|file\:|\/)/i) ? input : self.root + input;
	};
	
	
	/*
		init
	*/
	self.init = function() {
		self.root = '';
		self.map = {};
		var scriptTags = document.getElementsByTagName('script'), dataLoad, slashIndex;
		for (var i=0; i<scriptTags.length; i++) {
			if (scriptTags[i].src.match(/(^|\/)load(\.min)?\.js$/) || scriptTags[i].id === 'load.js') {
				dataLoad = scriptTags[i].getAttribute('data-load');
				if (dataLoad) {
					slashIndex = dataLoad.lastIndexOf('/') + 1;
					self.root = slashIndex ? dataLoad.substring(0, slashIndex) : '';
					self({
						url: dataLoad.substring(slashIndex),
						async: scriptTags[i].getAttribute('data-async') !== 'false'
					});
				}
				break;
			}
		}
	};
	
	self.init();
	
})(window);