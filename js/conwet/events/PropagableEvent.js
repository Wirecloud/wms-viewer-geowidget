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

use('conwet.events');

conwet.events.PropagableEvent = Class.create(conwet.events.Event, {

    get: function($super) {
        return this._unpackageEvent($super().evalJSON());
    },

    send: function($super, message, forward) {
        if ((arguments.length == 1) || ((arguments.length > 1) && !forward)) {
            message = this._packageEvent(message);
        }
        $super(message);
    },

    _packageEvent: function(message) {
        message = {
            'eventId'    : (new Date()).getTime(),
            'gadgetId'   : MashupPlatform.widget.id,
            'eventValue' : message
        };
        return Object.toJSON(message);
    },

    _unpackageEvent: function(message) {
        if ((typeof message == 'object') && ('eventId' in message) && ('gadgetId' in message) && ('eventValue' in message)) {
            return message['eventValue'];
        }
        return message;
    }

});
