import web
import scripts.requests

#urls is a web.py convention. determines how requests are handled
urls = (
    '/','index',
    '/js/(.*)','script_handler',
    '/css/(.*)','script_handler2',
    '/font/(.*)','script_handler3',
    '/add_segment','scripts.requests.AddSegment',
    '/delete_segment','scripts.requests.DeleteSegment',
    '/update_segment','scripts.requests.UpdateSegment',
    '/switch_segment','scripts.requests.SwitchSegment',
    '/open','scripts.requests.OpenFile',
    '/open_table','scripts.requests.OpenTable'
)


#renders the initial html file upon load
class index:
    
    def GET(self):
        render = web.template.render('templates/')
        return render.editor()

#serves js files upon load (included in html. basis of client side operations)
class script_handler:
    
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

#serves css files upon load. Used for styling (bootstrap)
class script_handler2:
    
    def GET(self, url):
        script = open('css/'+url,'r')
        return script.read()

#serves font files upon load. Used for special icons on buttons.
class script_handler3:
    
    def GET(self, url):
        script = open('font/'+url,'r')
        return script.read()

#main method. initializes server
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
