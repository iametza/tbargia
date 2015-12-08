define(["mediascape/AdaptationToolkit/adaptation/UIAdaptation/layoutConstructor"],
  function(LayoutConstructor){

    var azala = new LayoutConstructor('azala');
    azala.onComponentsChange = function (cmps){
        console.log("components changed");
        this.cmps = cmps;
      var components = mediascape.AdaptationToolkit.componentManager.core.getComponents();
      for(var i=0;i<components.length;i++){
        components[i].style.width='';
        components[i].style.height='';
        components[i].style.gridColumn='';
        components[i].style.gridRow='';
        components[i].style.order='';
      }

      this.render(cmps);


    }

    azala.render = function (cmps){


/*
    var container=document.querySelector('#componentsContainer');

    container.style.overflowX='';

    container.style.display='grid';
    container.style.gridAutoFlow='row dense';

    var width = window.innerWidth ||document.documentElement.clientWidth ||document.body.clientWidth;
    var height = window.innerHeight ||document.documentElement.clientHeight ||document.body.clientHeight;
  //  var width = container.innerWidth;
  //  var height = container.innerHeight;
    var columns = Math.round(width/10);
    var r=Math.round(height/10);
    var c_width=(width)/columns;
    var r_height=(height)/r;

    container.style.gridTemplateColumns='repeat('+columns+','+c_width+'px)';
    container.style.gridTemplateRows='repeat('+r+','+r_height+'px)';

     for(var i=0;i<cmps.length;i++)
     {
        //console.log("cmps", cmps[i]);
        var rwidth = (cmps[i].lproperties.rwidth.split('%')[0]/100)*width;
        cmps[i].style.order=cmps[i].lproperties.order;
        cmps[i].style.gridColumn='span '+Math.round(parseInt(rwidth)/c_width);
        cmps[i].style.width=Math.round(parseInt(rwidth)/c_width)*c_width+'px';
        cmps[i].style.height=(Math.round(parseInt(rwidth)/c_width)*c_width*cmps[i].lproperties.propy)/cmps[i].lproperties.propx+'px';
        cmps[i].style.gridRow='span '+Math.round(parseInt(cmps[i].style.height.split('px')[0])/r_height);
        cmps[i].style.backgroundColor='white';


     }
*/
    }
    azala.onOrientationChange = function (cmps){
      console.log("test");
    }
    azala.onLayoutChangeEvent = function (cmps){
      console.log("layout changed");

      for(var i=0;i<cmps.length;i++){
        cmps[i].style.width='';
        cmps[i].style.height='';
        cmps[i].style.gridColumn='';
        cmps[i].style.gridRow='';
        cmps[i].style.order='';
        //cmps[i].style.display='block';

      }
      this.render(cmps);

    }



    azala.onResizeEvent=function(cmps){
      console.log("layout resized");

      this.render(cmps);
    }
    azala.unload = function(cpms){

    }
    azala.__moduleName = "azalaLayout";
    return azala;

  });
