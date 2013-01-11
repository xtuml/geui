import web
import handler

handler = handler.GraphHandler()

class AddSegment:

    def POST(self):
        form = web.input()
        
        current_graph = handler.open_model()
        position = int(form.position)
        handler.add_segment(current_graph, float(form.start_value), float(form.end_value), float(form.rate), float(form.duration), position)
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

class OpenFile:
  
    def POST(self):
        current_graph = handler.open_model()
        return handler.calculate_reply(current_graph, 0)

class OpenTable:

    def POST(self):
        current_graph = handler.open_model()
        return handler.calculate_table_reply(current_graph)
