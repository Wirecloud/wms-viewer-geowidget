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

conwet.map.GoogleLayer = Class.create({
    initialize: function(layer) {
        this.layer = layer;
    },
    getName: function() {
        return this.layer.name;
    },
    getTitle: function() {
        return this.layer.name;
    },
    getAbstract: function() {
        return null;
    },
    isQueryable: function() {
        return false;
    },
    getProjections: function() {
        return ["EPSG:900913"];
    },
    getFormats: function() {
        return [];
    },
    getExtent: function(srs) {
        return new OpenLayers.Bounds(-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392);
    },
            
    getMaxExtent: function() {
        //return new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);
        var transformer = new conwet.map.ProjectionTransformer();
        var a = transformer.getMaxExtent("EPSG:900913");
        return a;
    },
            
    getAtribution: function() {
        return this.layer.attribution;
    },
    getLegendUrl: function() {
        return null;
    }

});
