extends Node

var world
var hud
var currentActionSet
var currentActionNumber
var nextActionCb
var noopCb

var gameState = {
	"neighbors-rusty-nail": 1,
	"rusty-nail": 0
};

var actionMap = {
	"diner": [
		"T/You knock on the door.",
		"T/Someone seems to be knocking back as you do it.",
		"T/You shout, and you hear someone on the other side poorly attempting to imitate your echo."],
	"tree3": [
		"T/This tree was clearly misplanted.",
		"T/There's even a drawing of an arrow on the ground from the tree pointing towards where it\nshould be."
	],
	"neighbor": [
		"D/Neighbor/My dear neighbor. I have been waiting for this moment!",
		"D/Neighbor/I would like you to have this.",
		"I/A/1/rusty-nail",
		"T/The neighbor gave you a Rusty Nail.",
		"D/Neighbor/This is a lucky nail!",
		"D/Neighbor/It's the last nail I removed from my house before it fell apart."
	],
}

func _ready():
	world = get_node("world")
	hud = get_node("hud")
	nextActionCb = load("res://scripts/util/overworld-next-action.gd").new(self)
	noopCb = load("res://scripts/util/no-op.gd").new()
	run_actions(["C/100/The Town", "F/1/0/20"])

func _on_interaction(node):
	if node.name in actionMap:
		run_actions(actionMap[node.name])

func run_actions(set):
	currentActionSet = set
	currentActionNumber = 0
	_next_action()

func _next_action():
	get_tree().paused = false
	while len(currentActionSet) > currentActionNumber:
		var currentAction = currentActionSet[currentActionNumber]
		currentActionNumber += 1
		if _take_action(currentAction, nextActionCb):
			get_tree().paused = true
			break

# returns true if it's an async action
func _take_action(action, nextActionCb):
	var args = action.split("/")
	if args[0] == 'T':
		hud._popup_msg([args[1]], nextActionCb)
		return true
	elif args[0] == 'D':
		hud._popup_msg([args[1] + ": " + args[2]], nextActionCb)
		return true
	elif args[0] == 'F':
		hud._fade(float(args[1]), float(args[2]), float(args[3]), nextActionCb)
		return true
	elif args[0] == 'C':
		hud._popup_title_card(args[2], int(args[1]), noopCb)
	elif args[0] == 'I':
		if args[1] == 'A':
			gameState[args[3]] += int(args[2])
	return false
