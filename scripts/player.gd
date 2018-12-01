extends Node

var SPEED = 1
var LOOK_OFFSET = 5
var lastSeen = null

var row = 0
var column = 0
var frameTick = 0
var SPRITE_CYCLE = [0, 1, 0, 2]

var sprite
var body
var cue

func _ready():
	sprite = find_node("sprite")
	body = find_node("body")
	cue = find_node("cue")
	pass

func _process(delta):
	var direction = Vector2()
	if Input.is_action_pressed("ui_left"):
		direction.x -= 1
	if Input.is_action_pressed("ui_right"):
		direction.x += 1
	if Input.is_action_pressed("ui_up"):
		direction.y -= 1
	if Input.is_action_pressed("ui_down"):
		direction.y += 1
	# position.x += direction.x * SPEED
	# position.y += direction.y * SPEED
	body.move_and_collide(direction * SPEED)
	var moving = true
	if direction.x >= 1:
		row = 2
	elif direction.x <= -1:
		row = 1
	elif direction.y >= 1:
		row = 0
	elif direction.y <= -1:
		row = 3
	else:
		moving = false
		column = 0
		frameTick = 0
	if moving:
		cue.position = sprite.position + LOOK_OFFSET * direction
		cue.position.y += 5
		frameTick += 1
	if frameTick == 5:
		column = (column + 1) % len(SPRITE_CYCLE)
		frameTick = 0
	sprite.position.x = body.position.x
	sprite.position.y = body.position.y
	sprite.z_index = self.position.y + sprite.position.y
	sprite.frame = row * sprite.hframes + SPRITE_CYCLE[column]
	if Input.is_action_just_pressed("ui_accept") and lastSeen != null:
		get_parent()._on_interaction(lastSeen)


func _on_area_area_entered(area):
	print(area)
	lastSeen = area.get_parent()


func _on_area_area_exited(area):
	lastSeen = null
