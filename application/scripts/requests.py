import web
import handler

handler = handler.GraphHandler()

class AddSegment:

    def POST(self):
        form = web.input()
        
        current_graph = handler.open_model()
        handler.update_model(current_graph, 'add', form)
        return handler.calculate_reply(current_graph)

class DeleteSegment:

    def POST(self):
        current_graph = handler.open_model()
        reply = handler.calculate_reply(current_graph)
        handler.update_model(current_graph, 'delete', None)
        return reply 
