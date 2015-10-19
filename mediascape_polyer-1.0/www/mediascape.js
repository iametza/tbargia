//main javascript
(function init() {
  // If we need to load requirejs before loading butter, make it so
  if ( typeof define === "undefined" ) {
    var rscript = document.createElement( "script" );
    rscript.onload = function() {
      init();
    };
    rscript.src = "../resources/require.js";
    document.head.appendChild( rscript );
    return;
  }

  require.config({
    baseUrl: '/js/',
    shim: {
          'socketio': {
              exports: 'io'
            }
    },
    paths: {
    underscore:'../resources/libs/underscore-min',
    d3:'../resources/libs/d3.v3.min',
    '2015data':'../resources/libs/2015',
    namedwebsockets: 'mediascape/lib/namedwebsockets',
    jquery: '../resources/libs/jquery-2.1.1.min',
    socketio: '/socket.io/socket.io',
    msv:'http://www.mcorp.no/lib/msv-2.0',
    mcorp:'http://www.mcorp.no/lib/mcorp-2.0',
    magicui:'../resources/libs/magic-ui-2.0',
    magic:'../resources/libs/magic-2.0',
    qrcode:'../resources/libs/qrcode.min',
    ui:'../resources/libs/jquery-ui',
    shake:'/resources/libs/shake',
    domReady:'/resources/libs/domReady',
    discoveryforagentcontext:'/resources/libs/discoveryforagentcontext',
    page: '/resources/libs/page'
      },
    waitSeconds:25
  });


  // Start the main app logic.
  define( "mediascape", [ "mediascape/AdaptationToolkit/AdaptationToolkit",
                          "mediascape/Discovery/discovery",
                          "../resources/association/association",
                          "../resources/Communication/Communication",
                          "mediascape/Agentcontext/agentcontext",
                          "mediascape/Applicationcontext/applicationcontext",
                          "mediascape/DiscoveryForAgentContext/discoveryforagentcontext",
                          "mediascape/DeviceProfile/deviceProfile"],
  function(){
      var mediascape = {};
      var discovery= {};

			var moduleList   = Array.prototype.slice.apply( arguments );
      mediascape.init = function(options) {
        mediascapeOptions = {};
        _this = Object.create( mediascape );
        var dontCall = ['sharedState', 'mappingService', 'applicationContext'];
      //  _this1 = Object.create( discovery );
			for( var i=0; i<moduleList.length; ++i ){
				var name = moduleList[ i ].__moduleName;
                 if (dontCall.indexOf(name) === -1) {
                     mediascape[name] = new moduleList[i](mediascape, "gq" + i, mediascape);
                 } else {
                     mediascape[name] = moduleList[i];
                 }

			}
      var event = new CustomEvent("mediascape-modules-ready", {"detail":{"loaded":true}});
      document.dispatchEvent(event);
      return _this;
      };

      mediascape.version = "0.0.1";
      // See if we have any waiting init calls that happened before we loaded require.
      if( window.ms ) {
        var args = window.mediascape.__waiting;
        delete window.mediascape;
        if( args ) {
          mediascape.init.apply( this, args );
        }
      }
      window.mediascape = mediascape;

      //return of ms object with discovery and features objects and its functions
      return mediascape;
    });

  require([ "mediascape" ], function (mediascape) {
    console.log("mediascape require");
    if (document.readyState === "complete") mediascape.init();
    else setTimeout(mediascape.init,2000);


  });

  define ("router", ["page","mediascape"],
    function (page) {

    var router = {};
    var moduleList   = Array.prototype.slice.apply( arguments );

    router.init = function(){

      _this = Object.create( router );
      // imports are loaded and elements have been registered

        var app = document.querySelector('#app');
        
        page('/', function () {
          console.log('router azala');
          app.route = 'azala';
          var routingEvent = new CustomEvent("onRouteChange",  {"detail": app.route });
          setTimeout(function(){
            document.dispatchEvent(routingEvent);
          }, 2000);
          
          

        });

        page('/:mota_nice_name', function (data) {
          // azala.route = 'mota';
          //azala.params = data.params;
        });

        page('/:mota_nice_name/:nice_name', function (data) {
          console.log('router fitxa');
          app.route = 'fitxa';
          app.params = data.params;
          var routingEvent = new CustomEvent("onRouteChange", {"detail": app.route });
          
          document.dispatchEvent(routingEvent);

        });

        // add #! before urls
        page({
          hashbang: false
        });
      return _this;
    };

    router.__moduleName = "router";
    router.page = page;
    window.router = router;
    return router;

  });


  require([ "router" ], function (router) {
    console.log("router require");
    if (document.readyState === "complete") router.init();
    else setTimeout(router.init, 4000);


  });



}());
