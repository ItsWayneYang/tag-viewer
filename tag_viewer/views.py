from cgi import escape
from bs4 import BeautifulSoup
from flask import render_template, jsonify, request, url_for
from requests.exceptions import RequestException
from tag_viewer import app

import requests
import util

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ajax/fetch', methods=['POST'])
def fetch():
    url = request.form['url']
    r = None
    try:
        r = requests.get(url)
    except RequestException as e: 
        reason = e.__doc__
        response = jsonify({
            "error": {
                "message": reason
            } 
        })
        response.status_code = 500
        return response

    soup = BeautifulSoup(r.text)

    # compute tag frequency summary
    summary = util.get_tag_count(soup.html)
    data = {
        "html": escape(r.text),
        "summary": summary
    }
    return jsonify(data)
    
        
