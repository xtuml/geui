import web

#super class for commands from the client
class COMMAND:

    def POST(self):
        #have to import at the method scope to avoid circular importing
        from experiment import Experiment
        from server import Server
        form = web.input()
        data = web.data()
        return ''

    def GET(self, url):
        #have to import at the method scope to avoid circular importing
        from experiment import Experiment
        from server import Server
        return ''


#renders the initial html file upon load
class INDEX(COMMAND):
    def GET(self):
        render = web.template.render('')
        return render.index()


#I/O Commands
#==========================#

class SAVE_EXPERIMENT(COMMAND):
    def POST(self):
        from server import Server
        Server.current_experiment.save()
        return ''

class GET_EXPERIMENT_LIST(COMMAND):
    pass

class OPEN_EXPERIMENT(COMMAND):
    def POST(self):
        from experiment import Experiment
        from server import Server
        Server.current_experiment = Experiment.open(web.data())
        if Server.current_experiment != None:
            reply = Server.current_experiment.calculate_reply([], Server.current_experiment.graph.get_vertices())
            reply_table = Server.current_experiment.calculate_table_reply()
            return reply + '&table=' + reply_table
        else:
            return 'NoFile'

class CREATE_EXPERIMENT(COMMAND):
    def POST(self):
        from experiment import Experiment
        from server import Server
        Server.current_experiment = Experiment.create(web.data())
        return ''
#==========================#

        
#Graph manipulation commands
#==========================#
class ADD_SEGMENT(COMMAND):
    def POST(self):
        from server import Server
        form = web.input()
        E = Server.current_experiment
        old_vertices = list(E.graph.get_vertices())
        position = int(form.position)
        E.graph.add_segment([float(form.start_value), float(form.end_value), float(form.rate), float(form.duration)], position)
        reply = E.calculate_reply(old_vertices, E.graph.get_vertices())
        #print reply
        return reply

class DELETE_SEGMENT(COMMAND):
    def POST(self):
        from server import Server
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
                
        E = Server.current_experiment
        old_vertices = list(E.graph.get_vertices())
        for seg in to_delete:
            E.graph.delete_segment(seg)
        reply = E.calculate_reply(old_vertices, E.graph.get_vertices())
        #print reply
        return reply

class UPDATE_SEGMENT(COMMAND):
    def POST(self):
        from server import Server
        form = web.input()
        E = Server.current_experiment
        old_vertices = list(E.graph.get_vertices())
        position = int(form.position)
        E.graph.contents[position].update([float(form.start_value), float(form.end_value), float(form.rate), float(form.duration)])
        reply = E.calculate_reply(old_vertices, E.graph.get_vertices())
        #print reply
        return reply

class MOVE_SEGMENT(COMMAND):
    def POST(self):
        from server import Server
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

        E = Server.current_experiment
        old_vertices = list(E.graph.get_vertices())
        E.graph.move_segment(segs[0], segs[1])
        reply = E.calculate_reply(old_vertices, E.graph.get_vertices())
        #print reply
        return reply
#==========================#


#serve static files
#==========================#
#serves js files upon load (included in html. basis of client side operations)
class SERVE_JS(COMMAND):
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

#serves css files upon load. Used for styling.
class SERVE_CSS(COMMAND):
    def GET(self, url):
        script = open('css/'+url,'r')
        return script.read()

#serves image files upon load.
class SERVE_IMG(COMMAND):
    def GET(self, url):
        img = open('img/'+url,'rb')
        return img.read()

#serves favicon.ico upon load.
class SERVE_ICON(COMMAND):
    def GET(self):
        img = open('img/favicon.ico','rb')
        return img.read()
#==========================#
