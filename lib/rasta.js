(function() {
    'use strict';
    
    var Docker      = require('dockerode'),
        through     = require('through'),
        check       = require('checkup'),
        jonny       = require('jonny'),
        
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
        var read        = getStream('stdout', callback),
            error       = getStream('stderr', callback);
        
        check(arguments, ['name', 'command', 'callback']);
        
        docker.run(name, [SPAWNIFY, command], [read, error], {Tty:false}, function (err) {
            if (err)
                callback({
                    stderr: err
                });
        });
    }
    
    function getStream(name, callback) {
        var stream  = through(function write(data) {
            var json;
            console.log(data);
            
            data  = '' + data;
            
            json    = jonny.parse(data);
            
            if (!json) {
                json = {};
                json[name] = addNewLine(data);
            }
            
            callback(null, json);
        });
        
        return stream;
    }
    
})();
