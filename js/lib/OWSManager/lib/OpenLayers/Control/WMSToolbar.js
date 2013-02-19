/* Copyright (c) 2006-2007 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt 
 * for the full text of the license. */

/**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/ZoomBox.js
 *
 * Class: OpenLayers.Control.WMSToolbar
 */

/**
 * Modificado por jmostazo UPM
 */

OpenLayers.Control.WMSToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {

    initialize: function(wmsManager, mapManager, options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        this.PAN_CONTROL    = new OpenLayers.Control.RichNavigation([new OpenLayers.Control.ClickToPan()], "Pan", {'zoomWheelEnabled': false});
        this.ZOOM_CONTROL   = new OpenLayers.Control.ZoomBox();
        this.MARKER_CONTROL = new OpenLayers.Control.RichNavigation([new OpenLayers.Control.ClickToMarker(mapManager)], "Marker", {'zoomWheelEnabled': false});
        this.QUERY_CONTROL  = new OpenLayers.Control.WMSQuery(mapManager, wmsManager, {});

        this.addControls([this.PAN_CONTROL, this.ZOOM_CONTROL, this.MARKER_CONTROL, this.QUERY_CONTROL]);
    },

    CLASS_NAME: "OpenLayers.Control.WMSToolbar"
});
