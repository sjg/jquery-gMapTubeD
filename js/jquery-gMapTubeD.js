/**
 * jQuery Google Maps MapTubeD Loader
 *
 * @url		http://www.stevenjamesgray.com
 * @author	Steven James Gray <steven.james.gray@gmail.com>
 * @version	1.1.1
 */

var tileServerObject;
var map_array = new Array();

(function(jQuery)
{
	// Main plugin function
	jQuery.fn.gMapTubeD = function(options)
	{
		// Build main options before element iteration
		var opts = jQuery.extend({}, jQuery.fn.gMapTubeD.defaults, options);
    	
		// Iterate through each element
		return this.each(function()
		{
		
			// Use Map Shortnames
			switch(opts.maptype.toLowerCase()){
				case 'road':
				case 'roadmap':
					type = google.maps.MapTypeId.ROADMAP;
					break; 
				case 'hybrid':
					type = google.maps.MapTypeId.HYBRID;
					break;
				case 'sat':
				case 'satellite':
					type = google.maps.MapTypeId.SATELLITE;
					break;
				case 'terrain':
					type = google.maps.MapTypeId.TERRAIN;
					break; 
				default:
					type = google.maps.MapTypeId.ROADMAP;
					break; 
			}
				
			//Set map options		
			var myOptions = {
      				zoom: opts.zoom,
      				center: new google.maps.LatLng(opts.latitude,opts.longitude),
      				mapTypeId: type,
   				mapTypeControl: true,
				streetViewControl: false,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
					position: google.maps.ControlPosition.BOTTOM_CENTER
				}			
			};		
	
			// Create default map and set initial options
			var gmap = new google.maps.Map(this, myOptions);
            
            map_array.push(gmap); 
			 
			// Geocode Address for Simple Positioning
			var geocoder = new google.maps.Geocoder();
			
			if(opts.address != ''){
				geocoder.geocode( { 'address': opts.address}, function(results, status) {
      				if (status == google.maps.GeocoderStatus.OK) {
        				gmap.setCenter(results[0].geometry.location);
      				} else {
        				alert("Ooops, Geocode was not successful for the following reason: " + status);
      				}
    			});
			}
            
            //Choose sort method of Array
            if(opts.descriptor_reverse){
                if(jQuery.isArray(opts.descriptor) && opts.descriptor.length > 0){
                    opts.descriptor.reverse();
                }
            }
            
            //Set object reference for tileServers for different types of layers
            if(opts.tileServer != ''){
                tileServerObject = opts.tileServer;
            }
			
			//Add the all important MapTube layer
			if(opts.descriptor != ''){
                    addLayerArray(gmap, opts.descriptor);
            }
        
			//Set style if it is set
			if(opts.setStyle != ''){
				if(jQuery.isPlainObject(opts.setStyle)){
					var styledMapOptions = {
      											map:  gmap,
      											name: opts.setStyle.id
    							    		};
    							    		
    				var gSMapType =  new google.maps.StyledMapType(opts.setStyle.style,styledMapOptions);
    				gmap.mapTypes.set(opts.setStyle.id, gSMapType);
    				
    				gmap.setOptions({
                	    		 mapTypeControlOptions: {
                	        	 		mapTypeIds: [
                	        	        	opts.setStyle.id,
      										google.maps.MapTypeId.ROADMAP,
      										google.maps.MapTypeId.TERRAIN,
      										google.maps.MapTypeId.SATELLITE,
      										google.maps.MapTypeId.HYBRID
    				   	  				], 
    				   	  		 		position: google.maps.ControlPosition.RIGHT_BOTTOM
  							 	} 
                	}); 
                	
    				gmap.setMapTypeId(opts.setStyle.id);
				}
			}			
		});
		
	}
		
	// Default settings
	jQuery.fn.gMapTubeD.defaults =
	{
		address:				'',
		latitude:				40.0,
		longitude:				0,
		zoom:					2,
		maptype:				'roadmap',	
		descriptor: 			'',
        descriptor_reverse:     false,
		tileServer:				{
                                    maptube: 'http://128.40.111.243/TileRequestHandler.ashx', 
                                    xyz: '', 
                                    qt: ''
                                },
		setStyle: 				[]
	}
	
})(jQuery);

