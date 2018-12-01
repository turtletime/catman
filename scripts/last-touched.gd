extends Node

func _ready():
	pass

func _on_Area2D_area_entered(area):
	if area.name == "interaction":
		set("lastTouched", area.get_parent())


func _on_Area2D_area_exited(area):
	set("lastTouched", null)
