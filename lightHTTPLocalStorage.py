#! /usr/bin/env python

import webbrowser
portNumber = 8080

#sys.path.append(os.path.dirname(os.path.realpath(__file__))+"/python/")
from python.webserver import lightHTTPLocalStorageWebServer

try:
	server = lightHTTPLocalStorageWebServer(portNumber)
	webbrowser.open("http://localhost:"+str(server.portNumber)+"/", new=1, autoraise=True)
	print('Starting httpserver on port '+str(server.portNumber))
	server.start()
except KeyboardInterrupt:
	print('^C received, shutting down the web server')
	server.stop()
