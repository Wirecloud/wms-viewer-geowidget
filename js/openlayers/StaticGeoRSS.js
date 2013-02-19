/*
 *     Copyright (c) 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the GeoWidgets Project,
 *
 *     http://conwet.fi.upm.es/geowidgets
 *
 *     Licensed under the GNU General Public License, Version 3.0 (the 
 *     "License"); you may not use this file except in compliance with the 
 *     License.
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     under the License is distributed in the hope that it will be useful, 
 *     but on an "AS IS" BASIS, WITHOUT ANY WARRANTY OR CONDITION,
 *     either express or implied; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  
 *     See the GNU General Public License for specific language governing
 *     permissions and limitations under the License.
 *
 *     <http://www.gnu.org/licenses/gpl.txt>.
 *
 */

/**
 * Class: OpenLayers.Layer.StaticGeoRSS
 * Add GeoRSS Point features to your map from a static string.
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.GeoRSS>
 */
OpenLayers.Layer.StaticGeoRSS = OpenLayers.Class(OpenLayers.Layer.Markers, {
    
    /**
     * Constructor: OpenLayers.Layer.StaticGeoRSS
     * Create a StaticGeoRSS Layer.
     *
     * Parameters:
     * name - {String}
     * rss - {String}
     * options - {Object}
     */
    initialize: function(mapManager, name, rss, options) {
        this.rss = rss;
        this.mapManager = mapManager;
        OpenLayers.Layer.Markers.prototype.initialize.call(this, name, null, options);
        
        this.parseData();
    },

    /**
     * Method: parseData
     * Parse the data returned from the Events call.
     *
     */
    parseData: function() {
        var doc = null;
        if (!this.rss.documentElement) {
            doc = OpenLayers.Format.XML.prototype.read(this.rss);
        }

        this.mapManager.setFeedLayer(this);

        if (this.useFeedTitle) {
            var name = null;
            try {
                name = doc.getElementsByTagNameNS('*', 'title')[0].firstChild.nodeValue;
            } catch (e) {
                name = doc.getElementsByTagName('title')[0].firstChild.nodeValue;
            }
            if (name) {
                this.setName(name);
            }
        }

        var options = {};
        OpenLayers.Util.extend(options, this.formatOptions);

        if (this.map && !this.projection.equals(this.map.getProjectionObject())) {
            options.externalProjection = this.projection;
            options.internalProjection = this.map.getProjectionObject();
        }

        var format = new OpenLayers.Format.GeoRSS(options);
        var features = format.read(doc);

        for (var i=0; i<features.length; i++) {
            var feature = features[i];

            // we don't support features with no geometry in the GeoRSS
            // layer at this time. 
            if (!feature.geometry) {
                continue;
            }

            var title = (feature.attributes.title)? feature.attributes.title: "Sin titulo";
            var description = (feature.attributes.description)? feature.attributes.description: "Sin descripción.";
            var link = (feature.attributes.link)? feature.attributes.link: "";
            var location = feature.geometry.getBounds().getCenterLonLat();

            var div = document.createElement("div");

            var divTitle = document.createElement("div");
            $(divTitle).addClassName("olLayerGeoRSSTitle");
            if (link) {
                var a = document.createElement("a");
                a.href = link;
                a.target = "_blank";
                $(a).addClassName("link");
                a.appendChild(document.createTextNode(title));
                divTitle.appendChild(a);
            }
            else {
                divTitle.appendChild(document.createTextNode(title));
            }
            div.appendChild(divTitle);

            var divDesc = document.createElement("div");
            $(divDesc).addClassName("olLayerGeoRSSDescription");
            divDesc.appendChild(document.createTextNode(description));
            div.appendChild(divDesc);

            this.mapManager.setFeedMarker(location.lon, location.lat, div.innerHTML, this);
        }
    },

    CLASS_NAME: "OpenLayers.Layer.StaticGeoRSS"
});

