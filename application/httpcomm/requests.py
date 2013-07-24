import web
import threading
import agent.eihttp
import json

#Outgoing command request
class COMMAND():
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'httpcomm':
                if len(t.commands) > 0:
                    return t.commands.pop(0)
                else:
                    return 'NoLog'              #tells the webpy server not to log

#I/O Commands
#==========================#

class SAVE_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.save_experiment])

class GET_EXPERIMENT_LIST():
    pass

class OPEN_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.open_experiment, data['name']])

class CREATE_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.create_experiment, data['name']])

#==========================#

        
#Graph manipulation commands
#==========================#

class ADD_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.add_segment, float(data['start_value']), float(data['end_value']), float(data['rate']), float(data['duration']), float(data['repeat_value']), int(data['position'])])

class DELETE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.delete_segment, data['positions']])

class UPDATE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.update_segment, float(data['start_value']), float(data['end_value']), float(data['rate']), float(data['duration']), float(data['repeat_value']), int(data['position'])])
                #data = web.input()
                #t.q.put([agent.eihttp.update_segment, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), float(form.repeat_value), int(form.position)])

class MOVE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = json.loads(web.data())
                t.q.put([agent.eihttp.move_segment, data['position'], data['destination']])

#==========================#


#Other commands
#==========================#

#get version command
class VERSION():
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.get_version])

#exit command
class EXIT():
    def GET(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.exit])

#==========================#


#Static commands
#==========================#

#renders the initial html file upon load
class INDEX():
    def GET(self):
        render = web.template.render('')
        return render.index()

#serve static files
#serves js files upon load (included in html. basis of client side operations)
class SERVE_JS():
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

#serves css files upon load. Used for styling (bootstrap)
class SERVE_CSS():
    def GET(self, url):
        script = open('css/'+url,'r')
        return script.read()

class SERVE_IMG():
    def GET(self, url):
        img = open('img/'+url,'rb')
        return img.read()

class SERVE_ICON():
    def GET(self):
        icon = open('img/favicon.ico','rb')
        return icon.read()

#==========================#
