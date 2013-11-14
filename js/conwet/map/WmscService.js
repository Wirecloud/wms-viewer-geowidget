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

use("conwet.map");

conwet.map.WmscService = Class.create({

    initialize: function(xml) {
        var formater = new OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC();
        this.wms = (formater).read(xml);
        this.layers = $H();
        var factor = this.wms.capability.vendorSpecific.tileSets.length / this.wms.capability.layers.length;
        

        for (var i = 0; i < this.wms.capability.layers.length; i++) {
            var tileSets = [];
            for (var j = 0; j < factor; j++){
                tileSets [j] = this.wms.capability.vendorSpecific.tileSets[((j+1)*(i+1))-1];
            }
            this.addLayer(this.wms.capability.layers[i], this.wms.version, tileSets);
            
        }

    },

    getName: function() {
        return this.wms.service.name;
    },

    getTitle: function() {
        return this.wms.service.title;
    },

    getAbstract: function() {
        return this.wms.service.abstract;
    },

    getVersion: function() {
        return this.wms.version;
    },

    getLayers: function() {
        var layers = [];
        var keys = this.layers.keys();

        for (var i=0; i<keys.length; i++) {
            layers.push(this.getLayer(keys[i]));
        }
        return layers;
    },

    getFeatureInfoFormat: function() {
        var preferredFormats = ['application/vnd.ogc.gml', 'application/xml', 'text/html'];
        var formats = this.wms.capability.request.getfeatureinfo.formats;

        for (var i=0; i<preferredFormats.length; i++) {
            var formatIndex = formats.indexOf(preferredFormats[i]);
            if (formatIndex != -1) {
                return formats[formatIndex];
            }
        }

        return formats[0];
    },

    getLayer: function(name) {
        return this.layers.get(name);
    },

    addLayer: function(layer, tileSets) {
        this.layers.set(layer.name, new conwet.map.WmsLayer(layer, tileSets));
    },

    removeLayer: function(name) {
        this.layers.unset(name);
    }

});