// --- Helper Functions for Map Objects ------------------------------------------------------------
function setLayerOpacity(map, layerID, value){
    //Layer Opactities can either be from 0 - 100 or 0.0 - 1.0
    try{
        if(value > 1.1){
            // Change Opactity value from 0 - 100
            value = value / 100;
        }
    
        var layer = map.overlayMapTypes.getAt(layerID);
        layer.setOpacity(value);
        return true;
    }catch(err){
    	//console.log(err);
        return false;
    }
}

function removeLayer(map, layerID){
    //Removes one single layer from a map object
    try{
        map.overlayMapTypes.removeAt(layerID); 
        return true;
    }catch(err){
        //console.log(err);
        return false;
    }
}

function removeAllLayers(map){
    try{
        map.overlayMapTypes.clear();
        return true;
    }catch(err){
    	//console.log(err);
        return false;
    }
}

function addNewLayer(map,mapLayerObject, index){
    //Adds a Single Map Layer
    try{
        map.overlayMapTypes.insertAt(index, layer);
        return true;
    }catch(err){
    	//console.log(err); 
        return false;
    }
}

function addLayerArray(map, mapArray){
    try{
        if(jQuery.isArray(mapArray) && mapArray.length > 0){
            jQuery.each(mapArray, function(i, val) {
            	var layer;
                if (jQuery.isArray(val) && val.length > 0) {
                	// Old style array
                    if (val[2] == "mtd" || val[2] == "smr") {
                        layer = new MapTubeDMapType(val[1], tileServerObject.maptube);                        
                    } else if (val[2] == "xyz" || val[2] == "pc" || val[2] == "dcs" || val[2] == "dcm") {
                        layer = new XYZMapType(val[1], tileServerObject.xyz);
                    } else if (val[2] == "mo" || val[2] == "qt") {
                        layer = new QTMapType(val[1], tileServerObject.qt);
                    } else {
                        alert("This layer style is not recognised: " + val[2]);
                    }
                    
                    //Assume fourth element in array is layer opacity
            		if(val[3] != ""){ layer.setOpacity(val[3]); }else{ layer.setOpacity(1.0); }
            	
                } else if(typeof(val) == 'object'){
					//Object Defined
					if (val.type == "mtd" || val.type == "smr") {
                        layer = new MapTubeDMapType(val.layer, tileServerObject.maptube);                        
                    } else if (val.type == "xyz" || val.type == "pc" || val[1] == "dcs" || val[1] == "dcm") {
                        layer = new XYZMapType(val.layer, tileServerObject.xyz);
                    } else if (val.type == "mo" || val.type == "qt") {
                        layer = new QTMapType(val.layer, tileServerObject.qt);
                    } else {
                        alert("This layer style is not recognised: " + val.layer);
                    }
                    
                    //Assume third element in array is layer opacity
            		if(val.opacity != null){ layer.setOpacity(val.opacity); }else{ layer.setOpacity(1.0); }
				
				}else{
					// Single Layer - String Layer URL (Fall through)
                    layer = new MapTubeDMapType(val, tileServerObject.maptube);
                }
        
        		map.overlayMapTypes.insertAt(i, layer);
            });
        } else {
			//Single Layer defined as a string
            var layer = new MapTubeDMapType(mapArray, tileServerObject.maptube);
            map.overlayMapTypes.insertAt(0, layer);
        }
    
        return true;
    }catch(err){
    	//console.log(err); 
        return false;
    }
}

// ----- MapTube JS Library -------------------------------------------------------

function MapTubeDMapType(descrip) {
        this.Cache = Array();
        this.opacity = 100;
        this.descriptor = descrip;
        this.tileServer = tileServerObject.maptube;
}

function MapTubeDMapType(descrip, tileServer) {
        this.Cache = Array();
        this.opacity = 100;
        this.descriptor = descrip;
        this.tileServer = tileServer;
}
    
