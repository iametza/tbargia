/*
** Long Library Name:
**      Adaptation toolkit Module
**
** Acronym and its version:
**      Adaptation toolkit v1.0
**
** Copyright claim:
**      Copyright ( C ) 2013-2014 Vicomtech-IK4 ( http://www.vicomtech.org/ ),
**      all rights reserved.
**
** Authors (in alphabetical order):
**      Ana Dominguez <adominguez@vicomtech.org>
**      Iñigo Tamayo <itamayo@vicomteh.org>,
**      Mikel Zorrila <mzorrilla@vicomtech.org>,
**
** Description:
**      The Adaptation toolkit Module defines all function relatives of multi device adaptation
**
** Development Environment:
**      The software has-been Implemented in JavaScript, and tested in Chrome and firefox
**      browsers.
**
** Dependencies:
**      As accounts package depends on other libraries, the user must adhere to and
**      keep in place any Licencing terms of those libraries:
**              requirejs v2.1.14 (http://requirejs.org/)
**
** Licenses dependencies:
**      License Agreement for requirejs:
**              BSD 3-Clause license (http://opensource.org/licenses/BSD-3-Clause)
**              MIT license (http://opensource.org/licenses/MIT)
**
*/

define(
  ["mediascape/AdaptationToolkit/adaptation/multiDeviceAdaptation/rules/bestfit"
  ],
  function(){
    var ruleList   = Array.prototype.slice.apply( arguments );

    var multiDeviceAdaptation = function(){
      var cmpNum = 4;
      var rule = null;
      var rules = [];
      var properties = null;
      this.init = function (ruleName,properties){
          var _rulename = ruleName || "bestfit";
          rule = this.findRule(_rulename);
          this.properties = properties;

      }
      this.findRule = function (name){
        var rule = rules.filter(function(el){
              if (el.name == name) return true;
              else return false;
        })[0];
        if (!rule) throw new Error ("There is no rule named: "+name);
        return rule;
      }

      this.registerRules = function () {
        ruleList.forEach(function(_rule,i){
           if  (_rule.checkForImplementation()){
              console.log('registring rule',_rule);
                rules.push(_rule);
            }
            else throw new Error ("Some error registring layout: "+_rule.name);
        });


      };
      this.simulation = function (el) {
          clearInterval(tim);
          var components = mediascape.AdaptationToolkit.componentManager.core.getComponents();
          var max = components.length;

          var componentsToRender = [];
          components.forEach(function(c){
            c.setAttribute('class','');
            c.setAttribute('style','');
          });
          var tmp = [];
          function random () {return Math.floor (Math.random() * components.length);}

          for (var i =0 ;i<cmpNum; ){
              var compNumber = random();

              if(tmp.indexOf(compNumber) === -1){
                tmp.push(compNumber);
                componentsToRender.push(components[compNumber]);
                compNumber = random();
                i++
              }
          }
          //mediascape.AdaptationToolkit.Adaptation.UIAdaptation.useLayout('horizontal');
          mediascape.AdaptationToolkit.Adaptation.UIAdaptation.onComponentsChange(componentsToRender);
          console.log("Multidevice adpatation sending:"+componentsToRender+" component");

          if (cmpNum === 1) cmpNum = 4;
          else cmpNum--;
      };
      // ApplicationContext Changed, relatives to agents
      this.onAgentsChange = function (ctx,state){
          console.log(ctx.agents,state);

          if ( state == "connect" ) mediascape.AdaptationToolkit.uiComponents.notification("New..","Agent connected",2000);
          else if ( state == "disconnect" ) mediascape.AdaptationToolkit.uiComponents.notification("New..","Agent disconnected",2000);
          //else mediascape.AdaptationToolkit.uiComponents.notification("New..","Component move it");
          var components = mediascape.AdaptationToolkit.componentManager.core.getComponents();
          components.forEach(function(c){
            c.setAttribute('class','');
            c.setAttribute('style','');
          });
          console.log(ctx.agents );
          try {
          if (ctx.num_of_agents === 0){
             rule.onUniqueAgent(ctx.agents).sendDecision(mediascape.AdaptationToolkit.Adaptation.UIAdaptation.onComponentsChange);
          }
          else {
             rule.onSeveralAgent(ctx.agents).sendDecision(mediascape.AdaptationToolkit.Adaptation.UIAdaptation.onComponentsChange);
          }
        } catch(e){
          console.log(e);
        }
      }
      // Whenever local agent need to update adaptationEngine
      this.localUpdate = function (ctx,local){
          console.log(ctx);

          var components = mediascape.AdaptationToolkit.componentManager.core.getComponents();
          components.forEach(function(c){
            c.setAttribute('class','');
            c.setAttribute('style','');
          });
          console.log(ctx.agents );
          try {
          if (ctx.num_of_agents === 0){
             rule.onUniqueAgent(ctx.agents,local).sendDecision(mediascape.AdaptationToolkit.Adaptation.UIAdaptation.onComponentsChange);
          }
          else {
             rule.onSeveralAgent(ctx.agents,local).sendDecision(mediascape.AdaptationToolkit.Adaptation.UIAdaptation.onComponentsChange);
          }
        }
        catch (e){
          console.log(e);
        }

      }
      // MOVE COMPONENT TO OTHER AGENT
      this.setComponentToAgent = function(agentid,cmp){
          var agents = mediascape.Communication.getAgents();
          agents.forEach(function(ag){
              if (ag.agentid === agentid){
                ag.customCmdAg +=cmp.getAttribute('compId')+',';
              }
              else {
                // remove from cmd
                if(ag.customCmdAg!==""){
                    if (ag.customCmdAg.split(',').indexOf(cmp.getAttribute('compId'))>-1){
                          var length =  ag.customCmdAg.length;
                          var compname = cmp.getAttribute('compId');
                          var ind = ag.customCmdAg.split(',').indexOf(compname);
                          if (ind>-1){
                              var ar = ag.customCmdAg.split(',');
                              ar = ar.filter(function(el,i){ if (i===ind)return false;else return true;});
                              ag.customCmdAg = ar.join(',');
                          }

                    }
                }
              }
          });

          mediascape.Communication.setAgents(agents);
          this.localUpdate(agents);
      }
      this.getPropertie = function(name){
          for (var prop in this.properties){
            if (prop ===name) return this.properties[prop];
          }
          return undefined;
      }

     document.addEventListener('mediascape-modules-ready',this.registerRules.bind(this));
    };
    multiDeviceAdaptation.__moduleName = "multiDeviceAdaptation";
    return multiDeviceAdaptation;

  });
