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

conwet.events.PropagableSlot = Class.create(conwet.events.Slot, {

    initialize: function($super, name, handler) {
        $super(name, handler);
        this.events      = [];
        this.lastEventId = 0;
    },

    addEvent: function(event) {
        // Only for PropagableEvent
        this.events.push(event);
    },

    _handler: function($super, message) {
        var evalMessage = message.evalJSON();
        if (!this._isDisposableEvent(evalMessage)) {
            this._setLastEventId(evalMessage);
            this.events.each(function(event) {
                event.send(message, true);
            });
            $super(this._unpackageEvent(evalMessage));
        }
    },

    _setLastEventId: function(message) {
        if ((typeof message == 'object') && ('eventId' in message)) {
            this.lastEventId = message['eventId'];
        }
    },

    _isDisposableEvent: function(message) {
        if ((typeof message == 'object') && ('eventId' in message) && ('gadgetId' in message)) {
            return (message['eventId'] <= this.lastEventId) || (message['gadgetId'] == MashupPlatform.widget.id);
        }
        return false;
    },

    _unpackageEvent: function(message) {
        if ((typeof message == 'object') && ('eventId' in message) && ('gadgetId' in message) && ('eventValue' in message)) {
            return message['eventValue'];
        }
        return message;
    }

});
