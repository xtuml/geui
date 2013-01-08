import web
import handler

handler = handler.GraphHandler()

class AddSegment:

  def POST(self):
      form = web.input()
      
      current_graph = handler.open_model()
      handler.update_model(current_graph, form)
      return handler.calculate_reply(current_graph)
      return None
