#!/bin/bash

if [ ! -x node_modules ]
then
  echo "Installing Dependencies"
  npm link express validator mocha chai casperjs sinon body-parser basic-auth npid
fi

mocha test/unit/*.js
#mocha-casperjs test/end2end/*.js
