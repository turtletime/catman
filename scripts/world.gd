extends Node

func _on_interaction(node):
	get_parent()._on_interaction(node)
