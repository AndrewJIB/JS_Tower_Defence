var level_gold = [];
var level_lives = [];
var level_ways = [];
var level_tower_spaces = [];
var level_allowed_towers = [];
var level_waves = [];

//УРОВЕНЬ 1
	//первоначальное количество золота
	level_gold[1] = 500;

	//первоначальное количество жизней уровня
	level_lives[1] = 20;

	//траектории движения
	level_ways[1] = 
	[
		//путь 0
		[
			[0, 300],
			[200, 100],
			[400, 500],
			[600, 100],
			[800, 300]
		]
	];

	//поля для башен
	level_tower_spaces[1] = 
	[
		new TowerSpace(x = 180, y = 200),
		new TowerSpace(x = 300, y = 200),
		new TowerSpace(x = 260, y = 360),
		new TowerSpace(x = 400, y = 360),
		new TowerSpace(x = 490, y = 460),
		new TowerSpace(x = 520, y = 110),
		new TowerSpace(x = 620, y = 200)
	];

	//объект "Поле для башни"
	function TowerSpace(x, y, gameTowersId = 0, isClickable = true, isSelected = false, visibleUnits = [], nearestUnit = null, cooldown = 0)
	{
		this.x = x;//координаты центра башни
		this.y = y;
		this.gameTowersId = gameTowersId;//id установленной башни. По-умолчанию 0 - пустое место
		this.isClickable = isClickable;//можно нажимать
		this.isSelected = isSelected;//нажато ли поле. Если да - будет показан диалог возможных действий
		this.visibleUnits = visibleUnits;//массив ID юнитов (units[i]), находящихся в зоне видимости башни
		this.nearestUnit = nearestUnit;//ближайший юнит, находящийся в зоне видимости башни
		this.cooldown = cooldown;//миллисекунд до выстрела
	}

	//доступные башни
	level_allowed_towers[1] = [];

	level_allowed_towers[1][2] = [];
	level_allowed_towers[1][2]['name'] = 'Archery tower';//название башни
	level_allowed_towers[1][2]['max_level'] = 2;//максимально допустимый уровень

	level_allowed_towers[1][1] = [];
	level_allowed_towers[1][1]['name'] = 'Mage tower';
	level_allowed_towers[1][1]['max_level'] = 1;

	level_allowed_towers[1][0] = [];
	level_allowed_towers[1][0]['name'] = 'Bomberman';
	level_allowed_towers[1][0]['max_level'] = 1;

	//волны
	level_waves[1] = [];

	level_waves[1][0] = [];
	level_waves[1][0]['unit'] = 			'Goblin';	//юнит
	level_waves[1][0]['start_time'] = 	0;				//таймер выхода от начала игры (мс)
	level_waves[1][0]['interval'] = 		500;			//интервал выхода (мс)
	level_waves[1][0]['num_of_units'] = 10;			//количество юнитов
	level_waves[1][0]['way'] = 			0;				//путь

	level_waves[1][1] = [];
	level_waves[1][1]['unit'] = 			'Goblin with shield';
	level_waves[1][1]['start_time'] = 	5000;
	level_waves[1][1]['interval'] = 		1000;
	level_waves[1][1]['num_of_units'] = 5;
	level_waves[1][1]['way'] = 			0;

	level_waves[1][2] = [];
	level_waves[1][2]['unit'] = 			'Big goblin';
	level_waves[1][2]['start_time'] = 	12000;
	level_waves[1][2]['interval'] = 		2000;
	level_waves[1][2]['num_of_units'] = 3;
	level_waves[1][2]['way'] = 			0;

