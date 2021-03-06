/**
 * Things Controller.
 *
 * Manages HTTP requests to /things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

var express = require('express');
var Things = require('../models/things');
var AdapterManager = require('../adapter-manager');

var ThingsController = express.Router();

/**
 * Get a list of Things.
 */
ThingsController.get('/', function (request, response) {
  Things.getThingDescriptions().then(function(things) {
    response.status(200).json(things);
  });
});

/**
 * Handle creating a new thing.
 */
ThingsController.post('/', function (request, response) {
  if (!request.body || !request.body.id) {
    response.status(400).send('No id in thing description');
    return;
  }
  var description = request.body;
  var id = description.id;
  delete description.id;
  Things.createThing(id, description).then(function(thing) {
    console.log('Successfully created new thing ' + thing);
    response.status(201).send(thing);
  }).catch(function(error) {
    console.error('Error saving new thing');
    console.error(error);
    response.status(500).send(error);
  });
});

/**
 * Get a property of a Thing.
 */
ThingsController.get('/:thingId/properties/:propertyName',
  function(request, response) {
  var thingId = request.params.thingId;
  var propertyName = request.params.propertyName;
  AdapterManager.getProperty(thingId, propertyName).then((value) => {
    var result = {};
    result[propertyName] = value;
    response.status(200).json(result);
  }).catch((error) => {
    console.error('Error getting value for thingId:', thingId,
                  'property:', propertyName);
    console.error(error);
    response.status(500).send(error);
  });
});

/**
 * Set a property of a Thing.
 */
ThingsController.put('/:thingId/properties/:propertyName',
  function(request, response) {
  var thingId = request.params.thingId;
  var propertyName = request.params.propertyName;
  if(!request.body || request.body[propertyName] === undefined) {
    response.status(400).send('Invalid property name');
    return;
  }
  var value = request.body[propertyName];
  AdapterManager.setProperty(thingId, propertyName, value)
    .then((updatedValue) => {
      // Note: it's possible that updatedValue doesn't match value.
      var result = {};
      result[propertyName] = updatedValue;
      response.status(200).json(result);
    }).catch((error) => {
      console.error('Error setting value for thingId:', thingId,
                    'property:', propertyName,
                    'value:', value);
      response.status(500).send(error);
    });
});

/**
 * Remove a Thing.
 */
ThingsController.delete('/:thingId', function(request, response) {
  var thingId = request.params.thingId;
  try {
    Things.removeThing(thingId).then(function() {
      console.log('Successfully deleted ' + thingId + ' from database.');
      response.status(204).send();
    });
  } catch(e) {
    response.status(500).send('Failed to remove thing ' + thingId);
  }
});

module.exports = ThingsController;
