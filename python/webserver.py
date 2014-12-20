#!/usr/bin/python3

# Launch doctest with: python3 -m doctest launcher.py

from http.server import BaseHTTPRequestHandler,HTTPServer
import os, json, webbrowser, shutil
portNumber = 8080

workingDir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../')
print("workingDir = "+workingDir)

def selectMimeType(Path):
	"""
	>>> selectMimeType('/home/toto/myFile.json')
	'application/json'
	"""
	if Path.endswith(".html"):
		return 'text/html'
	elif Path.endswith(".jpg"):
		return 'image/jpg'
	elif Path.endswith(".gif"):
		return 'image/gif'
	elif Path.endswith(".png"):
		return 'image/png'
	elif Path.endswith(".js"):
		return 'application/javascript'
	elif Path.endswith(".json"):
		return 'application/json'
	elif Path.endswith(".css"):
		return 'text/css'
	elif Path.endswith(".txt"):
		return 'text/plain'
	elif Path.endswith(".ico"):
		return 'image/vnd.microsoft.icon'
	else:
		return False

def restrictToDataDir(Path):
	"""
	>>> restrictToDataDir('/data/garage.json')
	'data/garage.json'
	>>> restrictToDataDir('/data/../garage.json')
	False
	>>> restrictToDataDir('/inc/img.jpg')
	False
	"""
	Path = Path.strip()
	if not Path.startswith('/data/'):
		return False
	if Path.startswith('/'):
		Path = Path[1:]
	if Path.find('../') > -1:
		return False
	else:
		return Path
	


class lightHTTPLocalStorageWebServer:
	def __init__(self, portNumber):
		while 1:
			try:
				self.server = HTTPServer(('', portNumber), self.lightHTTPLocalStorageHTTPHandler)
				break
			except Exception as e:
				if e.errno == 98: # port already used
					portNumber += 1
					print("Warning: port ", portNumber-1, " already used, trying port ", portNumber)
				else:
					raise
		print('Started httpserver on port ', portNumber)
		self.portNumber = portNumber

	def start(self):
		self.server.serve_forever()
	
	def stop(self):
		self.server.socket.close()
	class lightHTTPLocalStorageHTTPHandler(BaseHTTPRequestHandler):
		'''
		This class will handle any incoming request 
		from the browser
		'''
		def log_message( self, format, *args ):
			'''Avoid a verbose output
			'''
			pass

		def do_POST(self):
			#print("In do_POST: [self.path="+self.path+"]")
			if self.client_address[0] not in ['localhost', '127.0.0.1']:
				# Browser must be local
				return

			# Avoid an access outside /data/
			varFileName = restrictToDataDir(self.path)
			varFileName = os.path.join(workingDir, varFileName)
			#print("[varFileName="+str(varFileName)+"]")
			if varFileName == False:
				self.send_response(400)
				self.send_header('Content-type', 'text/plain')
				self.end_headers()
				self.wfile.write(bytes('lightHTTPLocalStorage error: Forbidden access to '+self.path, 'UTF-8'))
				#print('Warning: Forbidden access to '+self.path)
			else:
				# Write, even if the file does not exist yet.
				#print(self.headers)
				#print(self.headers['Content-Length'])
				if self.headers['Content-Type'].find('application/json') > -1:
					data = self.rfile.read(int(self.headers['Content-Length'])).decode('utf-8')
					#print(data)
					#print(json.loads(data))
					data = json.loads(data)['data'].encode('utf-8')
					#print(data)
				else: # Blob
					print(self.headers['Content-Type'])
					print('[received blob:'+self.path+']')
					data = self.rfile.read(int(self.headers['Content-Length']))
				#print(varFileName)

				# Create parent directories if necessary.
				def createDir(Path):
					#print("[Path="+Path+"]")
					if not os.path.isdir(Path):
						#print("[isn't a dir]")
						if os.path.exists(Path):
							raise NameError('This path should be a directory, but is a file: '+Path)
						else:
							createDir(os.path.dirname(Path))
							os.makedirs(Path)
					return
				createDir(os.path.dirname(varFileName))

				#print("Writing in ", varFileName, ":", data)
				f = open(varFileName, 'wb+')
				f.write(data)
				f.close()
				self.do_GET()
				return


		def do_GET(self):
			#print("In do_GET: [self.path="+self.path+"]")
			if self.path.startswith('/data/'):
				'''
				Read access to variable
				'''
				selfPathSplitted = self.path.split('?')
				if len(selfPathSplitted) == 2:
					action = selfPathSplitted[1]
				else:
					action = 'get'
				self.path = selfPathSplitted[0]
				#print("[action="+action+"]")

				# Browser must be local
				if self.client_address[0] not in ['localhost', '127.0.0.1']:
					return

				#print("=========\nself.headers:\n"+str(self.headers))
				varFileName = restrictToDataDir(self.path)
				varFileName = os.path.join(workingDir, varFileName)
				if action == 'delete':
					try:
						if os.path.isdir(varFileName):
							shutil.rmtree(varFileName)
						else:
							os.remove(varFileName)
					except:
						pass
					self.send_response(200)
					self.send_header('Content-type', 'text/plain')
					self.end_headers()
					self.wfile.write(bytes('OK', 'UTF-8'))
				else:
					try:
						self.send_response(200)
						self.send_header('Content-type', selectMimeType(varFileName))
						self.end_headers()
						f = open(varFileName, 'rb')
						self.wfile.write(f.read())
						f.close()

					except IOError:
						self.send_response(400)
						self.send_header('Content-type', 'text/plain')
						self.end_headers()
						self.wfile.write(bytes('lightHTTPLocalStorage error: Please create file data/'+varFileName+' before any read access to it.', 'UTF-8'))
						print('Warning: Forbidden GET access to ', varFileName, '[', varFileName,']')
				return
			else:
				'''
				Serving the HTML app
				'''
				if self.path=="/":
					self.path="/index.html"

				try:
					#Check the file extension required and
					#set the right mime type

					mimetype = selectMimeType(self.path)
					#print('[mimetype='+str(mimetype)+']')
					if mimetype != None:
						#Open the static file requested and send it
						#print(workingDir)
						fileName = os.path.join(workingDir, 'html', *self.path.split('/'))
						#fileName = os.path.join(*self.path.split('/'))
						#print("fileName = "+str(fileName))
						self.send_response(200)
						self.send_header('Content-type', mimetype)
						self.end_headers()
						f = open(fileName, 'rb')
						self.wfile.write(f.read())
						f.close()
					else:
						print('Error: unrecognized mimetype for file: '+self.path)
					return


				except IOError:
					self.send_error(404, 'File Not Found: %s' % self.path)
