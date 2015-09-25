/*
ms-adaptationRule1 is a specific rule to apply multi-device adaptation decisions.
It takes into account the following properties defined in a component:
* needs: specific features in the agent that the component needs unavoidably
* BestFit: the role of the agent that the component would prefer (Player,
Controller, Metadata, Broker...). WP3 provides a classification of the agent
for each of this roles, being able to be Baseline, Full, Advance or Extended.
* multiDeviceBehaviour: each component could be "movable", "duplicable"
and/or "required"
This multi-device adaptation rule has the following steps analysing each component
to decide if show or not:
* STEP 1: Analyse if the current agent has the needs. If not, it won't show it. If yes,
or if the component doesn't have needs, go to STEP 2.
* STEP 2:
	* Analyse the BestFit of the component
	* Analyse my capability for that role in the current agent
	* Analyse the capability for that role of the rest of the available agents
	* With this information go to STEP 3
* STEP 3: Am I the Winner? Depending of this, it will decide to show or not that
component. The AmITheWinner function provides 4 results, always taking into account
that I can't consider another agent better than me for that component if doesn't fulfil
the needs:
	* result 0: I am not the winner, there is another agent better to show that component
	* result 1: I am the only winner. There is not any other agent better or equal than me
	* result 10: I am the winner but not the only one. I'm not the lowest agent id from those agents
	* result 11: I am the winner but not alone but I'm the lowest agent id from those agents
* STEP 4: With this result
	* If the comp is required and duplicable it will show it for results 1, 10 and 11
	* If the comp is required and NOT duplicable it will show it for results 1 and 11
	* If the comp is NOT required and duplicable it will show it for (results 1, 10 and
	11) && (Device capability for that role at least "Advance")
	* If the compo is NOT required and NOT duplicable it will show it for (results 1 and 11) &&
	(Device capability for that role at least "Advance")
  * If user has decided to render cmp in some agent, NOT duplicable cmp will show only on that agent.
  *
  */

