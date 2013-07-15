import web
import threading
import agent.eihttp

#get version command
class VERSION():
    def GET(self):
        #t.q.put()   #on the eicomm thread 
        agent.eihttp.get_version()
        return None


#renders the initial html file upon load
class INDEX():
    def GET(self):
        render = web.template.render('')
        return render.index()


#I/O Commands
#==========================#

class SAVE_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.save_experiment])
                return None

class GET_EXPERIMENT_LIST():
    pass

class OPEN_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.open_experiment, web.data()])
                return None

class CREATE_EXPERIMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                t.q.put([agent.eihttp.create_experiment, web.data()])
                return None
#==========================#

        
#Graph manipulation commands
#==========================#
class ADD_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                form = web.input()
                t.q.put([agent.eihttp.add_segment, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), float(form.repeat_value), int(form.position)])
                return None

class DELETE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = web.data()
                                                                                                        
                #parse csv
                to_delete = [] 
                new_string = ''
                for letter in data:
                    if letter == ',':
                        to_delete.append(int(new_string))
                        new_string = ''
                    else:
                        new_string += letter
                if new_string != '':
                    to_delete.append(int(new_string))
                        
                t.q.put([agent.eihttp.delete_segment, to_delete])
                return None

class UPDATE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                form = web.input()
                t.q.put([agent.eihttp.update_segment, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), float(form.repeat_value), int(form.position)])
                return None

class MOVE_SEGMENT():
    def POST(self):
        for t in threading.enumerate():
            if t.name == 'agent':
                data = web.data()
                segs = []
                new_data = ''
                for letter in data:
                    if letter == ',':
                        segs.append(int(new_data))
                        new_data = ''
                    else:
                        new_data += letter
                if new_data != '':
                    segs.append(int(new_data))

                t.q.put([agent.eihttp.move_segment, segs[0], segs[1]])

                return None

#==========================#


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

#serves font files upon load. Used for special icons on buttons.
class SERVE_FONT():
    def GET(self, url):
        script = open('font/'+url,'r')
        return script.read()


