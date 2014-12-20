#!/usr/bin/python3

# Launch doctest with: python3 -m doctest launcher.py

from http.server import BaseHTTPRequestHandler,HTTPServer
import os, json, webbrowser
portNumber = 8080

#sys.path.append(os.path.dirname(os.path.realpath(__file__))+"/python/")
from python.webserver import lightHTTPLocalStorageWebServer

try:
	server = lightHTTPLocalStorageWebServer(portNumber)
	webbrowser.open("http://localhost:"+str(portNumber)+"/", new=1, autoraise=True)
	server.start()
except KeyboardInterrupt:
	print('^C received, shutting down the web server')
	server.stop()
