import web
import scripts.requests

urls = (
    '/','index',
    '/js/(.*)','script_handler',
    '/add_segment','scripts.requests.AddSegment',
    '/delete_segment','scripts.requests.DeleteSegment',
    '/open','scripts.requests.OpenFile',
    '/open_table','scripts.requests.OpenTable'
)

render = web.template.render('templates/')

class index:
    
    def GET(self):
        return render.editor()

class script_handler:
    
    def GET(self, url):
        script = open('js/'+url,'r')
        return script.read()

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
