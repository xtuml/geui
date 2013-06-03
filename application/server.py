import web
import scripts.requests
import scripts.pyusb #temporary

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
    '/open_table','scripts.requests.OpenTable',

    '/pyusb','scripts.pyusb.PyUSB' #temporary
)


class index:
    
    def GET(self):
        render = web.template.render('templates/')
        return render.editor()

class script_handler:
    
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

class script_handler2:
    
    def GET(self, url):
        script = open('css/'+url,'r')
        return script.read()

class script_handler3:
    
    def GET(self, url):
        script = open('font/'+url,'r')
        return script.read()

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
