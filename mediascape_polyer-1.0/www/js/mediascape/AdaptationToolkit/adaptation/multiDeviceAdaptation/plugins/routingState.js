define([""],
function(){
    var routingState = function (){
        // save the actions done by the previous operations
        var aggregated_result = [];

        // configuration, defined by the JSON fule file as the input to this adaptation plugin
        var config = {};

        // a reference to the shared context which is maintained by the hybrid adaptation engine
        var context = {};

        // initialize the adaptation plugin
        this.init = function(cfg, ctx) {
            console.log("=============routing_adaptation=== [init]=================");
            console.log(cfg);

            config = cfg;
            context = ctx;
        };

        // deal with the change events of the application context
        this.onChange = function( evt, ctx) {
            context = ctx;
            var AE = mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation;

            var decision = {priority: config.priority, actions: []};
            var routingStatus = evt.value.ruta;
            var deviceType = mediascape.deviceType;
            var cmpsToLoad = [];
            switch (deviceType)
            {
                case "Mobile": cmpsToLoad.push("gai-nabarmendua","menua","am-karruselak","player","am-kontrolak","erlazionatutakoak");break;
                case "Tablet": cmpsToLoad.push("azken-bideoak", "gai-nabarmendua","menua","am-karruselak","player","am-kontrolak","erlazionatutakoak");break;
                case "TV": cmpsToLoad.push("azken-bideoak","gai-nabarmendua","menua","am-karruselak","player","am-kontrolak","erlazionatutakoak");break;
                case "Desktop": cmpsToLoad.push("azken-bideoak","gai-nabarmendua","menua","am-karruselak","player","am-kontrolak","erlazionatutakoak");break;
                default: cmpsToLoad.push("gai-nabarmendua","menua","am-karruselak","player","am-kontrolak","erlazionatutakoak");
            }
            console.log(cmpsToLoad);
            if ( routingStatus ){

               var cmps = mediascape.AdaptationToolkit.componentManager.core.getComponents();
               if (routingStatus === "azala" || routingStatus === "undefined"){
                  cmps.forEach (function(cmp){
                    if (cmpsToLoad.indexOf(cmp.id)!==-1){
                       if (cmp.id === "gai-nabarmendua")decision.actions.push({"type": "SHOW", "component": cmp.id});
                       if (cmp.id === "menua") decision.actions.push({"type": "SHOW", "component": cmp.id});
                       if (cmp.id === "azken-bideoak") decision.actions.push({"type": "SHOW", "component": cmp.id});
                       if (cmp.id === "am-karruselak") decision.actions.push({"type": "SHOW", "component": cmp.id});
                       if (cmp.id === "player") decision.actions.push({"type": "HIDE", "component": cmp.id});
                       if (cmp.id === "am-kontrolak") decision.actions.push({"type": "HIDE", "component": cmp.id});
                       if (cmp.id === "erlazionatutakoak") decision.actions.push({"type": "HIDE", "component": cmp.id});
                    }
                    else {
                      decision.actions.push({"type": "HIDE", "component": cmp.id});
                    }
                  });
               }
               else if (routingStatus === "fitxa"){
                cmps.forEach (function(cmp){
                  if (cmpsToLoad.indexOf(cmp.id)!==-1){
                     if (cmp.id === "gai-nabarmendua")decision.actions.push({"type": "HIDE", "component": cmp.id});
                     if (cmp.id === "menua") decision.actions.push({"type": "SHOW", "component": cmp.id});
                     if (cmp.id === "azken-bideoak") decision.actions.push({"type": "HIDE", "component": cmp.id});
                     if (cmp.id === "am-karruselak") decision.actions.push({"type": "HIDE", "component": cmp.id});
                     if (cmp.id === "player") decision.actions.push({"type": "SHOW", "component": cmp.id});
                     if (cmp.id === "am-kontrolak") decision.actions.push({"type": "SHOW", "component": cmp.id});
                     if (cmp.id === "erlazionatutakoak") decision.actions.push({"type": "SHOW", "component": cmp.id});
                   }
                  else
                    decision.actions.push({"type": "HIDE", "component": cmp.id});
                });
               }

            }
           console.log(decision);
            return  decision;

        };
    };

    routingState.__moduleName = "routingState";
    return routingState;
});
