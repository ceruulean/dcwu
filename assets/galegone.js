"use strict"
var obj_GaleGoneWheel = document.getElementById("obj_GaleGoneWheel");
var NavToggle = document.getElementById("NavToggle");
var loadArt = document.getElementById("fountainG");
var docbody = document.body;
var Nav = document.getElementById("Nav");
var Content = document.getElementById("Content");
var doc_Wheel
var svg_Wheel
var svg_Tips
var svg_Wheel_Border
var svg_Lens

var Wheel_cx //center coordinates of the wheel itself, not screen
var Wheel_cy 
var Wheel_cposx
var Wheel_cposy
var cursorx
var cursory
var quad

var NavigationLinks = [];

var bHasTouch
var bShowWheel = true;

var event_WheelTurn = function(e){WheelTurn(e);};

/*___________________________________________________________________________________________________

				Initialization (onload)
______________________________________________________________________________________________________*/

/*___________________________Main INIT________________________________________________________________________ */

window.onload = function(){
MainInit();

};

function MainInit(){

/*	Nav.setAttribute("class", "NavToggleShow");
	obj_GaleGoneWheel = document.getElementById("obj_GaleGoneWheel");
	NavToggle = document.getElementById("NavToggle");
	loadArt = document.getElementById("fountainG");
	docbody = document.body;
	Nav = document.getElementById("Nav");
	Content = document.getElementById("Content");
*/

svg_Wheel_Border = doc_Wheel.getElementById("svg_Wheel_Border");

// Detect if has touchscreen capabilities
		bHasTouch = (function(){
				return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
							}());

AddListenerToWindowToo(svg_Wheel, bHasTouch);
//RemoveEventListeners(svg_Wheel, bHasTouch)
NavToggle.addEventListener("click", NavButtonToggle);

}

//Light up the slice if on the corresponding /blahblah.html page
function indexpage() {
	var loc = window.location.href;
		var aa = window.location.pathname;
		if (aa == "/"){
				aa = "/index";
				loadContent(aa);
		}

var i = 0 // for some goddamn reason a 'for' loop with correct syntax doesn't work but a 'while' will
while (i < 8) {
		var myurl = NavigationLinks[i].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
		if (myurl == aa) {
			Activate(i);
			}
		i += 1;
}
		}

/*___________________________SVG Wheel INIT________________________________________________________________________ */

obj_GaleGoneWheel.onload = function(){
//alert("fk");

// Get SVG document from <object> for js manipulation
		try {
				doc_Wheel = obj_GaleGoneWheel.contentDocument;
		} catch(e) {
			try {
				doc_Wheel = obj_GaleGoneWheel.getSVGDocument();
			} catch (e) {
				obj_GaleGoneWheel.innerHTML = "SVG in object not supported in your environment";
				}
		}
			if (!doc_Wheel) {return;} //well this better not happen but it will be undefined if so

WheelInit();
SliceInit();

NavigationLinks = doc_Wheel.getElementsByTagName("a");

		$(function() {
			$.each(NavigationLinks, function(index, value){bindSliceClick(index, value);});
		});
		
indexpage();
}

function WheelInit(){ //Initialize svg elements in the Wheel to js variables
	svg_Wheel = doc_Wheel.getElementById("svg_Wheel");

		var bound = svg_Wheel.getBoundingClientRect();
	Wheel_cx = bound.x + bound.width / 2;
	Wheel_cy = bound.y + bound.height / 2;

Wheel_cposx = bound.left + Wheel_cx;
Wheel_cposy = bound.top + Wheel_cy;


svg_Tips = doc_Wheel.getElementById("svg_Tips");
svg_Lens = doc_Wheel.getElementById("svg_Lens");
}


function AddListenerToWindowToo(el, bTouch){
	if (bTouch === true){
		el.addEventListener("touchstart", function() {
			WheelRegister(el, bTouch);
			});
		window.addEventListener("touchend", (function() { // when finger lifted
			WheelRegister(el, bTouch); //wheel register is false (activates unregister function)
			}), false);
		el.addEventListener("touchend", (function() { // do this for the element itself since it covers the window and imbedes triggering
			WheelRegister(el, bTouch);
			}), false);
		return
	}

		el.addEventListener("mousedown", function() {
			WheelRegister(el, bTouch);
			});
};

