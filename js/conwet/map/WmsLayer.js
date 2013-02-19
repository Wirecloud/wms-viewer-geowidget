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

conwet.map.WmsLayer = Class.create({

    initialize: function(layer) {
        this.layer = layer;
        this.formats = [];
        this.projections = [];

        for (var i = 0; i < layer.formats.length; i++) {
            var format = layer.formats[i];
            if (format == 'image/png') {
                this.formats.unshift(format);
            }
            else {
                this.formats.push(format);
            }
        }

        var projs = $H(layer.bbox).keys();
        for (var i = 0; i < projs.length; i++) {
            var proj = projs[i];
            if (proj == 'EPSG:4326') {
                this.projections.unshift(proj);
            }
            else {
                this.projections.push(proj);
            }
        }
    },

    getName: function() {
        return this.layer.name;
    },

    getTitle: function() {
        return this.layer.title;
    },

    getAbstract: function() {
        return this.layer.abstract;
    },

    isQueryable: function() {
        return this.layer.queryable;
    },

    getProjections: function() {
        return this.projections;
    },

    getFormats: function() {
        return this.formats;
    },

    getExtent: function(srs) {
        var transformer = new conwet.map.ProjectionTransformer();
        return transformer.getExtent(this.layer.llbbox, "EPSG:4326", srs);
    },

    getAtribution: function() {
        return this.layer.attribution;
    },

    getLegendUrl: function() {
        if ((this.layer.styles.length > 0) && ("legend" in this.layer.styles[0])) {
            return this.layer.styles[0].legend.href;
        }
        return null;
    }

});
