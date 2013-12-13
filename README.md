# Load.js

JavaScript js/css, jsonp/ajax, sync/async loader

This lib gives you full control over loading scripts and css files for your web application. Instead of having bunches of "script" and "link" tags in your HTML page, you define them all in one place.

Another advantage is asynchronous loading, that means your scripts can be loaded in parallel, and also your app will not freeze while loading them.

To gain even more control, define which scripts should be loaded before others in order to fulfill dependencies - this part is done in a really smart and easy way.

Just include load.js script into your page to get started.

Below you will find examples of usage as well as full API.


## Usage

Imagine you have a very simple app structure like this:

	-- app
	    |
	    -- custom.css
	    -- general.css
	    -- init.js      assets load and init
	    -- main.js      main app file
	    -- module.js    some app module
	    -- plugin.js    plugin, has to be loaded only after main.js and module.js
	|
	-- load.js

So here you have "load.js" in the root, as well as "app" folder, inside it there are few "css" and "js" files.

In order to get started, include "load.js" script into your page, please note special "data-load" attribute:

	<script type="text/javascript" src="load.js" data-load="app/init"></script>

This will automatically load "app/init.js" file, which will be used to load all other assets.

Important that "app/" in this case becomes the root path for all the future loadings, so you can omit it.

Then inside init.js you would load all other scripts and CSS files that you need.

	load.js('main.js');

You can omit ".js" at the end:

	load.js('main');

You can use shorthand to make it even more neat:

	load('main');

Methods chaining:

	load.js('main').js('module');

The same as:

	load('main', 'module');

Load CSS files (general.css and custom.css):

	load.css('general.css').css('custom');

Load all together:

	load.js('main', 'module').css('general', 'custom');


### Priority loading

Examples above will not probably work if some of your scripts have to be loaded before others. Because of the nature of asynchronous loading, there is no guarantee for loading order. To handle that you have to use priority loading.

For example, you need to have "main.js" and "module.js" loaded in order to load "plugin.js". This is easy to do with load.js - just put priority scripts into an array:

	load(['main', 'module'], 'plugin');

In this case "plugin.js" will be loaded only after "main.js" and "module.js" are loaded.

You can make it even more sophisticated, imagine you have to load module.js only after main.js:

	load(['main'], ['module'], 'plugin')

That means load "main.js", then load "module.js", and only after that load "plugin.js".

You don't need to use priority loading for css files, just define them in desired order.


### Callbacks

You can specify callbacks for every load.js call:

	load('main', function() {
	
	    // main.js is loaded
	
	});

Full example:

	load
	.css('general', 'custom')
	.js(['main', 'module'], 'plugin', function() {
	
	    // here you can run your app
	
	});

Also there is general callback for all loadings called "ready". It has an argument with loaded file's path:

	load.ready = function(path) {
	
	    // when main.js is loaded, path contains "main", as it was called
	    // when general.css is loaded, path contains "general.css"
	
	};
	load('main');
	load('general.css');


### Sync & Async

By default async loading is used, but if you want to load scripts in good old synchronous way - that's no problem at all.

	load.sync('main', 'module');

In this case browser will load module.js only after main.js is loaded, that's usually slower and freezing than async loading.

Also you can use "async" method for code to be more obvious:

	load.async('plugin');


### JSONP

Load.js can also perform JSONP calls for you:

	load.jsonp(path, callback, async);

Path must contain callback parameter with value of "?", like "callback=?".

For example, below callback is passed via "cb" parameter, this name depends on the server-side you use:

	load.jsonp('http://example.com/api/getUser?id=123&cb=?', function(data) { ... });

Set third parameter to "false" if you want to use synchronous loading.


### AJAX

Another useful thing is a possibility to make cross-browser AJAX calls via classic XmlHttpRequest:

	load.ajax(path, callback, async);

Callback is called inside the XHR scope and has one agrument "data" which is "XHR.responseText" indeed.

Set third parameter to "false" if you want to use synchronous loading.


## API

In general, load.js supports two types of input: "options" object and arguments list.

Options:

	load ( options )
	
		options is an object:
		{
			url			string or array		one url or a few urls in an array, required
			callback	function			function to call after loading of all urls
			async		boolean				use async loading, "true" by default
			type		string 				request type: "css", "jsonp" or "js" by default
		}
		
Arguments:
	
	load ( url [, url] … [, callback] )
	
			url			string or array		one url or a few urls in an array, required
			callback	function			function to call after loading of all urls

There are few methods used as alias for "load" but with some options.

loading js files:

	load.js ( options )
	load.js ( url [, url] … [, callback] )
	
loading css files:

	load.css ( options )
	load.css ( url [, url] … [, callback] )

loading js files synchronously:

	load.sync ( options )
	load.sync ( url [, url] … [, callback] )
	
loading js files asynchronously:

	load.async ( options )
	load.async ( url [, url] … [, callback] )
	
JSONP

	load.jsonp ( url [, callback] [, async] [,errorHandler] )

AJAX

	load.ajax ( url [, callback] [, async] [,errorHandler] )

JSONP and AJAX calls can be performed only one by one, so array cannot be passed as url.

Callback are called in "load" scope, except for AJAX where they called in "XMLHttpRequest" scope in order to access it through "this" from callback function.

All methods return "load" object in order to support methods chaining.


### Attribute "data-load"

Attribute "data-load" is found via "src" attribute of the script tag, using "load.js" as file name.

If you change the file name from "load.js" to another, or if you include "load.js" code into another file, then "data-load" attribute will not be found and thus loaded.

To handle that you can use an "id" attribute for the script tag with value "load.js", then "data-load" will be found using "id" attribute:

	<script type="text/javascript" src="file-with-load.js-code" data-load="app/init" id="load.js"></script>
