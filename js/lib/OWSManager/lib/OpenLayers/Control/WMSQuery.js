/* Copyright (c) 2006-2007 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt 
 * for the full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Handler/Box.js
 *
 * Class: OpenLayers.Control.WMSQuery
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

 /*
  * Modificado por jmostazo UPM
  */
OpenLayers.Control.WMSQuery = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {OpenLayers.Control.TYPE}
     */
    type: OpenLayers.Control.TYPE_TOOL,

    /**
     * Property: message
     * {String} the output message for query
     */

    message: '',
    /**
     * Property: requested
     * 
     * {Int} number of appended messages
     */

    requested : 0,
    /**
     * Property: numLayers
     * 
     * {Int} number of layers queryed
     */

    numLayers:0,
    /**
     * Method: draw
     */

    initialize: function(mapManager, wmsManager, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.wmsManager = wmsManager;
        this.mapManager = mapManager;
        this.gadget = this.mapManager.getGadget();

        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick.bind(this)
        }, this.handlerOptions);
    },

    onClick: function(e) {
        this.WMSQuery(e.xy);
    },

/*    draw: function() {
        this.handler = new OpenLayers.Handler.Box(this, {done: this.WMSQuery}, {keyMask: this.keyMask});
    },*/

    /**
     * Method: WMSQuery
     *
     * Parameters:
     * position - {<OpenLayers.Bounds>} or {<OpenLayers.Pixel>}
     */
    WMSQuery: function(position) {

        // TODO Poner GIF
        this.requested = 0;
        var numLayers = 0;
        for(var i=0; i< this.map.layers.length; i++){
            var layer = this.map.layers[i];

            if (!layer.url)
                continue;

            var serviceInfo = this.wmsManager.getService(layer.url);

            if (!serviceInfo)
                continue;

            var layerInfo = serviceInfo.getLayer(layer.name);

            if(layer.visibility && layerInfo.isQueryable()){
                numLayers++;

                var context = {
                    "service" : serviceInfo.getName(),
                    "layer"   : layerInfo.getTitle(),
                    "position": position,
                    "self"    : this
                };

                var url =  layer.getFullRequestString({
                    REQUEST: "GetFeatureInfo",
                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                    BBOX: layer.map.getExtent().toBBOX(),
                    SRS: layer.map.getProjection(),
                    X: position.x,
                    Y: position.y,
                    INFO_FORMAT: serviceInfo.getFeatureInfoFormat(),
                    LAYERS: layerInfo.getName(),
                    QUERY_LAYERS: layerInfo.getName(),
                    FEATURE_COUNT: 10,
                    WIDTH: layer.map.size.w,
                    HEIGHT: layer.map.size.h,
                    VERSION: serviceInfo.getVersion()
                });

                MashupPlatform.http.makeRequest(url, {
                    method: 'GET',
                    onSuccess: function(transport) {
                        var text = transport.responseText;
                        this.self.requested++;
                        this.self.setOutput(this, text);
                    }.bind(context)
                    //TODO On Failure
                });
            }
        }

        if(!numLayers){
            this.requested = 1;
            alert(_('No queryable layers found'));
        }
    },

    /** 
     * @private 
     *
     * @param {String} string to print on target
     */
    setOutput: function(feature, text){
        delete feature.self;
        feature.text = text;
        this.gadget.sendFeatureInfo(feature);
    },

    CLASS_NAME: "OpenLayers.Control.WMSQuery"

});
