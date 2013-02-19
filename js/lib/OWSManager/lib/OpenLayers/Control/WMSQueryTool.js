/* Copyright (c) 2006-2007 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt 
 * for the full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Handler/Box.js
 *
 * Class: OpenLayers.Control.WMSQueryTool
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.WMSQueryTool = OpenLayers.Class(OpenLayers.Control, {
    /**
     * Property: type
     * {OpenLayers.Control.TYPE}
     */
    type: OpenLayers.Control.TYPE_TOOL,

    /**
     * Method: draw
     */    
    draw: function() {
        this.handler = new OpenLayers.Handler.Box( this,
                            {done: this.WMSQueryTool}, {keyMask: this.keyMask} );
    },

    /**
     * Method: WMSQueryTool
     *
     * Parameters:
     * position - {<OpenLayers.Bounds>} or {<OpenLayers.Pixel>}
     */
    WMSQueryTool: function (position) {
        if (position instanceof OpenLayers.Bounds) {
            var minXY = this.map.getLonLatFromPixel(
                            new OpenLayers.Pixel(position.left, position.bottom));
            var maxXY = this.map.getLonLatFromPixel(
                            new OpenLayers.Pixel(position.right, position.top));
            var bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat,
                                               maxXY.lon, maxXY.lat);
            this.map.zoomToExtent(bounds);
        } else { // it's a pixel
            this.map.setCenter(this.map.getLonLatFromPixel(position),
                               this.map.getZoom() + 1);
        }
    },

    CLASS_NAME: "OpenLayers.Control.WMSQueryTool"
});
