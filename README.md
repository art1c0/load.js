load.js
=======

JavaScript js/css, jsonp/ajax, sync/async loader

## Usage

	<script type="text/javascript" src="load.js" data-load="js/app"></script>

This will load the script and automatically will load js/app.js after initialization.
"js/" in this case becomes the root path for all future loadings.


Then inside app.js you would load all other scripts and CSS files that you need.

	load.js('model.js');


You can ommit ".js"	at the end:

	load.js('view');


You can use shorthand to make it even more neat:

	load('controller');

Methods chaining:

	load.js('model').js('view').js('controller');


The same as:

	load('model', 'view', 'controller');


Load CSS files (general.css and custom.css):

	load.css('general.css').css('custom');


Load alltogether:

	load.js('model').css('general', 'custom');


### Callbacks

You can specify a callback for evey load.js call:

	load('model', function() {
		// model.js is loaded
	});


Also there is general callback for all loadings called "ready".
It has an argument with loaded path:

	load.ready = function(path) {
		// when model.js is loaded, path contains "model"
		// when style.css is loaded, path contains "style.css"
	};
	load('model');
	load('style.css');


### Priority loading

Sometimes you need some scripts to be loaded only after another ones.
This is easy to do with load.js - just put priority scripts into an array:

	load(['a', 'b'], 'c');


In this case script "c.js" will be loaded only after "a.js" and "b.js" are loaded.


You can make it even more sophisticated:

	load(['a', 'b'], ['c', 'd'], 'e')

That means load A and B, then load C and D, and only after that load E.


### Sync & Async

By default, async loading is used, but if you need to load scripts in synchronous way - that's no problem at all.

	load.sync('a', 'b');

In this case browser will load b.js only after a.js is loaded, that is usually much slower than async loading.


Also you can use "async" method for code to be more obvious:

	load.async('x');


### JSONP

Load.js can also perform JSONP calls for you:

	load.jsonp(path, callback, async);

Path must contain callback variable like "cb=?", for example below
callback is passed via "cb" parameter, its name depends on the server-side you use:

	load.jsonp('http://example.com/api/getUser?id=123&cb=?', callback);


### AJAX

Another useful thing is a possibility to make cross-browser AJAX calls via classic XmlHttpRequest:

	load.ajax(path, callback, async);

Callback is called inside the XHR scope and has one agrument "data" which is "responseText" indeed.



Detail API description is coming...