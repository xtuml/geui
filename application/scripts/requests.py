import web
import handler

handler = handler.GraphHandler()

class AddSegment:

    def POST(self):
        form = web.input()
        
        current_graph = handler.open_model()
        position = int(form.position)
        handler.add_segment(current_graph, int(form.start_value), int(form.end_value), int(form.rate), int(form.duration), position)
        handler.update_model(current_graph)
        return handler.calculate_reply(current_graph, position)

class DeleteSegment:

    def POST(self):
        current_graph = handler.open_model()
        if (web.data() == ''):
            position = current_graph.ends_with.position
        else:
            position = int(web.data())
        reply = handler.calculate_reply(current_graph, position)
        handler.delete_segment(current_graph, position)
        handler.update_model(current_graph)
        return reply 
