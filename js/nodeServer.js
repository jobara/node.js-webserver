var fluid = fluid || {};

fluid.fileServer = function (options) {
        mods: ["http", "url", "path", "fs"],
    var mods = {
        http: require("http"),
        url: require("url")
    };
    
    var http = require("http");
    var url = require("url");
    var path = re
    
    var port = options.port;
    var url = options.url;
    var cwd = process.cwd();
    var workingDir = options.dir || cwd;
    
    for (var i = 0; i < options.mods.length; i++) {
        var mod = options.mods[i];
        mods[mod] = require(mod);
    }
    
    var constructList = function (basePath, files) {
        var markup = "<ul>";
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            markup += "<li><a href=' "+ mods.path.join(basePath, file) +" '>" + file + "</a></li>";
        }
        markup += "</ul>";
        
        return markup;
    };
    
    var errResponse = function (response, errNum, errMsg) {
        response.writeHead(errNum,{
            'Content-type': "text/plain"
        });
        response.end(errMsg);
    };
    
    var fileResponse = function (response, file) {
        response.statusCode = 200;
        response.end(file, "binary");
    };
    
    var dirResponse = function (response, path, files) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.end(constructList(path, files));
    };
    
    var readFile = function (response, path) {
        mods.fs.readFile(path, "binary", function(err, file) {
            if(err) {
                errResponse(response, 500, err + "\n");
                return;
            }
            
            fileResponse(response, file);
        });
    };
    
    var readDir = function (response, path, uri) {
        mods.fs.readdir(path, function (err, files) {
            if(err) {
                errResponse(response, 500, err + "\n");
                return;
            }
            
            if (files.indexOf(options.defaultHTML) >= 0) {
                readFile(response, mods.path.join(path, options.defaultHTML));
                return;
            }
            
            dirResponse(response, uri, files);
        });
    };
    
    var server = function (request, response) {
        // from http://net.tutsplus.com/tutorials/javascript-ajax/learning-serverside-javascript-with-node-js/
        var uri = mods.url.parse(request.url).pathname;  
        var path = mods.path.join(workingDir, uri); 
        
        path = uri === "/" ? options.mainPage : path;
        
        mods.path.exists(path, function(exists) {  
            if(!exists) {
                errResponse(response, 404, "404 Not Found\n");
                return;  
            }
            
            mods.fs.stat(path, function (err, stats) {
                if (stats.isDirectory()) {
                    readDir(response, path, uri);
                } else {
                    readFile(response, path);
                }
            });
        });
    };
    
    mods.http.createServer(server).listen(port, url);
    console.log("Server running at " + url + ":" + port);
};

var options = {
    port: 8080,
    url: "127.0.0.1",
    dir: "/Users/jmo/Documents/git/",
    startPage: "/Users/jmo/Documents/git/build/html/main.html",
    defaultHTML: "index.html"
};

fluid.fileServer(options);