define(["mediascape/AdaptationToolkit/adaptation/multiDeviceAdaptation/ruleConstructor"],
  function(ruleConstructor){

    var bestfit = new ruleConstructor('bestfit');

    bestfit.onSeveralAgent = function (agents,local){
      console.log("onSeveralAgent");
      this.localChange = local || false;
      this.components = mediascape.AdaptationToolkit.componentManager.core.getComponents();

      var me = agents.filter(function(ag){
            if (ag.id ===  mediascape.Communication.getAgentId() ) return true;
            return false;
      })[0];

      try {
      var mediasNumb = 0;
      this.components = this.components.filter(function(cmp){
          //Check if there is any command from user

          var otherAgents = agents.filter(function(ag){
                if (ag.id === mediascape.Communication.getAgentId() ) return false;
                return true;
          });
          var moveToOtherAgent =false;
          if(me.capabilities['componentsStatus']!="undefined"
             && me.capabilities['componentsStatus']!="supported")
          {
            var _cmps = me.capabilities['componentsStatus'];
            for (c in _cmps){
               if (_cmps[c].compId === cmp.getAttribute('compId')){
                 if (_cmps[c].customCmd.length>0)
                   if (_cmps[c].customCmd.lastIndexOf('show') >= _cmps[c].customCmd.lastIndexOf('hide')){
                     /*if (cmp.lproperties['duplicable']==="false")
                      otherAgents.forEach(function(ag){
                       mediascape.Communication.setRemoteAgentComponentStatus(ag.id,cmp.getAttribute('compId'),'hide');
                     });*/
                     //this.localChange = false;
                     return true;
                   }
                   else{
                    // this.localChange = false;
                     return false;
                   }
                   //else return false;

               }
            }
          }

        /*  if (me.customCmdAg.split(',').indexOf(cmp.getAttribute('compId'))>-1){
              return true;
          }
          */
          // if there is some agent with this component cmd
          var agtoMove = null;
          moveToOtherAgent = otherAgents.some(function(ag){
            if(ag.capabilities['componentsStatus']!="undefined"
               && ag.capabilities['componentsStatus']!="supported")
            {
              var _cmps = ag.capabilities['componentsStatus'];
              for (c in _cmps){
                 if (_cmps[c].compId === cmp.getAttribute('compId')){
                     if (_cmps[c].customCmd.lastIndexOf('show') > _cmps[c].customCmd.lastIndexOf('hide')){
                       agtoMove = ag;
                       return true;
                     }

                 }
              }
            }
          });

          var myNote = 0;
          // True by default because maybe has not needs
          var needs = true;
          //Check for needs, this agent support all needs or not
          needs = cmp.lproperties['needs'].every(function(atr){
              if (atr.key === "none") return true;
              if (atr.key === "x86")
                if (navigator.appVersion.indexOf('x86')===-1 && navigator.appVersion.indexOf('Windows NT 6.3')===-1) return false;
              if (atr.key === "samsung")
                  if (navigator.appVersion.indexOf('Windows NT 6.1')===-1) return false;
              if (atr.key === "androidtv")
                      if (navigator.appVersion.indexOf('MK12')===-1) return false;
              if (atr.key.toLowerCase().indexOf('screensize')>-1){
                  if (atr.operation)
                    if (atr.operation === "bigger"){
                      //var size = mediascape.Agent.data['screensize'][1];
                      var diagonal =this.getCapability(me.capabilities,"screen");
                      if (diagonal>parseInt(atr.value)) return true;
                      else return false;

                    }
              }
              if (atr.key.toLowerCase().indexOf('touchable')>-1){
                  if (this.getCapability(me.capabilities,"touchable")) return true;
                  else return false;
              }
              return true;
          },this);
          // If needs false means that is not a good agent for cmp
          if (!needs) return false;

          // Check my note related with a component
          myScreen = this.getCapability(me.capabilities,'screen');
          myInteractivity = this.getCapability(me.capabilities,'touchable');
          // other agents that covers the needs
          otherAgents = otherAgents.filter(function(ag){
            if (cmp.lproperties['needs'][0].key  === "none") return true;
            else
              if( cmp.lproperties['needs'][0].key === "x86" )
                  if (ag.capabilities['platform'].indexOf('x86')!=-1 || ag.capabilities['platform'].indexOf('Linux x86_64')!=-1 ) return true;
              else {
                      if( cmp.lproperties['needs'][0].key === "samsung" ){
                        if (ag.capabilities['platform'].indexOf('Windows NT 6.1')!==-1) return true;
                      }
                      if (cmp.lproperties['needs'][0].key === "androidtv")
                              if (navigator.appVersion.indexOf('MK12')!==-1) return true;

                    else return false;
                  }


          });
          // Collect capability of each agent
          otherAgents.forEach(function(ag){
              ag.note = 0;
              ag.screen = this.getCapability(ag.capabilities,'screen');
              ag.interactivity =  this.getCapability(ag.capabilities,'touchable');

          },this);
        // Evaluate each agent against me
          var results = [];
          var result = "";
          if (otherAgents.length>0) {
          otherAgents.forEach(function(ag){

              if (cmp.lproperties['bestfit'].getBestFitPropertie("biggestScreenSize")){
                 if (ag.screen < myScreen) results.push("1");
                 else if (ag.screen > myScreen) results.push("0");
                      else if (amIFirstOne(me,agents)) results.push("11");
                           else results.push("10")
              }
              else if (cmp.lproperties['bestfit'].getBestFitPropertie("smallestScreenSize")){
                 if (ag.screen < myScreen) results.push("0");
                 else if (ag.screen > myScreen) results.push("1");
                      else if (amIFirstOne(me,agents))results.push("11");
                            else results.push("11");
              }
              // If there was a draw check next propertie

              if (cmp.lproperties['bestfit'].getBestFitPropertie("touchable")){
                  if (!ag.interactivity && myInteractivity) results.push("1");
                  if (ag.interactivity && !myInteractivity) results.push("0");
                  if ((ag.interactivity && myInteractivity) || (!ag.interactivity && !myInteractivity))
                      if (amIFirstOne(me,agents)) results.push("11");
                      else results.push("10");
              }


          },this);

          if (results.indexOf('0')>-1) result = '0';
          else if (results.indexOf('10')==-1 && results.indexOf('11')==-1) result="1";
                else if (results.indexOf('10')>-1) result = '10';
                      else result = '11';
        }
        // IF AM THE ONLY ONE
        else {
                result = 1;
         }
          // Compare agents notes
          console.log("result",result,moveToOtherAgent,qualifiedAgentAndComponentToShow(me,cmp),cmp.nodeName);


          if ((cmp.lproperties['duplicable'] =="true" && cmp.lproperties['required'] =="true")&&
              (result =="1" || result=="10" || result=="11"))
                return true;
          if ((cmp.lproperties['duplicable'] =="false" && cmp.lproperties['required'] =="true")&&
            (result =="1" || result=="11") && !moveToOtherAgent)
                return true;
          if ((cmp.lproperties['duplicable'] =="false" && cmp.lproperties['required'] =="true")&&
                  (result =="1" || result=="11") && moveToOtherAgent)
                      return false;
          if ((cmp.lproperties['duplicable'] =="true" && cmp.lproperties['required'] =="false")&&
                    (result =="1" || result=="10" || result=="11")&& qualifiedAgentAndComponentToShow(me,cmp))
                return true;
          if ((cmp.lproperties['duplicable'] =="false" && cmp.lproperties['required'] =="false")&&
                    (result =="1" || result=="11") && !moveToOtherAgent && qualifiedAgentAndComponentToShow(me,cmp))
                return true;
          if ((cmp.lproperties['duplicable'] =="false" && cmp.lproperties['required'] =="false")&&
                        (result =="1" || result=="11") && moveToOtherAgent)  {
                          return false;
                    }

          return false;

      },this);
      }
      catch (e){
        console.log(e);
      }
      // Check if media limitation of agent
    //  var videoLimit = mediascape.Agent.checkAgentLimitation('video');
    /*  if (videoLimit){
          console.log("THIS COMPONENTS",this.components);
          var number = 0;
          this.components = this.components.filter(function(cmp){
              if (cmp.nodeName.toLowerCase() !== "x-media") return true;
              else if (cmp.nodeName.toLowerCase() === "x-media" && number<videoLimit) {
                      number++;
                      return true;
                    }
                    else return false;
          });

      }*/
      console.log(this.components);
      return this;
    }
    bestfit.getCapability = function (ag,propertie){
      var result = 0;
      //console.log(ag);

      //bigScreenCapability
      if (propertie === "screen"){
        var size = ag['screenSize'][1];
        var diagonal = Math.round(
        Math.sqrt(
          Math.pow(
            parseFloat(size['screenX']),2)+Math.pow(parseFloat(size['screenY']),2)));
         return diagonal;
      }
      if (propertie === "touchable"){
          var val="";
          if (ag['touchScreen'].presence !=undefined) val = ag['touchScreen'].presence;
          else {
            if (ag['touchScreen'] === "supported"){
              val = true;
            }
            else val = false;

          }
          return val;
      }
      return false;

    }
    function amIFirstOne (me,agents){

        if (agents.length===1) return true;
        else
          if (me._id< agents[1]._id)
                  return true;
          else return false;
     }
    function qualifiedAgentAndComponentToShow (me,cmp){
      if (cmp.lproperties['bestfit'].getBestFitPropertie("biggestScreenSize")){
        var myScreen = bestfit.getCapability(me.capabilities,'screen');
        if (myScreen>8) return true;
        else return false;
      }
      else if (cmp.lproperties['bestfit'].getBestFitPropertie("touchable")){
        var myInteractivity = bestfit.getCapability(me.capabilities,'touchable');
        if ( myInteractivity) return threshold = true;
        else return false;
     }
      return false;
    }

    bestfit.__moduleName = "bestfit";
    return bestfit;

  });
