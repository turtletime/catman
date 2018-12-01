extends Panel

var msgArr
var msgIndex = 0
var callback
var ticksSinceVisible = 0

var textboxText

func _ready():
	textboxText = get_node("text")
	self.visible = false

func _run(msg, cb):
	msgArr = msg
	msgIndex = 0
	ticksSinceVisible = 0
	callback = cb
	textboxText.text = msgArr[msgIndex]
	self.visible = true

func _process(delta):
	if self.visible and ticksSinceVisible >= 1 and Input.is_action_just_pressed("ui_accept"):
		msgIndex += 1
		if msgIndex == len(msgArr):
			self.visible = false
			callback.call()
		else:
			ticksSinceVisible = 0
	if self.visible:
		ticksSinceVisible += 1
		textboxText.text = msgArr[msgIndex].substr(0, min(ticksSinceVisible * 2, msgArr[msgIndex].length()))
