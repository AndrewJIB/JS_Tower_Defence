/*TODO LIST
- картинки на кнопках вместо текста
- выводить просто картинки в нужном месте
- анимировать картинки

//замер затраченного времени
var t0 = performance.now();
doSomething();
var t1 = performance.now();
console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
*/

//КОНСТАНТЫ
var FPS = 60;
var MILLISECONDS_PER_TURN = Math.round(1000/FPS, 0);
var INIT_ID = "field";//id DIVа для игры
var BACKGROUND_ID = "bg";//id канвы заднего фона
var FIELD_ID = "canvas";//id канвы игрового поля
var FIELD_WIDTH = 800;//ширина игрового поля
var FIELD_HEIGHT = 600;//высота игрового поля
var FIELD_K = FIELD_WIDTH / FIELD_HEIGHT;//отношение ширины к высоте
var TOWER_RADIUS = 20;//радиус башни
var CONSTRUCTION_MENU_RADIUS = TOWER_RADIUS*2;//расстояние от центра, где будем рисовать пункты меню (например возможные башни)
var CONSTRUCTION_MENU_ITEM_RADIUS = TOWER_RADIUS;//радиус пунктов меню
var BUTTON_START_TEXT = "Start";//тип и основной текст на кнопке СТАРТ
var BUTTON_PAUSE_TEXT = "Pause";//тип и основной текст на кнопке ПАУЗА
var BUTTON_PLAY_TEXT = "Play";//текст на кнопке ПАУЗА во время самой паузы
var BUTTON_EXIT_TEXT = "Exit";//тип и основной текст на кнопке ВЫХОД
var DESTROY_COEFF = 0.5;//доля от стоимости башни, возвращаемая при разрушении
var DELTA_BEZIER = 50;//высота навесной траектории (для вычисления третьей точки кривой Безье)

//ПЕРЕМЕННЫЕ ИГРЫ
var allowed_towers = [];//доступные на уровне башни
var buttons = [];//кнопки на экране
var gameIsPlaying;//идет ли игра
var lives;//жизней на уровне
var gold;//золота на уровне
var timer;//счетчик времени
var timerId;//запущенная функция таймера
var tower_spaces = [];//места под башни
var units = [];//юниты в порядке очередности выхода
var ways = [];//пути движения юнитов
var waves = [];//описание волны. из этого строится units (очередь юнитов и их выхода)
var constructionMenu;//меню строительства
var bullets = [];//снаряды на экране

//ПЕРЕМЕННЫЕ ИГРОВОГО ПОЛЯ
var bg;//канва заднего фона
var canvas;//канва игрового поля
var zoom;//коэффициент масштаба между размером экрана и размером поля

initialize(level_number = 1);

