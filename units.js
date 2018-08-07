var game_units = [];

game_units['Goblin'] = new GameUnit(
							name = 'Goblin',
							lives = 1,
							gold = 5,
							initialSpeed = 50,
							currentSpeed = 50,
							initialHealth = 10,
							currentHealth = 10,
							size = 10,
							shield = [0, 0],
							way = 0,
							startTime = 0,
							isOnField = false,
							x = 0,
							y = 0,
							initial_point = 0,
							color = 'green'
						);
game_units['Goblin with shield'] = new GameUnit(
							name = 'Goblin with shield',
							lives = 1,
							gold = 7,
							initialSpeed = 40,
							currentSpeed = 40,
							initialHealth = 10,
							currentHealth = 10,
							size = 10,
							shield = [30, 0],
							way = 0,
							startTime = 0,
							isOnField = false,
							x = 0,
							y = 0,
							initial_point = 0,
							color = 'red'
						);
game_units['Big goblin'] = new GameUnit(
							name = 'Big goblin',
							lives = 2,
							gold = 10,
							initialSpeed = 30,
							currentSpeed = 30,
							initialHealth = 20,
							currentHealth = 20,
							size = 15,
							shield = [0, 0],
							way = 0,
							startTime = 0,
							isOnField = false,
							x = 0,
							y = 0,
							initial_point = 0,
							color = 'blue'
						);

function GameUnit(name, lives, gold, initialSpeed, currentSpeed, initialHealth, currentHealth, size, shield, way, startTime, isOnField, x, y, initial_point,color)
{
	this.name = name;
	this.lives = lives;//сколько жизней уровня снимается, если юнит дошел до конца
	this.gold = gold;//сколько золота дает игроку
	this.initialSpeed = initialSpeed;
	this.currentSpeed = currentSpeed;
	this.initialHealth = initialHealth;
	this.currentHealth = currentHealth;
	this.size = size;//радиус фигуры
	this.shield = shield;//массив [phisical 0-100%, magical 0-100%]
	this.way = way;//номер пути
	this.startTime = startTime;//время выхода на поле
	this.isOnField = isOnField;//находится ли на поле
	this.x = x;//текущие координаты
	this.y = y;
	this.initial_point = initial_point;//точка пути, из которой сейчас идет к следующей точке
	this.color = color;
}

