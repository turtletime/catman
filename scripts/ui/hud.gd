extends CanvasLayer

var textbox
var fade
var titleCard

func _ready():
	textbox = get_node("textbox")
	fade = get_node("fade")
	titleCard = get_node("title-card")

func _popup_msg(msg, cb):
	textbox._run(msg, cb)

func _fade(from, to, time, cb):
	fade._run(from, to, time, cb)

func _popup_title_card(msg, interval, cb):
	titleCard._run(msg, interval, cb)
