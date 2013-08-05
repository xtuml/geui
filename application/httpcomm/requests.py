import web
import threading
import agent.eihttp
import json
import time

#Outgoing command request
class COMMAND:
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                if not t.commands.empty():
                    message = t.commands.get()
                    print 'Message sent: "' + message[0] + '" to GUI at [' + time.ctime() + ']'
                    return message[1]
                else:
                    return 'NoLog'              #tells the webpy server not to log

#I/O Commands
#==========================#

class SAVE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.save_experiment])

class GET_EXPERIMENT_LIST:
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.get_experiments])

class REQUEST_TABLE:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.request_table, data['table_id'], data['position']])

class OPEN_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.open_experiment, data['name']])

class CREATE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.create_experiment, data['name']])

class DELETE_EXPERIMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.delete_experiment, data['name']])

class UPLOAD_FILE:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.upload_file, data['name'], data['contents']])

#==========================#

        
#Graph manipulation commands
#==========================#

class ADD_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.add_pattern, float(data['start_value']), float(data['end_value']), float(data['rate']), float(data['duration']), int(data['repeat_value'])])

class DELETE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.delete_pattern, data['positions']])

class MOVE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.move_pattern, int(data['position']), int(data['destination'])])

class UPDATE_PATTERN:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.update_pattern, float(data['repeat_value']), int(data['position'])])

class ADD_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.add_segment, float(data['start_value']), float(data['end_value']), float(data['rate']), float(data['duration']), int(data['pattern'])])

class DELETE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.delete_segment, data['positions'], int(data['pattern'])])

class MOVE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.move_segment, int(data['position']), int(data['destination']), int(data['pattern'])])

class UPDATE_SEGMENT:
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.update_segment, float(data['start_value']), float(data['end_value']), float(data['rate']), float(data['duration']), int(data['position']), int(data['pattern'])])

#==========================#


#Other commands
#==========================#

#get version command
class VERSION:
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.get_version])

#exit command
class EXIT:
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.exit])

#download waveform command
class DOWNLOAD:
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.download])

#==========================#


#Static commands
#==========================#

#renders the initial html file upon load
class INDEX:
    def GET(self):
        render = web.template.render('')
        return render.index()

#serve static files
#serves js files upon load (included in html. basis of client side operations)
class SERVE_JS:
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

#serves css files upon load. Used for styling (bootstrap)
class SERVE_CSS:
    def GET(self, url):
        script = open('css/'+url,'r')
        return script.read()

class SERVE_IMG:
    def GET(self, url):
        img = open('img/'+url,'rb')
        return img.read()

class SERVE_ICON:
    def GET(self):
        icon = open('img/favicon.ico','rb')
        return icon.read()

#==========================#
