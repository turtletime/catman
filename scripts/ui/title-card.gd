extends Panel

var msg
var interval
var callback
var ticksSinceVisible = 0

var textboxText

func _ready():
	textboxText = get_node("text")
	self.visible = false

func _run(title, intervalMs, cb):
	msg = title
	interval = intervalMs
	ticksSinceVisible = 0
	callback = cb
	textboxText.text = msg
	self.visible = true

func _process(delta):
	if self.visible:
		ticksSinceVisible += 1
		if ticksSinceVisible >= interval:
			self.visible = false
			ticksSinceVisible = 0
			callback.call()
