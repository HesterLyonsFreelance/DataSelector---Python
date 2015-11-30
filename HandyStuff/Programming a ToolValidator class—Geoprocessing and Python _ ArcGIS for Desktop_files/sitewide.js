/*This is a common script for all our sites.
*/



$(document).ready(function () {
	commonJS.injectNavActiveClass();
});



(function () {

	window.commonJS = {
		
		// Inject active class to to nav link on the basis of site and path
		injectNavActiveClass: function (){
			var winloc = window.location
			// Doc site.
			if(winloc.host.indexOf("doc") >= 0){
				if(winloc.pathname.match( /(\/arcgis-online\/)/)){
					$("#nav-help").addClass("active");
				}
			}

			// Learn site.
			if(winloc.host.indexOf("learn") >= 0){
				if(winloc.pathname.match( /(\/support\/)/)){
					$("#nav-support").closest("li").addClass("is-active")
				}else if(winloc.pathname.match( /(\/gallery\/)/)){
					$("#nav-gallery").closest("li").addClass("is-active")
				}
			}
		}
	}
 
})()
;
