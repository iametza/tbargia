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
    discoveryforagentcontext:'/resources/libs/discoveryforagentcontext'
      },
    waitSeconds:25
  });


  // Start the main app logic.
  define( "mediascape", [ "mediascape/AdaptationToolkit/AdaptationToolkit","mediascape/Discovery/discovery",
  "../resources/association/association","../resources/Communication/Communication","mediascape/Agentcontext/agentcontext","mediascape/Applicationcontext/applicationcontext","mediascape/DiscoveryForAgentContext/discoveryforagentcontext",'mediascape/DeviceProfile/deviceProfile'],
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
    var systemReady = waitFor.every(function(event){
      if (event.ready) return true;
      else return false;
    })
  /*     setTimeout(function(){
        var event = new CustomEvent("mediascape-modules-ready", {"detail":{"loaded":true}});
        document.dispatchEvent(event);
      },4000);*/
    if (!systemReady) {
      var timeout = false;
      var time1 = new Date().getTime();
      var waitForTmp = waitFor;
      var intervalId = setInterval(
        function (){
          systemReady = waitForTmp.every(function(event){
            if (event.ready) return true;
            else return false;
          });
          var time2 = new Date().getTime();
          if (time2-time1>15000) timeout=true;
          if (timeout){
              clearInterval(intervalId);
              throw Error("Timeout getting ready system, events related:"+waitForTmp.map(function(d){return d.name+".ready="+d.ready;}));
           }
          else if (systemReady){
              clearInterval(intervalId);
              var event = new CustomEvent("mediascape-ready", {"detail":{"loaded":true}});
              document.dispatchEvent(event);
        }

      },500);

   }

  });
}());

var waitFor = [{name:'WebComponentsReady',ready:false}];
waitFor.forEach (function(event){
  document.addEventListener(event.name, function(e) {
    event.ready = true;
  });
},this);
