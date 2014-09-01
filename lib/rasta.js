(function() {
    'use strict';
    
    var Docker      = require('dockerode'),
        through     = require('through'),
        Util        = require('util-io'),
        
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
        var commandList = [],
            read        = getReadStream(callback),
            error       = getErrorStream(callback);
        
        Util.checkArgs(arguments, ['name', 'command', 'callback']);
        
        commandList     = command.split(' ');
        
        docker.run(name, commandList, [read, error], {Tty:false}, function (err) {
            if (err)
                callback({
                    stderr: err
                });
        });
    }
    
    function getReadStream(callback) {
        var was,
            stream  = through(
                function write(data) {
                    var stdout = '' + data;
                    
                    callback(null, {
                        stdout: stdout
                    });
                },
                function end () {
                    if (!was)
                        callback(null, {});
                });
        
        return stream;
    }
    
     function getErrorStream(callback) {
        var was,
            stream  = through(
                function write(data) {
                    var stderr  = '' + data;
                    
                    was = true;
                    
                    callback(null, {
                        stderr: addNewLine(stderr)
                    });
                },
                function end () {
                    if (!was)
                        callback(null, {});
                });
        
        return stream;
    }
})();
