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

OpenLayers.Control.ClickToPan = OpenLayers.Class(OpenLayers.Control, {

    initialize: function(mapManager) {
        this.mapManager = mapManager;

        this.handlerOptions = OpenLayers.Util.extend({}, {
            'single': true,
            'delay': 200
        });
        

        OpenLayers.Control.prototype.initialize.apply(this);

        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick.bind(this)
        }, this.handlerOptions);
    },

    onClick: function(e) {
        this.map.panTo(this.map.getLonLatFromPixel(e.xy));        
    }

});