MapTubeDMapType.prototype.tileSize = new google.maps.Size(256, 256);
MapTubeDMapType.prototype.maxZoom = 19;
MapTubeDMapType.prototype.getTileUrl = function(tilename) {
  if (tilename != "blank-tile") return this.tileServer + "?u=" + this.descriptor + "&t=" + tilename + "";
}
MapTubeDMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  if (this.descriptor == "" && this.tileServer == "") {
    var div = ownerDocument.createElement('DIV');
    //div.innerHTML = coord;
    div.innerHTML = "NO DATA LOADED";
    div.style.width = this.tileSize.width + 'px';
    div.style.height = this.tileSize.height + 'px';
    div.style.fontSize = '20';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px';
    div.style.borderColor = '#AAAAAA';
    return div;
  } else {
    var isBlankTile = false;
    var f = "";
    if ((this.tileMaxZoom >= 0) && (zoom > this.tileMaxZoom)) {
      isBlankTile = true;
    } else {
      var c = Math.pow(2, zoom);
      var tilex = coord.x,
        tiley = coord.y;
      //allow wrapping
      //if (tilex < 0) tilex = c + tilex % c;
      //if (tilex >= c) tilex = tilex % c;
      //if (tiley < 0) tiley = c + tiley % c;
      //if (tiley >= c) tiley = tiley % c;
      //only allow wrapping in x direction
      if (tilex < 0) tilex = c + tilex % c;
      if (tilex >= c) tilex = tilex % c;
      if (tiley < 0) {
        isBlankTile = true;
      }
      if (tiley >= c) {
        isBlankTile = true;
      }

      //zoom>0 gets around nasty Google problem with bounds spanning the world being reversed
      if ((zoom > 0) && (this.bounds != null)) {
        var x = 360 / c * tilex - 180;
        var y = 180 - 360 / c * tiley;
        var x2 = x + 360 / c;
        var y2 = y - 360 / c;
        var lon = x; //Math.toRadians(x); //would be lon=x+lon0, but lon0=0 degrees
        var lat = (2.0 * Math.atan(Math.exp(y / 180 * Math.PI)) - Math.PI / 2.0) * 180 / Math.PI; //in degrees
        var lon2 = x2;
        var lat2 = (2.0 * Math.atan(Math.exp(y2 / 180 * Math.PI)) - Math.PI / 2.0) * 180 / Math.PI; //in degrees
        //NOTE: LatLngBounds(sw,ne) in V3 and V2
        var tileBounds = new google.maps.LatLngBounds(new google.maps.LatLng(lat2, lon), new google.maps.LatLng(lat, lon2));
        if (!tileBounds.intersects(this.bounds)) {
          isBlankTile = true;
        };
      }

      if (!isBlankTile) {
        var d = tilex;
        var e = tiley;
        f = "t";
        for (var g = 0; g < zoom; g++) {
          c /= 2;
          if (e < c) {
            if (d < c) {
              f += "q"
            } else {
              f += "r";
              d -= c
            }
          } else {
            if (d < c) {
              f += "t";
              e -= c
            } else {
              f += "s";
              d -= c;
              e -= c
            }
          }
        }
      } else {
        f = "blank-tile";
      }
    }
    var img = ownerDocument.createElement('IMG');
    img.id = "t_" + f;
    img.style.width = this.tileSize.width + 'px';
    img.style.height = this.tileSize.height + 'px';
    if ((!isBlankTile) && (this.tileMaxZoom >= 0) && (zoom > this.tileMaxZoom)) {
      //img.src = MLList.zoomPastWebService + "?z=" + this.tileMaxZoom + "&t=" + f + "&u=" + this.baseUrl;
    } else {
      img.src = this.getTileUrl(f);
    }
    //set initial opacity on image
    img.style.opacity = this.opacity; //mozilla
    img.style.filter = "alpha(opacity=" + this.opacity * 100 + ")"; //ie
    //this.cache.push(img);
    if (f != "blank-tile") {
      return img;
    }
  }
}
    MapTubeDMapType.prototype.releaseTile = function(tile) {
        tile = null;
    }
   
    MapTubeDMapType.prototype.setOpacity = function(newOpacity) {
        this.opacity = newOpacity;
        for (var i = 0; i < this.Cache.length; i++) {
            this.Cache[i].style.opacity = newOpacity; //mozilla
            this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
        }
    }

