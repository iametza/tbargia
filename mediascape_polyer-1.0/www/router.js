define (["page"],
    function (page) {

    var router = function(){
    this.init = function(){
        
            page('/', function () {
            app.route = 'azala';
            });
                        
            page('/fitxa/:nice_name', function (data) {
            app.route = 'fitxa';
            app.params = data.params;
            });
            
            page('/karrusela', function () {
            app.route = 'karrusela';
            });
            
            page('/:mota_nice_name', function (data) {
            app.route = 'mota';
            app.params = data.params;
            }); 
            
            page('/:mota_nice_name/:nice_name', function (data) {
            app.route = 'fitxa';
            app.params = data.params;
            }); 
            
            // add #! before urls
            page({
            hashbang: true
            });
          
     }
     
     
     return this;
    }
    document.addEventListener('mediascape-modules-ready',function(){
    });
    router.__moduleName = "router";
    return router;

});



