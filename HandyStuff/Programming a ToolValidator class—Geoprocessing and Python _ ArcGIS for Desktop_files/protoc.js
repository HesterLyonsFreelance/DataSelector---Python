;$(function(){
	
	function dbg (o) {
		console.info (o);
	}	

	function toKey (pubId, tpcId) {
		return pubId+"_"+tpcId;
	}
	
	if (!String.prototype.format) {
	    String.prototype.format = function() {
	    var args = arguments;
	        return this.replace(/{(\d+)}/g, function(match, number){
	                    return typeof args[number] != 'undefined' ? args[number] : match;
	                });
	    };
	}

	//http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
	if (!String.prototype.htmlEscape) {
		//http://underscorejs.org/docs/underscore.html
		var entityMap = {
		    '&': '&amp;',
		    '<': '&lt;',
		    '>': '&gt;',
		    '"': '&quot;',
		    "'": '&#x27;',
		    '`': '&#x60;'
		};

		String.prototype.htmlEscape = function () {
			return String(this).replace(/[&<>"']/g, function (s) {
			        return entityMap[s];
			    });
		}
	}

	//http://css-tricks.com/snippets/javascript/async-script-loader-with-callback/
	var Loader = function () { }

	Loader.prototype = {
	    require: function (scripts, callback) {
	        this.loadCount      = 0;
	        this.totalRequired  = scripts.length;
	        this.callback       = callback;

	        for (var i = 0; i < scripts.length; i++) {
	            this.writeScript(scripts[i]);
	        }
	    },
	    loaded: function (evt) {
	        this.loadCount++;

	        if (this.loadCount == this.totalRequired && typeof this.callback == 'function') this.callback.call();
	    },
	    writeScript: function (src) {
	    	var self = this;
	   		$.getScript (src).done (function (e) { self.loaded(e); });
	    }
	}

	function findUrl (cid) {
		var tree = window.treedata,
			node = (typeof cid === "string") ? tree.data[cid] : cid;

	 	if (attUrl in node) {
	 		return node[attUrl];
	 	} else if (attChildren in node) {
	 		return findUrl (node[attChildren][0]);
	 	}

	 	return ""
	}

	function findLinkUrl (cid) {
		var tree = window.treedata,
			node = (typeof cid === "string") ? tree.data[cid] : cid;

	 	if (attLinkurl in node) {
	 		var val =  node[attLinkurl],
	 			fL = val.split ("/");
	 		fL.pop();
	 		return fL.join ("/") + "/index.html";

	 	} else if (attChildren in node) {
	 		return findLinkUrl (node[attChildren][0]);
	 	}

	 	return ""

	}

	var attParent = "parent",
		attLabel = "label",
		attChildren = "children",
		attLinkuri = "linkuri",
		attLinkurl = "linkurl",
		attUrl = "url",
		attGraft = "graft";

	var Navi = (function (undefined) {


		function isRoot (k) {
			return k === "root";
		}

		function isChildRootKey (k) {
			return k.substring (0, 5) === "root_";
		}

		function toAliasKey (k) {
			return "rootalias_"+k.substring(5);
		}

		function isGraft (nd) {
			return nd[attGraft];
		}

		function isTHead (nd) {
			return nd[attUrl] === undefined;

		}

		function isLinkNode (nd) {
			return nd[attLinkuri] !== undefined;
		}

		function getLinkNode (tm, link) {
			return tm["root_"+link]
		}

		function getChildren (tm, nd) {
			var cL = nd[attChildren];
			return  (cL!==undefined) ? cL : tm["root_"+nd[attLinkuri]][attChildren];
		}

		function PathO (tree, pubId, tpcId, pathL) {
			this.m = tree;
			this.pubId = pubId;
			this.tpcId = tpcId;
			this.path = pathL;
		}

		function traverse (self, cL, f) {
			var i=0,
				cnd = null;

			if (cL.length>0) {
				for (i=0; i<cL.length; i++) {
					var ckey = cL[i];
					if (typeof ckey === "string") {
						cnd = self.m[ckey];
						f(self, cnd);
					} else {
						f(self, ckey);
					}
				}
			}
		}


		PathO.prototype.getTocNode = function (homepageFlg) {
			if (homepageFlg) {
				return this.path[0];
			} else if (this.path.length === 0) {
				return this.m["root_" + this.pubId];
			} else if (this.path.length === 1) {
				return this.path[0];
			} else  {
				return this.path[1];
			} 
		}

		PathO.prototype.getRootNode =function (pubId) {
			return this.m["root_" + pubId];
		}


		PathO.prototype.isMember = function (nd) {
			for (i=0; i<this.path.length; i++) {
				if (this.path[i] === nd) {
					return true;
				}
			}
			return false;
		}

		PathO.prototype.loop = function (trailF) {
			var i = this.path.length-2,
				cnd = null;

			while (i>=0) {
				cnd = this.path[i];
				if (isLinkNode (cnd)) {
					trailF.linkCrumb (cnd);
				} else {
					trailF.crumb (cnd);
				}
				i--;
			}

		}


		PathO.prototype.tft = function (nd, domF) {


			traverse (this, getChildren (this.m, nd), 
				function (self, cnd) {
					if (isGraft (cnd)) {
						domF.graft (cnd);
					} else if (isTHead (cnd)) {
						if (isLinkNode(cnd)) {						
							var link = cnd[attLinkuri];
							if (link === self.pubId) {
								var mynode = getLinkNode (self.m, link);
								
								mynode[attLabel] = cnd[attLabel];
								mynode[attParent] = cnd[attParent];

								domF.begFolder (mynode, true);
								
								traverse (self, getChildren(self.m, cnd), 
									function (self, ccnd) {
										if (isTHead(ccnd)) {
											domF.folderLink (ccnd);
										} else {
											domF.topicLink (ccnd, ccnd === self.m [toKey (self.pubId, self.tpcId)]);
										}
									
									});
								
								domF.endFolder (mynode);
							} else {
								domF.remoteFolder (cnd);
							}

						} else {
							domF.begFolder (cnd, self.isMember (cnd));
							
							traverse (self, getChildren(self.m, cnd), 
								function (self, ccnd) {
									if (isGraft (ccnd)) {
										domF.graft (ccnd);
									}
									else if (isTHead(ccnd)) {
										if (isLinkNode (ccnd)) {
											domF.remoteFolderLink (ccnd);
										} else {
											if (ccnd[attChildren].length>0) {
												domF.folderLink (ccnd);
											}
										}
									} else {
										domF.topicLink (ccnd, ccnd === self.m [toKey (self.pubId, self.tpcId)]);
									}
								
								});
							
							domF.endFolder (cnd);
						}
					} else {
						domF.topicLink (cnd, cnd === self.m [toKey (self.pubId, self.tpcId)]);
					}						
				});

		}


		var NaviO = function (tdata) {
			this.m = tdata.data;
		};

		NaviO.prototype.genToc = function (path, domF, homepageFlg) {
			var nd = path.getTocNode (homepageFlg);
			path.tft (nd, domF);
		}

		NaviO.prototype.genTrail = function (path, trailF) {
			path.loop (trailF);
		}

		NaviO.prototype.getPubPath = function (pubId) {
			var r = [],
				k = toAliasKey ("root_"+pubId),
				nd = this.m[k],
				pk = nd && nd[attParent];

			r.push (nd);
			if (nd !== undefined) {
				while (pk) {
					if (isRoot (pk)) {
						//break; 						
					}
					if (isChildRootKey (pk)) {
						pk = toAliasKey (pk);
					}
					r.push (this.m[pk]);
					pk = this.m[pk][attParent];
				}
			}


			return new PathO (this.m, pubId, "", r);

		}

		NaviO.prototype.getPath  = function (pubId, tpcId) {
			var r = [],
				k = toKey (pubId, tpcId),
				nd = this.m[k],
				pk = nd && nd[attParent];

			if (nd !== undefined) {
				while (pk) {
					if (isRoot (pk)) {
						//break; 						
					}
					if (isChildRootKey (pk)) {
						pk = toAliasKey (pk);
					}
					r.push (this.m[pk]);
					pk = this.m[pk][attParent];
				}
			}


			return new PathO (this.m, pubId, tpcId, r);
		}

		NaviO.prototype.genSubTree = function (path, subTreeFun, uri) {

			var nd = path.getRootNode (uri);

			traverse (this, getChildren(this.m, nd), 
				function (self, ccnd) {
					if (isTHead(ccnd)) {
						subTreeFun.folderLink (ccnd);
					} else {
						subTreeFun.topicLink (ccnd, ccnd === self.m [toKey (self.pubId, self.tpcId)]);
					}
				
				});

			return subTreeFun.tocStr();
		}

		return NaviO;
	})();

	var tocFunc = function (tree) {
		return {

			buf : ['<nav class="accordion">'],

			reset: function () {
				this.buf = [];
			},

			begFolder: function (nd, isActive) {
				var txt = '<section class="accordion-section {2}" data-collapsed="{0}"><header><h4 class="section-title">{1}</h4></header><ul>'.format(
					isActive?"false":"true", nd[attLabel].htmlEscape(), isActive?"current active":"");
				this.buf.push (txt);
			},

			endFolder: function (nd) {
				var txt = '</ul></section>';
				this.buf.push (txt);
			},

			remoteFolder: function (nd) {
				var txt = ('<section class="accordion-section" data-collapsed="{0}" data-uri="{2}" data-url="{3}">'+
						  '<header><h4 class="section-title">{1}</h4></header><ul></ul></section>')
						.format("true", nd[attLabel].htmlEscape(), nd[attLinkuri], nd[attLinkurl]);
				this.buf.push (txt);

			},

			remoteFolderLink: function (nd) {
				var curl = nd[attLinkurl].split ("/").slice (0, -1).join ("/"),
					txt = ('<li class="sectionlink" data-collapsed="true"><a href="{0}">{1}</a></li>').format(curl, nd[attLabel].htmlEscape());				

				this.buf.push (txt);

			},

			folderLink: function (nd) {
				var cId = nd[attChildren][0],
					curl = findUrl (cId),
					txt = "";

				if (curl === "") {
					curl = findLinkUrl (cId);
				}
				txt = ('<li class="sectionlink" data-collapsed="true"><a href="{0}">{1}</a></li>').format(curl, nd[attLabel].htmlEscape());				
					
				this.buf.push (txt);

			},


			graft: function (nd) {
				var txt = ('<div data-graft="{0}" data-uri="{2}" data-url="{3}">{1}</div>')
						.format("true", "loading...", nd[attLinkuri], nd[attLinkurl]);
				this.buf.push (txt);
			},

			topicLink: function (nd, isActive) {
				if (nd.homepage) {
					//tchen: if a topic is outside a folder, do not show it	
				} else {
					var txt = '<li class="{2}"><a href="{0}">{1}</a></li>'.format (
						nd[attUrl], nd[attLabel].htmlEscape(), isActive?"topiclink current" : "topiclink");
					this.buf.push (txt);					
				}
			},

			tocStr: function() {
				this.buf.push ("</nav>")
				return this.buf.join ("\n"); 
			}
		};
	};

	var subTreeFunc = function (tree) {
		return {

			buf : [],

			findUrl: function (cId) {
				var url = tree.data[cId][attUrl]; 
				if (typeof (url) === 'undefined') {
					var children = tree.data[cId][attChildren];
					if (typeof (children) === 'undefined') {
						return "#"
					} else {
						return this.findUrl (children[0]);
					}
				} else {
					return url;
				}				

			},

			folderLink: function (nd) {
				var cId = nd[attChildren][0],
					curl = this.findUrl (cId),
					txt = ('<li class="sectionlink" data-collapsed="true"><a href="{0}">{1}</a></li>').format(curl, nd[attLabel].htmlEscape());

				this.buf.push (txt);

			},

			topicLink: function (nd, isActive) {
				var txt = '<li class="{2}"><a href="{0}">{1}</a></li>'.format (
					nd[attUrl], nd[attLabel].htmlEscape(), isActive?"topiclink current" : "topiclink");
				this.buf.push (txt);
			},

			tocStr: function() {
				return this.buf.join ("\n"); 
			}
		};
	};


	var trailFunc = function (tree, undefined) {

		function genUrl (nd) {
			if  (nd[attLinkuri] !== undefined) {
				return nd[attLinkurl].split ("/").slice (0, -1).join ("/");
 			} else if (nd[attUrl] !== undefined) {
 				return nd[attUrl];
 			} else {
 				var cId = nd[attChildren][0];
 				return findUrl (cId);
 			}				
		}

		return {
			buf: [],


			linkCrumb: function (nd) {
				var curl = genUrl (nd),
					txt = ('<li>' +
						  '<a href="{0}/index.html">{1}</a>' +
						   '</li>').format(curl, nd[attLabel].htmlEscape());
				this.buf.push (txt);
			},

			crumb: function (nd) {
				var cId = nd[attChildren][0],
					curl = genUrl ((typeof cId === "string") ? tree.data[cId] : cId),
					txt = ('<li>' +
						  '<a href="{0}">{1}</a>' +
						   '</li>').format(curl, nd[attLabel].htmlEscape());
				this.buf.push(txt);
			},

			isEmpty: function() {
				return this.buf.length<=0;
			},

			isStandalone: function () {
				var b0 = window.treedata.data["root_" + window.doctoc.pubID] === window.treedata.data["root"];
				var b1 = false; //a root pub

				if (b0) {
					for (var k in window.treedata.data) {
						if (k.indexOf ("rootalias_") >=0) {
							b1 = true;
							break;
						}
					}					
				}

				return b0 && !b1
			},

			trailStr: function () {
			    var nd = window.treedata.data[toKey(window.doctoc.pubID, window.doctoc.tpcID)];
			    if (typeof nd != 'undefined' && nd.homepage) {
			    	//this is the case where homepage is nested in topichead, and it is the only topic in the topichead
			    	//tchen: probably should be merge with the buf.length case
			        this.buf = [];
			    }

			    var s = this.buf.join('');
				var s0 = "";
				var bkToTop = (window.docConfig && window.localeJsonObj[docConfig['locale'].toLowerCase()]['back-to-top'])?window.localeJsonObj[docConfig['locale'].toLowerCase()]['back-to-top'] : "Back to Top";

				/*
					cases:
					1. homepage is outside topichead
					2. homepage is nested in a topichead
					3. there is no homepage

					also need to handle childpub/rootpub case (desktop/server)
					
					prefix value should only be applied to homepage
				*/
				if (window.doctoc["prefix"] && window.doctoc["prefixUrl"]) {
					if (this.isStandalone ()) {
						s0 = '<li><a href="{1}">{0}</a></li>'.format (window.doctoc["prefix"], window.doctoc["prefixUrl"]);

					} else {
						if (this.buf.length > 0 ) {
							s0 = "";
						} else {
							s0 = '<li><a href="{1}">{0}</a></li>'.format (window.doctoc["prefix"], window.doctoc["prefixUrl"]);
						}						
					}

				}
				return '<div class="container"><div class="column-24"><ul class="small breadcrumbs">' + s0 + s +
					'<a href="#" class="right icon-arrow-up back-to-top scroll-show">' + bkToTop + '</a></ul></div></div>' ;					
			}
		}
	};

	function assembleTree (dlL) {
		$.each (dlL, function (idx, val) {
			var tdata = window.treedata.data;
			var oldL = tdata[val.key][attChildren];
			var newL = []
			$.each (oldL, function (idx, v0) {
				if (typeof v0 !== "string") {
					vL = tdata["root_"+v0[attLinkuri]][attChildren];
					$.each (vL, function (i, v1) {
						newL.push (v1);
					})
				} else {
					newL.push (v0);
				}
			});
			tdata[val.key].children = newL;
		})
	}

	function buildTree () {
		var defer = $.Deferred();
		var tdata = window.treedata.data;
		var dlL = [];
		var urlL = [];
		for (k in tdata) {
			if (k.substring (0, 4) !== "root") {
				if (tdata[k][attChildren]) {
					$.each (tdata[k][attChildren], function (idx,val) {
						if (typeof val !== "string") {
							dlL.push ({key:k, val:val});
							urlL.push (val[attLinkurl]);
						}
					})
				}
			}
		}

		if (urlL.length>0) {
			var loader = new Loader ();
			loader.require (urlL, function () {
				assembleTree (dlL);
				defer.resolve ({done:1});

			})			
		} else {
				defer.resolve ({done:1});
		}
		return defer;
	}
	$.when (buildTree()).done (function (x) {
		
		function graft ($ele) {
			var uri = $ele.attr ("data-uri");
		
			var l = new Loader();
			l.require([$ele.attr("data-url")], 
			    function() {
					var subtreeFun = subTreeFunc(window.treedata);
					$ele.html (nav.genSubTree (p0, subtreeFun, uri));
			    });

		}

		var nav = new Navi (window.treedata);
		var p0 = nav.getPath(window.doctoc.pubID, window.doctoc.tpcID);

		if (window.doctoc.hideToc) {
			$("aside.reference-index").hide();
			$("section.reference-content").css ({"border-left": "0px solid #fff"});
		} else {
			var tocFun = tocFunc(window.treedata);
			var nd = window.treedata.data[toKey (window.doctoc.pubID, window.doctoc.tpcID)];
			if (typeof nd != 'undefined')  {
				nav.genToc (p0, tocFun, nd.homepage);
				$("aside.reference-index").html (tocFun.tocStr());				
			}
		}

		//this should happen before TOC is generated 
		$("div[data-graft]").each (function (idx) {
			var $ele = $(this);
			graft ($ele);
		});

		var trailFun = trailFunc (window.treedata);
		nav.genTrail (p0, trailFun);
		if (trailFun.isEmpty()) {
			var altp = nav.getPubPath (window.doctoc.pubID);
			nav.genTrail (altp, trailFun);
		} 	
		$("#bigmac").html (trailFun.trailStr());
		var nd = window.treedata.data[toKey (window.doctoc.pubID, window.doctoc.tpcID)];
		
		$("[data-collapsed='false'] ul").css("display", "block");
		$("[data-collapsed='true'] ul").css("display", "none");

		$("section[data-collapsed] header").on("click", function(e){
		    var outer = $(this).parent(),
		        list = outer.children("ul"),
		        collapsed = outer.attr("data-collapsed");

		    $("[data-collapsed='false']").each (function (i, ele) {
		      //.css("display", "none");
		      var $ele = $(ele),
		          $list = $ele.children ("ul");

		          $list.slideUp();
		          $ele.attr("data-collapsed", "true");
		          $ele.removeClass ("current active")
		    }); 

		    if(collapsed === "true"){
		    	var uri = outer.attr("data-uri");
		    	var tree = window.treedata;

		    	if (uri) {
					var l = new Loader();
					l.require([outer.attr("data-url")], 
					    function() {
							var $list = $(list); 
							var subtreeFun = subTreeFunc(window.treedata);
							list.html (nav.genSubTree (p0, subtreeFun, uri));								
							list.slideDown();
						    outer.removeAttr("data-url");
						    outer.removeAttr("data-uri");
						    outer.attr("data-collapsed", "false");	
						    outer.addClass ("current active");    		
					    });

		    	} else {
			      list.slideDown();
			      outer.attr("data-collapsed", "false");	    		
				  outer.addClass ("current active");    		
		    	}
		    } else {
		      list.slideUp();
		      outer.attr("data-collapsed", "true");
			  outer.removeClass ("current active");    		
		    }
		});


	});
	
});