//ОСНОВНЫЕ ФУНКЦИИ
//инициализация игры
function initialize(level_number)
{
	console.clear();
	gameIsPlaying = false;
	
	//задний фон
	if (document.getElementById(BACKGROUND_ID) === null)
	{
		bg = document.createElement('canvas');
		bg.id = BACKGROUND_ID;
		bg.width = FIELD_WIDTH;
		bg.height = FIELD_HEIGHT;
		bg.style.backgroundColor = 'rgba(127, 255, 212, 0.2)';
		document.getElementById(INIT_ID).appendChild(bg);
	}
	
	//игровое поле
	if (document.getElementById(FIELD_ID) === null)
	{
		canvas = document.createElement('canvas');
		canvas.id = FIELD_ID;
		canvas.width = FIELD_WIDTH;
		canvas.height = FIELD_HEIGHT;
		canvas.style.backgroundColor = 'rgba(255, 255, 255, 0)';
		document.getElementById(INIT_ID).appendChild(canvas);
		canvas.style.position = 'fixed';
		canvas.style.zIndex = '1';
		//обработчик нажатия
		canvas.addEventListener('click', canvas_click, false);
	}
	
	//обработчик изменения размера экрана
	window.addEventListener('resize', resize_field, false);
	
	//переменные уровня
	timer = 0;
	allowed_towers = 	clone(level_allowed_towers[level_number]);
	lives = 				clone(level_lives[level_number]);
	gold = 				clone(level_gold[level_number]);
	tower_spaces = 	clone(level_tower_spaces[level_number]);
	ways = 				clone(level_ways[level_number]);
	waves = 				clone(level_waves[level_number]);
	
	//рассчитываем стоимости разрушения башен
	for (var i=0; i<game_towers.length; i++)
	{
		game_towers[i].destroy_price = getDestroyPrice(i);
	}
	
	//меню строительства
	constructionMenu = {};
	constructionMenu.isActive = false;//включен ли режим строительства
	constructionMenu.towerSpaceId = 0;//ID выбранной башни
	constructionMenu.radius = CONSTRUCTION_MENU_RADIUS;//расстояние от центра, где будем рисовать пункты меню (например возможные башни)
	constructionMenu.itemRadius = CONSTRUCTION_MENU_ITEM_RADIUS;//радиус пунктов меню
	constructionMenu.items = [];//пункты меню (по числу башен + пункт повышения уровня + пункт удаления)
	
	//места под возможные башни
	for (var i=0; i<allowed_towers.length; i++)
	{
		var calculated_angle = 360/(allowed_towers.length+1)*(i+1)-90;
		if (calculated_angle >= 180) calculated_angle = 360 - calculated_angle;
		constructionMenu.items[i] = {
			isActive: false,//активен ли пункт (можно нажимать)
			isPressed: false,//нажат ли пункт первый раз (для дальнейшего подтверждения)
			isEnabled: false,//доступно ли действие (хватает ли денег или доступен ли уровень повышения)
			name: allowed_towers[i]['name'],//название башни
			angle: calculated_angle,//угол для расчета координат
			x: undefined,
			y: undefined
		};
	}
	//пункт повышения уровня
	constructionMenu.items.push({
		isActive: false,
		isPressed: false,
		isEnabled: false,
		name: 'Level up',
		angle: 90,
		x: undefined,
		y: undefined
	});
	//пункт удаления
	constructionMenu.items.push({
		isActive: false,
		isPressed: false,
		isEnabled: false,
		name: 'Destroy',
		angle: -90,
		x: undefined,
		y: undefined
	});

	//создаем очередь выхода юнитов
	units = [];
	var n = 0;
	for (var i=0; i<waves.length; i++)
	{
		for (var f=0; f<waves[i]['num_of_units']; f++)
		{
			units[n] = clone(game_units[waves[i]['unit']]);
			units[n].startTime = waves[i]['start_time'] + waves[i]['interval'] * f;
			units[n].way = waves[i]['way'];
			n++;
		}
	}
	
	//КНОПКИ
	buttons = [];
	//кнопка "Старт"
	buttons.push(new Button(type = BUTTON_START_TEXT, text = BUTTON_START_TEXT + ' level ' + level_number + '', x = 300, y = 50, x2 = 500, y2 = 100, font = 'bold 20pt Arial', isVisible = true, isClickable = true));
	//кнопка "Пауза"
	buttons.push(new Button(type = BUTTON_PAUSE_TEXT, text = BUTTON_PAUSE_TEXT, x = 710, y = 0, x2 = 750, y2 = 20, font = 'bold 10pt Arial', isVisible = false, isClickable = false));
	//кнопка "Выход"
	buttons.push(new Button(type = BUTTON_EXIT_TEXT, text = BUTTON_EXIT_TEXT, x = 760, y = 0, x2 = 800, y2 = 20, font = 'bold 10pt Arial', isVisible = false, isClickable = false));
	
	//СНАРЯДЫ
	bullets = [];
	
	resize_field();
}

