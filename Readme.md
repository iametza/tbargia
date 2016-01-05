## Martxan Jartzen ##

Bezero atala eta VirtualHub martxan jartzea aukerazkoa da, izan ere, android sistema erabiltzen  ez bada ez du erabilgarritasun haundirik.
Hortaz, argiaPlataforma atalean zentratuko gara. Hau martxan jartzeko, hainbat gauza instalatu beharko ditugu:

* Nodejs
* mongodb
* npm

Behin, dependetzia hauek instalatu ditugula, argiaPlataforma karpetara joan beharko degu eta bertan honako hau exekutatu:

```bash
npm install
mkdir log
```
Dena ondo joan ezkero, zerbitzaria martxan jartzea besterik ez genuke izango, horretarako [server](https://gitlab.com/itamayo/ARGIATB/tree/master/mediascape_polyer-1.0) karpetara joan eta ondorengo hau exekutatu:

```bash
sudo node index.js
```
Web aplikazioa http://localhost/index.html topatu hala izango da.

## WebComponenteak garatzeko orduan ##

Bileran aipatutatko Media-queriak egiteaz gain, component-query funtzionalitatea behavior bezela gehitu beharko da, horretarako
besterik gabe, behaviors objetuaren barruan sartu 'ComponentQueryBehavior'. Adb:

```javascript
Polymer({
	is:'x-media',
  behaviors:[ComponentQueryBehavior],
	hostAttributes:{
		skew:0.0,
		sm:null,
		l:''
	},
	properties:{
		file:{
			 type:String,

		},
			ismuted:{
				type:String,
				value:'false'
			}
	},
  ...
```
Plataformak, media-queryen sistemaz gain, ebentuak bidaltzen ditu konponentearen tamaina aldatzen den bakoitzeko, hortaz, programazio sakonago behar duen garapen bat egin behar badezue 'component-query' ebentua besterik ez dezute:

```javascript
	this.addEventListener('component-query',function(e){
     // konponenteak zer egin tamaina aldatzen denenan
  });

```
Media-queriak eskuz parseatu behar izan ditugula eta media attributoa interpretatzeko mugatua dago. Oraingoz honako queryak
erabili daitezke:

```css

@media (max-width:340px) {}
@media (min-width:341px) and (max-width:450px) {}
@media (min-width:801px) {}
@media (min-width:1000px) and (min-aspect-ratio:9/1){}

/*
aspect-ratioaren balio posibleak:
var verticalOptions = [1/2,1/3,1/4,1/8,1/10,1/11,1/12,1/13,1/14]
var horizontalOptions = [2/1,3/1,4/1,8/1,9/1,10/1,11/1,12/1,13/1,14/1];
var fullOptions = [13/9,12/8,12/6,12/7,10/7,9/7,8/9,7/9];
*/

```
## WebComponenteak Plataforman gehitzeko ##

Lehenik eta behin /www/index.html fitxategian erabili beharreko webcomponenteak inportatu:

```html
<link rel="import" href="../resources/wcs/audio-video-sm/video-audio.html">
```
Ondoren body-an webkonponenteak txertatu:

```html
  <x-media  id="video1" file="../resources/media/ETB2_new.mp4"  ismuted="true"></x-media>
```
Hurrengo pausua, webcomponentearen portaera definitu beharko da, horretarako www/resouces/components.layout-era joan eta bertan webkoponente bakoitzaren id-arekin selektore bezela erabiliz, ondorengo propietateak zehaztu beharko dira konponente bakoitzeko:

```css
#video1{
  needs:none; /*Beharrik duen, adb gps */
  order:1;   /*prioritatea zehazteko*/
  rwidth:900px; /* gomendatutako zabalera*/
  propx:16;     /* proportzio horizontalen */
  propy:9;      /* proportzio bertikalen */
  required:true;  /*Beti erakutsi behar den*/
  duplicable:true;  /*Pare dispositibotan egon leiken*/
  bestfit:biggestScreenSize; /*egokiena:biggestScreenSize,smallestSCreenSize,touchable*/
  movable:false; /* konponentea gailu ezberdineta mugitu leiken*/
}
```
Honekin behin bukatatuta, ze motako layouta erabiliko degun zehaztu beharko da. Oraingoz, plataformak layout jakin bat erabiltzeko aukera ematen du edota sistema adaptatua deitzen dioguan, sistema erabakitzen du zein den layout egokiena kontextuan oinarritua.

Hau aldatzeko, index.html-a aldatu behar da:

```javascript
/*
* STATIC MODUAN ZE LAYOUT ERABILI  ZEHAZTU AHALKO DA
*/

UI.init(data.detail.components,UI.LAYOUTMODE.STATIC);
UI.useLayout('accordion');

/* Plataformaren layoutak
-accordion
-menu
-verticalMenu
-grid
-spinner
-pip
-slider
-customGrid (Webcomponenteak testeatzeko)

*/

```

**OHARRA:Oraingoz polymer1.0-n pip eta accordion testatu ditugu**

Dinamikoa izatea nahi izan ezkero, besterik gabe:

```javascript
UI.init(data.detail.components,UI.LAYOUTMODE.ADAPTABLE);
        // ez da behar UI.useLayout('accordion');
```
Hori izango zan dana. Martxan jarri ezkero funtzionatu beharko luke.

## Layout berri bat egin nahi izan ezkero ##

Gehitu fitxategi berri bat www/js/mediascape/AdaptationToolkit/adaptation/UIAdaptation/layouts -en, adibidez carrusel.js

```javascript

define(["AdaptationToolkit/adaptation/UIAdaptation/layoutConstructor"],
  function(LayoutConstructor){

    var vertical = new LayoutConstructor('carrusel');
    vertical.onComponentsChange = function (cmps){
    }
    vertical.render = function (cmps){

    }
    vertical.onOrientationChange = function (cmps){

    }
    vertical.onLayoutChangeEvent = function (cmps){

    }
    vertical.onResizeEvent=function(cmps){
    }
    vertical.onActivity=function(cmps){
    }

    vertical.__moduleName = "verticalLayout";
    return vertical;

  });

  ```

## Arazo ezagunak ##

Orain artean, egindako esfortzu nagusia Chromen ondo joaterena izan da. Hortaz, oraingoz Chrome erabiltzen gomendatzen da. Orohar, polyfilla-k erabiliz, firefox bezelako nabigatzaileetan funtzionatzen du baina oraingoz erredimendua baxua dute.

Adibide honetan erabiitako CSS propietate batzuk W3C borradore bezela daude, hortaz experimentalak dira eta ez daude defektuz aktibaturik. Aktibatu ahal izateko, chrome://flags -era joan eta bertan "Enable experimental Web Platform features" flag aktibatu beharko da.

Askotan gertatu izan zaigun akatsa, mongodb martxan ez izatearena izan da, zerbitzaria ez bada martxan jartzen, ziurtatu mongodb martxan dagoela.

## Lizentzia ##
TBArgia software librea da. Iturburu-kodeak [GNU General Public License v3](http://www.gnu.org/licenses/gpl.html) lizentzia dauka.

[Mediascape](https://github.com/mediascape) proiektuak [Apache 2.0 lizentzia](http://www.apache.org/licenses/LICENSE-2.0).  dauka


