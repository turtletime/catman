The game is a combination of instances as follows:

* Node2D __room__ -- represents a room. MUST be at (0, 0).
  * Node2D __bounds__ -- represents the dimensions of the room.
  * Node __objects__ -- represents the world objects populating the room.
* Node2D __world-object__ -- represents an entity. MUST be at (0, 0).
  * Area2D __collision__ -- represents the collision area of the object.
  * Area2D __interaction__ -- represents the interation area of the object.
  * Sprite __sprite__ (optional) -- represents the appearance of the object.
* Node __game__ -- represents the game.
  * Node __world__ -- represents the world.
    * Node2D __player__ -- represents the player.
    * Node2D __room__ -- represents the current room.
  * Node __hud__ -- represents the HUD.


