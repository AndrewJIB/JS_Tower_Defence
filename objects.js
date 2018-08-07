//объект "Кнопка"
function Button(type, text, x, y, x2, y2, font, isVisible, isClickable)
{
	this.type = type;
	this.text = text;
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.font = font;
	this.isVisible = isVisible;
	this.isClickable = isClickable;
}

//объект "Снаряд"
function Bullet(x, y, targetX, targetY, targetId, parentTowerSpaceId, k_trajectory)
{
	this.x = x;//координаты
	this.y = y;
	this.targetX = targetX;//координаты цели
	this.targetY = targetY;
	this.targetId = targetId;//ID цели (юнита)
	this.parentTowerSpaceId = parentTowerSpaceId;//ID места на поле, откуда выпущен снаряд
	this.k_trajectory = k_trajectory;//какую часть пути прошел снаряд
}

