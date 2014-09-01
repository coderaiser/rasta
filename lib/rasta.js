(function() {
    'use strict';
    
    var Docker      = require('dockerode'),
        through     = require('through'),
        Util        = require('util-io'),
        
        SPAWNIFY    = 'bin/spawnify.js',
        
        docker      = new Docker({socketPath: '/var/run/docker.sock'}),
        
        addNewLine  = function (text) {
            var newLine    = '',
                n           = text && text.length;
            
            if (n && text[n-1] !== '\n')
                newLine = '\n';
            
            return text + newLine;
        };
    
    module.exports = function(name) {
        var ret;
        
        if (name)
            ret = start.bind(null, name);
        else
            ret = start;
            
        return ret;
        
    };
        
    function start(name, command, callback) {
        var read        = getReadStream(callback),
            error       = getErrorStream(callback);
        
        Util.checkArgs(arguments, ['name', 'command', 'callback']);
        
        docker.run(name, [SPAWNIFY, command], [read, error], {Tty:false}, function (err) {
            if (err)
                callback({
                    stderr: err
                });
        });
    }
    
    function getReadStream(callback) {
        var stream  = through(function write(data) {
            var json,
                stdout  = '' + data;
            
            json    = Util.parseJSON(stdout);
            
            if (!json)
                json    = {
                    stdout: stdout
                };
                
            callback(null, json);
        });
        
        return stream;
    }
    
     function getErrorStream(callback) {
        var stream  = through(function write(data) {
            var json,
                stderr  = '' + data;
            
            json    = Util.parseJSON(stderr);
            
            if (!json)
                json = {
                    stderr: addNewLine(stderr)
                };
            
            callback(null, json);
        });
        
        return stream;
    }
})();