//ИГРОВАЯ ЛОГИКА
function play_game()
{
	timer = timer + MILLISECONDS_PER_TURN;
	
	//полет снарядов
	bullets.forEach(function(item, i, arr)	{
		//ID башни, выпустившей снаряд
		var idOfFiringTower = tower_spaces[item.parentTowerSpaceId].gameTowersId;
		var towerX = tower_spaces[item.parentTowerSpaceId].x;
		var towerY = tower_spaces[item.parentTowerSpaceId].y;
		var damage_radius = game_towers[idOfFiringTower].damage_radius;
		var damage = game_towers[idOfFiringTower].damage;
		
		//для одиночной цели - самонаведение
		if (damage_radius == 0)
		{
			item.targetX = units[item.targetId].x;
			item.targetY = units[item.targetId].y;
		}
		
		//движение по траектории
		var trajectory = game_towers[idOfFiringTower].trajectory;
		var bullet_speed = game_towers[idOfFiringTower].bullet_speed;
		var newXY = [];
		newXY = calculate_next_point_on_trajectory(item.x, item.y, item.targetX, item.targetY, towerX, towerY, trajectory, bullet_speed, item.k_trajectory);
		item.x = newXY['x'];
		item.y = newXY['y'];
		if (newXY['t'] > 0) bullets[i].k_trajectory = newXY['t'];
		
		//попадание в цель
		if (newXY['goal'] == 1)
		{
			//списываем здоровье юнита
			if (damage_radius == 0)//для снарядов, летящих в 1 цель
			{
				decrease_unit_health(item.targetId);
			}
			else//для снарядов, бьющих по площади
			{
				//ищем всех юнитов, попавших под раздачу
				for (var u=0; u<units.length; u++)
				{
					if (units[u].isOnField)
					{
						//сравниваем квадраты расстояний, чтобы не терять время на извлечении корней
						var distance_q_to_unit = distance_q(item.targetX, item.targetY, units[u].x, units[u].y);
						if (distance_q_to_unit <= damage_radius*damage_radius)
						{
							decrease_unit_health(u);
						}
					}
				}
			}

			//уничтожаем снаряд
			delete bullets[i];
		}
	});
	
	//стрельба башен
	for (var i=0; i<tower_spaces.length; i++)
	{
		//ID башни, которая сейчас на этом месте
		var idOfTowerOnThisPlace = tower_spaces[i].gameTowersId;

		if (game_towers[idOfTowerOnThisPlace].name != 'Empty space')
		{
			tower_spaces[i].visibleUnits = [];
			tower_spaces[i].nearestUnit = null;
			
			//ищем юнитов в поле зрения башни
			var nearest_distance_q = 999999999;
			
			for (var u=0; u<units.length; u++)
			{
				if (units[u].isOnField)
				{
					//сравниваем квадраты расстояний, чтобы не терять время на извлечении корней
					var distance_q_to_unit = distance_q(tower_spaces[i].x, tower_spaces[i].y, units[u].x, units[u].y);
					if (distance_q_to_unit <= game_towers[idOfTowerOnThisPlace].fire_range*game_towers[idOfTowerOnThisPlace].fire_range)
					{
						tower_spaces[i].visibleUnits.push(u);
						if (distance_q_to_unit < nearest_distance_q)
						{
							nearest_distance_q = distance_q_to_unit;
							tower_spaces[i].nearestUnit = u;
						}
					}
				}
			}
			
			//уменьшаем время, оставшееся до выстрела
			tower_spaces[i].cooldown = tower_spaces[i].cooldown - MILLISECONDS_PER_TURN;
			if (tower_spaces[i].cooldown < 0) tower_spaces[i].cooldown = 0;
			
			//если есть в кого и можем стрелять
			if (tower_spaces[i].nearestUnit !== null && tower_spaces[i].cooldown == 0)
			{
				tower_spaces[i].cooldown = game_towers[idOfTowerOnThisPlace].fire_speed;
				
				//стреляем в ближайшего
				var bullet_x = 		tower_spaces[i].x;
				var bullet_y = 		tower_spaces[i].y;
				
				var damage_radius = game_towers[idOfTowerOnThisPlace].damage_radius;
				if (damage_radius == 0)//стреляем в 1 цель
				{
					var bullet_targetId = tower_spaces[i].nearestUnit;
				}
				else//бьем по площади
				{
					var bullet_targetX = units[tower_spaces[i].nearestUnit].x;
					var bullet_targetY = units[tower_spaces[i].nearestUnit].y;
				}
				var bullet_parentTowerSpaceId = 	i;
				
				bullets.push(new Bullet(bullet_x, bullet_y, bullet_targetX, bullet_targetY, bullet_targetId, bullet_parentTowerSpaceId, 0));
			}
		}
	}
	
	//движение юнитов
	for (var u=0; u<units.length; u++)
	{
		//если юнит на поле - двигаем его по нужному пути
		if (units[u].isOnField)
		{
			//расстояние от юнита до цели
			var target_x = ways[units[u].way][units[u].initial_point+1][0];
			var target_y = ways[units[u].way][units[u].initial_point+1][1];
			var way_length = distance(units[u].x, units[u].y, target_x, target_y);
			var k = units[u].currentSpeed/FPS / way_length;
			//новые координаты
			units[u].x = units[u].x + k * (target_x - units[u].x);
			units[u].y = units[u].y + k * (target_y - units[u].y);
			
			//координаты точки, из которой идем
			var initial_x = ways[units[u].way][units[u].initial_point][0];
			var initial_y = ways[units[u].way][units[u].initial_point][1];
			//квадрат расстояния от исходной точки до цели
			var way_length_full = distance_q(initial_x, initial_y, target_x, target_y);
			//квадрат расстояния от исходной точки до юнита
			var way_length_to_unit = distance_q(initial_x, initial_y, units[u].x, units[u].y);
			//если до точки дальше, чем до цели, значит дошли и надо назначить новую цель или сыграть логику окончания
			if (way_length_to_unit >= way_length_full)
			{
				units[u].initial_point++;
				//дошли до конца
				if (units[u].initial_point >= ways[units[u].way].length - 1)
				{
					//снимаем юнит с поля
					units[u].isOnField = false;
					units[u].currentHealth = 0;
					//убавляем счетчик жизней уровня
					lives = lives - units[u].lives;
					//заканчиваем уровень, если закончились жизни
					if (lives <= 0)
					{
						game_over('loser');
					}
				}
			}
		}
		
		//выпускаем нового юнита, если подошло его время и он не дохлый (второе условие позволяет выпускать юнитов с неполным здоровьем)
		if (units[u].isOnField === false && units[u].currentHealth > 0 && units[u].startTime <= timer)
		{
			units[u].isOnField = true;
			//ставим юнит в начало пути (0)
			units[u].initial_point = 0;
			units[u].x = ways[units[u].way][0][0];
			units[u].y = ways[units[u].way][0][1];
		}
		
	}
	
	//отрисовка получившегося поля
	draw_field();
}

function decrease_unit_health(unit_id)
{
	units[unit_id].currentHealth = units[unit_id].currentHealth - damage;
	
	if (units[unit_id].currentHealth <= 0)
	{
		units[unit_id].currentHealth = 0;
		units[unit_id].isOnField = false;

		//заканчиваем уровень, если всех победили
		var total_health = 0;
		for (var u=0; u<units.length; u++) total_health = total_health + units[u].currentHealth;
		if (total_health == 0)
		{
			game_over('winner');
		}
	}
}

function game_over(result)
{
	if (result == 'loser')
	{
		alert("Game over. You lose");
	}
	
	if (result == 'winner')
	{
		alert("Game over. You win!");
	}
	
	initialize(level_number = 1);
}














