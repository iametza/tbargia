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
    namedwebsockets: 'mediascape/lib/namedwebsockets',
    jquery: '../resources/libs/jquery-2.1.1.min',
    qrcode:'mediascape/lib/qrcode.min',
    socketio: '/socket.io/socket.io',
    ui:'../resources/libs/jquery-ui',
    shake:'/resources/libs/shake',
    association:'/resources/association/association',
    domReady:'/resources/libs/domReady',
    page: '/resources/libs/page'
      },
    waitSeconds:25
  });


  // Start the main app logic.
  define( "mediascape", [ "mediascape/AdaptationToolkit/AdaptationToolkit","mediascape/Discovery/discovery"
  ,"mediascape/Sharedstate/sharedstate","mediascape/Mappingservice/mappingservice",
  "mediascape/Agentcontext/agentcontext","mediascape/Applicationcontext/applicationcontext",
  "mediascape/DiscoveryForAgentContext/discoveryforagentcontext",'mediascape/DeviceProfile/deviceProfile',
  'association'],
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
      setTimeout(function () {document.dispatchEvent(event);},3000);

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
      else setTimeout(mediascape.init,3000);


    });
 define ("router", ["mediascape","page"],
    function (ms,page) {

    var router = {};
    var moduleList   = Array.prototype.slice.apply( arguments );
    var firstTime = true;
    router.init = function(){

      _this = Object.create( router );
      // imports are loaded and elements have been registered

        var app = document.querySelector('#app');

        page('/', function (data) {
          app.route = 'azala';
          var routingEvent = new CustomEvent("onRouteChange",  {"detail": {"ruta": app.route, "path": data.path} });
          if (firstTime)
              setTimeout(function(){
                document.dispatchEvent(routingEvent);
                firstTime = false;
              }, 12000);
          else
              setTimeout(function(){
                document.dispatchEvent(routingEvent);
              }, 1000);

        });

        page('/:mota_nice_name', function (data) {
          // azala.route = 'mota';
          //azala.params = data.params;
        });

        page('/:mota_nice_name/:nice_name', function (data) {
          app.route = 'fitxa';
          app.params = data.params;
          var routingEvent = new CustomEvent("onRouteChange", {"detail": {"ruta": app.route, "path": data.path, "params": data.params} });
          setTimeout(function(){
            document.dispatchEvent(routingEvent);
          }, 1000);


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
