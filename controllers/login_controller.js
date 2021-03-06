/**
 * Login Controller.
 *
 * Handles user login.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const Router = require('express-promise-router');
const Users = require('../models/users');
const JSONWebToken = require('../models/jsonwebtoken');
const Authentication = require('../authentication');

var LoginController = Router();

/**
 * Handle login request.
 */
LoginController.post('/', async (request, response) => {
  const {body} = request;
  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password');
    return;
  }

  const user = await Users.getUser(body.email);
  if (!user) {
    response.sendStatus(401);
    return;
  }

  const passwordMatch = await Authentication.comparePassword(
    body.password,
    user.password
  );

  if (!passwordMatch) {
    response.sendStatus(401);
    return;
  }

  // Issue a new JWT for this user.
  const jwt = await JSONWebToken.issueToken(user.id);

  response.send({
    jwt,
  });
});

module.exports = LoginController;