window.onresize = function() {
	WheelInit(); // Recalculate the wheel's position when window resizes
}

window.onmousemove = function(){WheelTurn();};
var angle = 0;
var angle2 = 0;

function bindSliceClick(ind, el){	
			$(el).click(function(e) {
				$("#Content").show();

				var href = this.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
				loadContent(href);
				
				// HISTORY.PUSHSTATE
				history.pushState('', 'New URL: '+href, href);
				e.preventDefault();


			});
		$(el).bind('dragstart', function(){return false;}); // remove the goddamn dragging thing!!!11!!!!@!
		};

			// pop to detect back and forward buttons...
			window.onpopstate = function(event) {
				$("#Content").show();
				console.log("pathname: "+location.pathname);
				loadContent(location.pathname);
		alert("pop");
			};
 
/*
window.onpopstate = function(e)
{
    if(e.state)
{
        document.getElementById("Content").innerHTML = e.state.html;
        document.title = e.state.pageTitle;

    }
};*/
			

		function loadContent(url){
				if (url.indexOf(".") < 0) {  //"." doesn't exist
					url += ".html"; //attach .html
				}
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					
				//	alert(this.responseText);
				var stringhtml = this.responseText;
				stringhtml = stringhtml.slice(stringhtml.indexOf("<!--BeginContent-->"), stringhtml.indexOf("<!--EndContent-->")) //MUST HAVE THESE COMMENTS IN THE HTML TO FIND THE CONTENT!!!
				//alert(poop);
				loadArt.style = "display:none;";
				Content.style = "display:auto;";
				Content.innerHTML = stringhtml;
				} else{
					Content.style = "display:none;";
					loadArt.style = "display:block;";
				}
			};
				xhttp.open("GET", url, true);
				xhttp.send();
	//			sessionStorage.setItem("URL", url);

		}


/*________________________________Wheel Stuff___________________________________________________________________ */

var Slices = [];
var Slice_Masks = [];
var storedURL

function SliceInit(){ //Init slice array
for(var i=0; i<8; ++i){
	Slices.push(doc_Wheel.getElementById("Storm_Slice_"+i)); //Assuming a strict naming scheme, starting with 0
	Slice_Masks.push(doc_Wheel.getElementById("Slice_Mask_"+i));

// adding event listeners
Slices[i].addEventListener("mouseover", SliceMaskOver({maskSlice:Slice_Masks[i], ind:i}), false);
Slices[i].addEventListener("mouseout", SliceMaskOut({maskSlice:Slice_Masks[i], ind:i}), false);
Slices[i].addEventListener("click", SliceClick({ind:i}), false);
	}
	//	storedURL = sessionStorage.getItem("ActiveSlice"); // if page refreshed retrieve the highlighted option
	//	if (storedURL != "") { // if we even recorded it in the first place
	//	var sliceN = parseInt(storedURL, 10);
	//		Activate(sliceN);
	//		}
}

function SliceClick(event){
return function() {
	var x = event.ind;
Activate(x);
}}

function Activate(ind, noDeactivate = false) {
var myClass = Slices[ind].getAttributeNS(null, "class");
	for (var ii=0; ii<8; ++ii) {Slices[ii].setAttributeNS(null, "class", "");
		Slice_Masks[ii].style.fill = "#000";};

//		if (myClass != "active") {
	Slices[ind].setAttributeNS(null, "class", "active")
	Slice_Masks[ind].setAttributeNS(null, "id", "activeID");
	Slice_Masks[ind].style.fill = "#fff";
//	alert("active");
//		}
}

function SliceMaskOver(event){
var i = event.ind;

return function() {

if (Slices[i].getAttributeNS(null, "class") == "active"){
//alert(i);
return;
}

	event.maskSlice.style.fill = "#fff";
//maskSlice.setAttribute("fill", "#fff");
//alert(event.i);
	}
}

function SliceMaskOut(event){
var i = event.ind;

return function() {

if (Slices[i].getAttributeNS(null, "class") == "active"){
//alert(i);
return;
}

	event.maskSlice.style.fill = "#000";
	}
}

/* ________________ Interactions _______________________________*/

function NavButtonToggle(){
		ShowNavWheel(!bShowWheel);  // arguement is opposite of the current state of the toggle
		bShowWheel = !bShowWheel;
}