// XYZ-type maps, e.g. OpenStreetMap Feature Highlighter.
function XYZMapType(descrip) {
        this.Cache = Array();
        this.opacity = 100;
        this.descriptor = descrip;
        this.tileServer = tileServerObject.xyz;
}

    
XYZMapType.prototype.tileSize = new google.maps.Size(256, 256);
XYZMapType.prototype.maxZoom = 19;
XYZMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
   if (this.descriptor == "" && this.tileServer == "") {
            var div = ownerDocument.createElement('DIV');
            //div.innerHTML = coord;
            div.innerHTML = "NO DATA LOADED";
            div.style.width = this.tileSize.width + 'px';
            div.style.height = this.tileSize.height + 'px';
            div.style.fontSize = '20';
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '1px';
            div.style.borderColor = '#AAAAAA';
            return div;
        }
        else {
            var img = ownerDocument.createElement('IMG');

            //copied from customgettileurl
            var c = Math.pow(2, zoom);
            var f = zoom + "/" + coord.x + "/" + coord.y + ".png";
            img.id = "t_" + f;
            img.style.width = this.tileSize.width + 'px';
            img.style.height = this.tileSize.height + 'px';
            img.src = this.tileServer + f + "?" + this.descriptor;
            img.style.opacity = this.opacity;
            img.style.filter = "alpha(opacity=" + this.opacity * 100 + ")";
            
            this.Cache.push(img);
            return img;
        }
    }
    XYZMapType.prototype.releaseTile = function(tile) {
        tile = null;
    }
   
    XYZMapType.prototype.setOpacity = function(newOpacity) {
        this.opacity = newOpacity;
        for (var i = 0; i < this.Cache.length; i++) {
            this.Cache[i].style.opacity = newOpacity; //mozilla
            this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
        }
    }

// QT-type maps, e.g. OpenStreetMap Feature Highlighter.
function QTMapType(descrip) {
        this.Cache = Array();
        this.opacity = 100;
        this.descriptor = descrip;
        this.tileServer = tileServerObject.qt;
}

    
QTMapType.prototype.tileSize = new google.maps.Size(256, 256);
QTMapType.prototype.maxZoom = 19;
QTMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
   if (this.descriptor == "" && this.tileServer == "") {
            var div = ownerDocument.createElement('DIV');
            //div.innerHTML = coord;
            div.innerHTML = "NO DATA LOADED";
            div.style.width = this.tileSize.width + 'px';
            div.style.height = this.tileSize.height + 'px';
            div.style.fontSize = '20';
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '1px';
            div.style.borderColor = '#AAAAAA';
            return div;
        }
        else {
            var img = ownerDocument.createElement('IMG');

 	   		//copied from customgettileurl
            //converts tile x,y into keyhole string
            var c = Math.pow(2, zoom);
            var d = coord.x;
            var e = coord.y;
            var f = "t";
            for (var g = 0; g < zoom; g++) {
                c /= 2;
                if (e < c) {
                    if (d < c) { f += "q" }
                    else { f += "r"; d -= c }
                }
                else {
                    if (d < c) { f += "t"; e -= c }
                    else { f += "s"; d -= c; e -= c }
                }
            }
                     
            img.id = "t_" + f;
            img.style.width = this.tileSize.width + 'px';
            img.style.height = this.tileSize.height + 'px';
            img.src = this.descriptor.replace("{0}", f);
            img.style.opacity = this.opacity;
            img.style.filter = "alpha(opacity=" + this.opacity * 100 + ")";

            
            this.Cache.push(img);
            return img;
        }
    }
    QTMapType.prototype.releaseTile = function(tile) {
        tile = null;
    }
   
    QTMapType.prototype.setOpacity = function(newOpacity) {
        this.opacity = newOpacity;
        for (var i = 0; i < this.Cache.length; i++) {
            this.Cache[i].style.opacity = newOpacity; //mozilla
            this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
        }
    }
