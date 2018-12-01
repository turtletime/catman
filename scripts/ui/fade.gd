extends ColorRect

var from
var to
var interval
var callback

var ticksSinceVisible = 0

func _ready():
	self.visible = true
	self.color.a = 0

func _run(fromAlpha, toAlpha, intervalTicks, cb):
	from = fromAlpha
	to = toAlpha
	interval = intervalTicks
	ticksSinceVisible = 1
	callback = cb

	self.color.a = from

func _process(delta):
	if ticksSinceVisible >= interval:
		self.color.a = to
		ticksSinceVisible = 0
		callback.call()
		return
	if ticksSinceVisible >= 1:
		self.color.a = from + (to - from) * (ticksSinceVisible / interval)
		ticksSinceVisible += 1
	
