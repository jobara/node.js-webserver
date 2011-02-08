var fluid = fluid || {};

fluid.fileServer = function (options) {
    var mods = {};
    var port = options.port;
    var url = options.url;
    var workingDir = options.dir || process.cwd();
    
    for (var i = 0; i < options.mods.length; i++) {
        var mod = options.mods[i];
        mods[mod] = require(mod);
    }
    
    var errResponse = function (response, errNum, errMsg) {
        response.sendHeader(errNum, {"Content-Type": "text/plain"});
        response.write(errMsg);
        response.close();
    };
    
    var fileResponse = function (response, file) {
        response.sendHeader(200);
        response.write(file, "binary");
        response.close();
    };
    
    var dirResponse = function (response, path, files) {
        var markup = "<ul>"
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            markup += "<li><a href=' "+ mods.path.join(path, file) +" '>" + file + "</a></li>"
        }
        markup += "</ul>"
        
        response.sendHeader(200, {"Content-Type": "text/html"});
        response.write(markup);
        response.close();
    };
    
    var server = function (request, response) {
        // from http://net.tutsplus.com/tutorials/javascript-ajax/learning-serverside-javascript-with-node-js/
        var uri = mods.url.parse(request.url).pathname;  
        var path = mods.path.join(workingDir, uri); 
         
        mods.path.exists(path, function(exists) {  
            if(!exists) {
                errResponse(response, 404, "404 Not Found\n");
                return;  
            }
            
            mods.fs.stat(path, function (err, stats) {
                if (stats.isDirectory()) {
                    mods.fs.readdir(path, function (err, files) {
                        if(err) {
                            errResponse(response, 500, err + "\n");
                            return;
                        }
                        mods.sys.puts("uri: " + uri);
                        dirResponse(response, uri, files);
                    });
                } else {
                    mods.fs.readFile(path, "binary", function(err, file) {
                        if(err) {
                            errResponse(response, 500, err + "\n");
                            return;
                        }
                        
                        fileResponse(response, file);
                    });
                }
            });
        });
    };
    
    mods.http.createServer(server).listen(port, url);
    mods.sys.puts("Server running at " + url + ":" + port);
};

var options = {
    mods: ["sys", "http", "url", "path", "fs"],
    port: 8080,
    url: "127.0.0.1",
    dir: "/Users/jmo/Documents/git/"
};

fluid.fileServer(options);