function ShowNavWheel(bShow = true){
	if (bShow){
	Nav.setAttribute("class", "NavToggleShow");
	setTimeout(function(){ 	document.getElementById("NavPupil").setAttribute("r", "30"); }, 700); // change the radius of the 'pupil' a little after

	} else {
	Nav.setAttribute("class", "NavToggleHide");
	setTimeout(function(){ 	document.getElementById("NavPupil").setAttribute("r", "10"); }, 700);
	}
}

/*________________________________Wheel Turning stuff___________________ */
var mult;

function WheelRegister(ele, bTouch){
	if (bShowWheel){ // only do anything if the wheel is showing
		docbody.className = "lock-screen";
	if (bTouch === true){
		ele.addEventListener("touchmove", event_WheelTurn); // detects touch drag movement....
		ele.addEventListener("touchend", (function() {WheelUnregister(ele, bTouch);}), false); // when the user lets go, run the unregister code
	return};
	ele.addEventListener("mousemove", event_WheelTurn); // detects mouse movement....
	ele.addEventListener("mouseup", (function() {WheelUnregister(ele, bTouch);}), false); // when the user lets go, run the unregister code
	}
}

function WheelUnregister(ele, bTouch) {
		docbody.className = "";
	if (bTouch === true) {
		ele.removeEventListener("touchmove", event_WheelTurn);
		return};
	ele.removeEventListener("mousemove", event_WheelTurn);
}

function WheelTurn(e){
	var eve
	if (bHasTouch === true){
		eve = e.touches[0]
	} else{
		eve = e
	}
	
	var deltax = eve.clientX - cursorx;
	var deltay = eve.clientY - cursory;

	cursorx = eve.clientX;
	cursory = eve.clientY;

	var dx = (cursorx - Wheel_cx);
	var dy = (cursory - Wheel_cy);
/*

 o is the Wheel's origin
 To determine how the mouse moves will spin the wheel
Wheel turns CW on mousemove

(0,0)
| ------------------------------------> +x
| 
|		Quad 2				|		Quad 1
|	cursorx < Wheel_cposx	|	cursorx > Wheel_cposx
|	cursory < Wheel_cposy	|	cursory < Wheel_cposy
|							|
|	----------------------- o ------------------------
|		Quad 3				|		Quad 4
|	cursorx < Wheel_cposx	|	cursorx > Wheel_cposx
|	cursory > Wheel_cposy	|	cursory > Wheel_cposy
|
|
V
+y

blah blah if mouse is moving +deltax and +deltay in quad 1, then wheel turns CW by default
but if -deltax or -deltay, then reverse direction (user is spinning CCW)
etc.
The rest of the function determines the direction of drag and turn the wheel accordingly
*/

if (cursorx > Wheel_cposx) {
	if (cursory < Wheel_cposy) {quad = 1;
	} else{
		quad = 4;
	}
} else if (cursorx < Wheel_cposx) {
	if (cursory < Wheel_cposy) {
		quad = 2;
	} else{
		quad = 3;
	}
}


	var absang = (Math.atan(Math.abs(dx) / Math.abs(dy)));
mult = SpinDir(quad, deltax, deltay);

	angle += absang * 0.07 * mult; //Controls the speed of rotation of the front dial
	angle2 += absang * 0.01 * mult; // Controls the background dial if a different speed is desired; negative is reverse and cool-looking but counterintuitive?
	if ((angle > 6.2832) || (angle < -6.2832)) {angle = 0};
	if ((angle2 > 6.2832) || (angle2 < -6.2832)) {angle2 = 0};
 svg_Wheel_Border.style.transform = "rotate("+angle+"rad)";
 svg_Tips.style.transform = "rotate("+angle2+"rad)";
		//e.preventDefault()
 }

 // To determine spin direction with a + or - number
			function SpinDir(qua, dxx, dyy){
				if (qua == 1) {
						if ((dxx < 0) || (dyy < 0)) {return -1;}
				} else if (qua == 2) {
						if ((dxx < 0) || (dyy > 0)) {return -1;}
				} else if (qua == 3) {
						if ((dxx > 0) || (dyy > 0)) {return -1;}
				} else {
						if ((dxx > 0) || (dyy < 0)) {return -1;}
				}
				return 1;}
				
/* Need to detect IE becuz it is a poop
https://stackoverflow.com/questions/21825157/internet-explorer-11-detection

function detectIE() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}
*/