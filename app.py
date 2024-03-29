#!/usr/bin/env python

import os

import json
#import simplejson

from flask import Flask
from flask import url_for
from flask import render_template
from flask import request
from flask import jsonify

#import pymongo
#import bson.objectid

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html', title="SummerOfGeorge")


@app.route('/nodes')
def activities():
    return render_template('nodes.html')


@app.route('/lastfm')
def map():
    return render_template('lastfm.html')


if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = True
    app.run(host='0.0.0.0', port=port)
    

