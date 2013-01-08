import web
import scripts.requests

urls = (
    '/','index',
    '/js/(.*)','script_handler',
    '/add_segment','scripts.requests.AddSegment'
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
