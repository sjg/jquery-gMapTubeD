/**
 * jQuery Google Maps MapTubeD Loader
 *
 * @url		http://www.stevenjamegray.com
 * @author	Steven James Gray <steven.gray@ucl.ac.uk>
 * @version	1.0.0
 */

var defaultTileServer = 'http://128.40.111.243/TileRequestHandler.ashx'; 

(function(jQuery)
{
	// Main plugin function
	jQuery.fn.openLayersMapTubeD = function(options)
	{
		// Build main options before element iteration
		var opts = jQuery.extend({}, jQuery.fn.openLayersMapTubeD.defaults, options);
    	
		// Iterate through each element
		return this.each(function()
		{
			
			//Setup map in the Div
			var map = new OpenLayers.Map(this.id);
        	var mapnik = new OpenLayers.Layer.OSM();
       		map.addLayer(mapnik);
        	map.setCenter(new OpenLayers.LonLat(opts.longitude, opts.latitude)
          			.transform(
            					new OpenLayers.Projection("EPSG:4326"), 
            					new OpenLayers.Projection("EPSG:900913") 
          					   ), opts.zoom 
       		);
			
			if(opts.address != ''){
				// Geolocate the Address - ToDo		
			}
						
			//Add the all important MapTube layer
			if(opts.descriptor != ''){
				if(jQuery.isArray(opts.descriptor) && opts.descriptor.length > 0){
					jQuery.each(opts.descriptor, function(i, val) {
  						//Loop around the Layers
  										
					});
				}else{
					//Single Layer
					
				}
			}
		});
		
	}
		
	// Default settings
	jQuery.fn.openLayersMapTubeD.defaults =
	{
		address:				'',
		latitude:				40.0,
		longitude:				0,
		zoom:					3,
		descriptor: 			'',
		tileServer:				defaultTileServer,
	}
	
})(jQuery);


function overlay_getTileURL(bounds) 
{
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((bounds.bottom - this.maxExtent.bottom) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	if (x >= 0 && y >= 0) {
		return this.options.url + z + "/" + x + "/" + y + "." + this.type;				
	} else {
		return "404.png";
	}
}
