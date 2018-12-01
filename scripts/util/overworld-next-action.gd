var game

func _init(gameInstance):
  game = gameInstance

func call():
  game._next_action()
