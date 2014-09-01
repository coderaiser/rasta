#!/usr/bin/env node

(function() {
    'use strict';
    
    var DIR         = __dirname + '/../www',
        
        rasta       = require('../'),
        webconsole  = require('console-io'),
        http        = require('http'),
        
        express     = require('express'),
        minify      = require('minify'),
        
        app         = express(),
        server      = http.createServer(app),
        
        port        =   process.env.PORT            ||  /* c9           */
                        process.env.app_port        ||  /* nodester     */
                        process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                        1337,
        
        ip          =   process.env.IP              ||  /* c9           */
                        '0.0.0.0',
                        
        docker      = rasta('ubuntu');
        
        app .use(webconsole(server, docker))
            .use(minify({
                dir: DIR
            }))
            .use(express.static(DIR));
        
        server.listen(port, ip);
        console.log('url: http://' + ip + ':' + port);
})();
