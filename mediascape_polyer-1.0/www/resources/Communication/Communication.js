/*
** Long Library Name:
**	Communication Wrapper Module
**
** Acronym and its version:
**	Communication Wrapper
**
** Copyright claim:
**	Copyright ( C ) 2013-2014 Vicomtech-IK4 ( http://www.vicomtech.org/ ),
**	all rights reserved.
**
** Authors (in alphabetical order):
**	*	Iñigo Tamayo <itamayo@vicomteh.org>
**
** Description:
**	Wrapper for all communication functionality.
**
** Development Environment:
** 	The software has-been Implemented in JavaScript, and tested in Chrome
**	browsers and Android 4.3 device.
**
** Dependencies:
** 	As accounts package depends on other libraries, the user must adhere to and
**	keep in place any Licencing terms of those libraries:
**		requirejs v2.1.14 (http://requirejs.org/)
**
** Licenses dependencies:
**	License Agreement for requirejs:
**		BSD 3-Clause license (http://opensource.org/licenses/BSD-3-Clause)
**		MIT license (http://opensource.org/licenses/MIT)
**
*/

define(
  [	"mediascape/Sharedstate/sharedstate","mediascape/Mappingservice/mappingservice","../Communication/sharedmotion","jquery"
],
function(){
  var communication = {};
  var moduleList   = Array.prototype.slice.apply( arguments );
  var communication = function Communication( AdaptationToolkit, _AdaptationToolkit, config ){

    var appCtx = null;
    this.GROUP_ID = 'prototype3Test';
    var map = null;
    var context = {num_of_agents: 0, agents:[] };
    var local_agent_id;
    var nonUIChange = ["mutePlayer","soundPlayer"];
    var required_capability_list = ['screenSize','platform'];
    for( var i=0; i<moduleList.length-1; ++i ){
      var name = moduleList[ i ].__moduleName;
      if (name==="sharedmotion") communication[name ] =  moduleList[ i ];
      else  mediascape[name ] =  moduleList[ i ];
      //modules.push( adaptation[ name ] );
    }
    this.__moduleName = "Communication";
    communication.getFile = function(file){
      return $.ajax({
        url: file,
        dataType: "text"
      });
    };
    var filterByAgentId = function( list, id ) {
      for(var i=0; i<list.length; i++){
        if(list[i].agent == id){
          return list[i].actions;
        }
      }
    };
    var uiRelatedChange = function (componentStatus,change){
        var uiChange = true;
        if (componentStatus.length === 0) return uiChange;
        else {
            componentStatus.some (function(cmp){
               for (c in change){
                 if (cmp.compId === change[c].compId && change[c].customCmd.length >0 )
                 if (cmp.customCmd.length != change[c].customCmd.length){
                    if (nonUIChange.indexOf(change[c].customCmd[change[c].customCmd.length-1])>-1){
                         uiChange = false;

                    }
                 }
                 return false;
               }
            });
            return uiChange;
        }
    }
    // check if it is an existing agent
    var hasAgent = function(id) {
      var me = mediascape.Communication.getAgents()['self'];
      var meExists = context.agents.some(function(ag){if(ag.id === me.agentid) return true; else return false;});
      if (meExists)
        for(var i=0; i<context.agents.length; i++){
          if(context.agents[i].id === id)
          return true;
        }
    //  console.warn("Agent context error",id,context,meExists);
      return false;
    };
    var getAgentById = function(id) {
      for(var i=0; i<context.agents.length; i++){
        if(context.agents[i].id == id)
        return context.agents[i];
      }

      return null;
    };

    var updateContext = function(change,agtContext) {
      if( change.type === 'CAPABILITY_CHANGE' ) {
        var agent = getAgentById(change.agentid);
        var caps = agtContext.capabilities();
        for (c in caps){
          if (!agent.capabilities[c])
          agent.capabilities[c] =  caps[c];

        }
        if (required_capability_list.indexOf(change.capability)!=-1) {
          console.log(caps[c],c);
          agent.needsResolved.push(c);
        }
        agent.capabilities[change.capability] = change.value;
        if( hasAgent(change.agentid) ) {
          if (agent.needsResolved.length === required_capability_list.length){
            mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context);
            mediascape.Communication.notifyUpdateContext(context,"agent_joined");
          }
          else if (agent.needsResolved.length > required_capability_list.length) {
            mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context);
            mediascape.Communication.notifyUpdateContext(context,"cap_changed");
          }
        }

      }
      else if( change.type === 'CMP_CHANGE' ) {
        var agent = getAgentById(change.agentid);
        agent.capabilities[change.capability] = change.value;
        if( hasAgent(change.agentid) ){

          if (uiRelatedChange(agent.capabilities['componentsStatus'],change.value['componentsStatus']))
            mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context);
            mediascape.Communication.notifyUpdateContext(context,"cmp_changed",change.agentid);
        }
      }
      else if( change.type === 'AGENT_CHANGE' ) {
        console.log('communication AGENT_CHANGE');
        if( change.value === 'joined' ) {
          if( hasAgent(change.agentid) == false) {  // new agent joined, add it into the list
            context.num_of_agents += 1;
            var cnt = addCounter(change.agentid);
            context.agents.push( {"id": change.agentid, "capabilities": change.capabilities,"_id":  cnt,agentContext:change.agentCtx,"needsResolved":[],"agentProfile":change.agentProfile} );
            mediascape.AdaptationToolkit.uiComponents.hideAssociationPanel();
            mediascape.AdaptationToolkit.uiComponents.notification("New..","Agent connected",2000);
          }
        } else if( change.value === 'left' ){
          mediascape.AdaptationToolkit.uiComponents.notification("New..","Agent disconnected",2000);
          if( hasAgent( change.agentid) == true) {   // existing agent left, remove it from the list
            for(var j=0; j<context.agents.length; j++){
              if(context.agents[j].id == change.agentid){
                context.agents.splice(j, 1);
                context.num_of_agents -= 1;
                mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context);
                mediascape.Communication.notifyUpdateContext(context,"agent_left");
                console.log(context,"LEFT");
                break;
              }
            }
          }

        }
      }
      return true;
    };
    var onAgentsChange = function(e){
      console.log("AGENT CHANGE",e);
      if( e.agentContext == null ){
        var change = {};
        change['type'] = 'AGENT_CHANGE';
        change['agentid'] = e.agentid;
        change['value'] = 'left';
        console.log("left");
        updateContext(change);
      } else if( Object.keys(e.agentContext.capabilities()).length>1 ) {
        var change = {};
        change['type'] = 'AGENT_CHANGE';
        change['agentid'] = e.agentid;
        change['value'] = 'joined';
        change['capabilities'] = e.agentContext.capabilities();
        change['agentCtx'] = e.agentContext;
        change['agentProfile'] = navigator.appVersion.indexOf('Nexus 7')>-1 ? "TV":"unknown";
        updateContext(change,e.agentContext);
        if (e.agentContext.capabilities()['screenSize'])
        if (e.agentContext.capabilities()['screenSize']==="supported")
        e.agentContext.on('screenSize', function(key, value) {

          if( key && value && Object.prototype.toString.call( value ) === '[object Array]' && value!="supported") {
            var change = {};
            change['type'] = 'CAPABILITY_CHANGE';
            change['agentid'] = e.agentid;
            change['capability'] = key;
            change['value'] = value;
            updateContext(change,e.agentContext);
          }
        });

        if (e.agentContext.capabilities()['touchScreen'])
        if (e.agentContext.capabilities()['touchScreen']!=="unsupported"){
          e.agentContext.on('touchScreen', function(key, value) {

            if( key && value ) {
              var change = {};
              change['type'] = 'CAPABILITY_CHANGE';
              change['agentid'] = e.agentid;
              change['capability'] = key;
              change['value'] = value;
              updateContext(change,e.agentContext);
            }
          });
        }
        if (e.agentContext.capabilities()['platform'])
        if (e.agentContext.capabilities()['platform'] === "supported"){
          e.agentContext.on('platform', function(key, value) {

            if( key && value ) {
              var change = {};
              change['type'] = 'CAPABILITY_CHANGE';
              change['agentid'] = e.agentid;
              change['capability'] = key;
              change['value'] = value;
              updateContext(change,e.agentContext);
            }
          });
        }


        if (e.agentContext.capabilities()['componentsStatus'])
        if (e.agentContext.capabilities()['componentsStatus']==="supported"){
          e.agentContext.on('componentsStatus', function(key, value) {

            if( key && value && value!="undefined") {
              var change = {};
              change['type'] = 'CMP_CHANGE';
              change['agentid'] = e.agentid;
              change['capability'] = key;
              change['value'] = value;
              updateContext(change,e.agentContext);
            }
          });
        }

      }

    };
    var addCounter = function(agentid){
        var ids_order = appCtx.getItem('order_agentid') || [];
        console.log("AGENT ORDER",ids_order);
        if(ids_order.lastIndexOf(agentid)===-1)
        {
          ids_order.push(agentid);
          appCtx.setItem('order_agentid',ids_order);
        }
        console.log('lastIndexOf',ids_order.lastIndexOf(agentid));
        return ids_order.lastIndexOf(agentid);
    }
    communication.getContext = function(){
      return context;
    }
    communication.startApplicationContext = function (){
      console.log("STARTING APPLICATION CONTEXT");
      var applicationID ="Mediascape";
      mediascape.AgentID = this.createGroupId();
      map = mediascape.mappingService({maxTimeout:6000});
      // Already exists a group
      if (this.getUrlVar('group')) {
        this.GROUP_ID =this.getUrlVar('group');
      }
      // there is not group, created
      else {
        this.GROUP_ID = "mediascape"+this.createGroupId();
      }
      var _this = this;

      map.getGroupMapping(_this.GROUP_ID).then(function (data1) {
        setComponentsAsIntrument();
        
        if (!appCtx) {
          appCtx = mediascape.applicationContext(data1.group,{
            autoClean: true,
          });

          local_agent_id = mediascape.Communication.getAgents().self.agentid;
          var evt = new CustomEvent("applicationContext-ready", { "detail": "application context ready" });
          document.dispatchEvent(evt);


        }

        appCtx.on('agentchange', onAgentsChange);

      });




    }
    var setComponentsAsIntrument = function (){
      var ac = mediascape.agentContext;
      var _this = this;
      var componentStatusInstrument = {
        init: function () {
          this.setCapability("componentsStatus", "supported");
          document.addEventListener('onComponentsChange',function(data){

              ac.setItem('componentsStatus',data.detail.cmps);

          });
          console.log("INIT INSTRUMENT");

        },
        on: function (){

          document.addEventListener('onComponentsChange',function(data){


              ac.setItem('componentsStatus',data.detail.cmps);

          });
        },
        off: function (){
          document.removeEventListener('onComponentsChange',function(data){


              ac.setItem('componentsStatus',data.detail.cmps);


          });
        }

      };
      ac.load({
        "componentsStatus": componentStatusInstrument
      });
    }

    communication.setRemoteAgentComponentStatus = function (agentId,cmpId,cmd){
      var agents = context.agents;
      var cmps = [];
      if (agents.length === 0){
        throw new Error("no agent registered");
      }
      else {
        var agentChange = null;
        agents.forEach (function(ag){
          if (ag.id === agentId){
            cmps = ag.capabilities['componentsStatus'];
            for (c in cmps){
              if (cmps[c].compId === cmpId){
                agentChange = ag;
                //if (cmd === "hide") cmps[c].customCmd = [];
                /*else */cmps[c].customCmd.push(cmd);
                if (nonUIChange.indexOf(cmd)>-1){
                    cmps.eventType="data";
                }
                else {
                   cmps.eventType ="ui";
                }
              }
            }
          }
        });
      }
      if (agentChange!=null){
        console.log(agents);
        if (mediascape.Communication.getAgents()['self'].agentid === agentId)
        {
          var agent = getAgentById(agentId);
          if (cmps.eventType!=="data")
              setTimeout(function(){mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context,true);},0);
          mediascape.agentContext.setItem('componentsStatus',cmps);
          setTimeout(function(){mediascape.Communication.notifyUpdateContext(context,"cmp_changed",agentId);},500);


        }
        else {
          agentChange.agentContext.setItem('componentsStatus',cmps);

        }

      }
      else {
        console.warn("No change made it",agentId,cmpId,cmd);
      }
    }
    communication.setLocalAgentComponentStatus = function (agentId,cmpId,cmd){
      var agents = context.agents;
      var cmps = [];
      if (agents.length === 0){
        throw new Error("no agent registered");
      }
      else {
        var agentChange = null;
        agents.forEach (function(ag){
          if (ag.id === agentId){
            cmps = ag.capabilities['componentsStatus'];
            for (c in cmps){
              if (cmps[c].compId === cmpId){
                agentChange = ag;
                //if (cmd === "hide") cmps[c].customCmd = [];
                /*else */cmps[c].customCmd.push(cmd);
                if (nonUIChange.indexOf(cmd)>-1){
                    cmps.eventType="data";
                }
                else {
                   cmps.eventType ="ui";
                }
              }
            }
          }
        });
      }
      if (agentChange!=null){
        setTimeout(function(){mediascape.AdaptationToolkit.Adaptation.multiDeviceAdaptation.localUpdate(context,true);},0);


      }
      else {
        console.warn("No change made it",agentId,cmpId,cmd);
      }
    }
    communication.notifyUpdateContext = function(context,type,agentid){
      var evt = new CustomEvent("contextUpdate", { "detail": {"context":context,type:type,"agentid":agentid}});
      document.dispatchEvent(evt);
    }

    communication.getAgents = function (){

      return  appCtx.getAgents();

    }

    communication.cleanAgents = function (agents){
      var appxAgents  = getAgents();
      var appxAgents = appxAgents.map(function(ag){
        return ag.agentid;
      });
      var agts = agents.filter(function(ag){
        if (appxAgents.indexOf(ag.agentid)>-1) return true;
        else return false;
      })
      return agts;
    }
    communication.getUrlVar = function (name){
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
      });
      return vars[name];
    }
    communication.createGroupId = function ()
    {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
    communication.getGroupId = function(){
      return this.GROUP_ID;
    }

    Communication.getAgentId = function (){
      return local_agent_id;
    }
    communication.getApplicationContext = function (){
      return appCtx;
    }

    return communication;
  };

  communication.__moduleName = "Communication";
  return communication;

});
