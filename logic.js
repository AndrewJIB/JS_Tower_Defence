/*TODO LIST
- стрельба башен
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
			//units[n].currentHealth = units[n].currentHealth*1;
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
	
	resize_field();
}

//отрисовка поля
function draw_field()
{
	//очищаем поле
	var context = canvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);
	
	//таймер
	draw_text(timer, x = FIELD_WIDTH, y = FIELD_HEIGHT, textAlign = 'right', textBaseline = 'bottom', font = '10pt Arial', lineWidth = 1, strokeStyle = 'black', fillStyle = 'black');
	
	//количество ресурса
	draw_text(gold+' gold', x = 5, y = 0, textAlign = 'left', textBaseline = 'top', font = 'bold 20pt Arial', lineWidth = 1, strokeStyle = '#775915', fillStyle = '#ffff44');
	
	//оставшиеся жизни
	draw_text(lives+' lives', x = 5, y = 30, textAlign = 'left', textBaseline = 'top', font = 'bold 20pt Arial', lineWidth = 1, strokeStyle = '#471d1d', fillStyle = '#c75454');
	
	//траектория
	for (var i=0; i<ways.length; i++)
	{
		for (f=0; f<ways[i].length - 1; f++)
		{
			draw_line(ways[i][f][0], ways[i][f][1], ways[i][f+1][0], ways[i][f+1][1], 1, 'grey', [5,5]);
		}
	}
	
	//кнопки
	draw_buttons();
	
	//башни
	draw_towers();
	
	//меню строительства
	draw_construction_menu();
	
	//юниты
	draw_units();
	
}

//отрисовка кнопок
function draw_buttons()
{
	for (var i=0; i<buttons.length; i++)
	{
		if (buttons[i].isVisible)
		{
			draw_rect(buttons[i].x, buttons[i].y, buttons[i].x2, buttons[i].y2, lineWidth = 2, strokeStyle = 'green', fillStyle = 'lightgreen', setLineDash = [3, 3]);
			draw_text(buttons[i].text, (buttons[i].x+buttons[i].x2)/2, (buttons[i].y+buttons[i].y2)/2, textAlign = 'center', textBaseline = 'middle', font = buttons[i].font, lineWidth = 1, strokeStyle = '#775915', fillStyle = '#ffff44');
		}
	}
}

//отрисовка башен
function draw_towers()
{
	for (var i=0; i<tower_spaces.length; i++)
	{
		//пустое место
		if (game_towers[tower_spaces[i].gameTowersId].name == 'Empty space')
		{
			var emptySpaceFillStyle = '#ede6d6'; if (tower_spaces[i].isSelected) emptySpaceFillStyle = '#ada696';
			draw_circle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, lineWidth = 1, strokeStyle = '#986d1f', fillStyle = emptySpaceFillStyle, setLineDash = [3,3]);
		}
		//башня
		else
		{
			draw_circle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, lineWidth = 1, strokeStyle = '#2c3273', fillStyle = '#a7abd9', setLineDash = []);
			draw_text(game_towers[tower_spaces[i].gameTowersId].name + ' ' + game_towers[tower_spaces[i].gameTowersId].level, tower_spaces[i].x, tower_spaces[i].y, textAlign = 'center', textBaseline = 'middle', font = 'normal 7pt Arial', lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
		}
	}
}

//отрисовка меню строительства
function draw_construction_menu()
{
	if (constructionMenu.isActive)
	{
		for (var i=0; i<constructionMenu.items.length; i++)
		{
			if (constructionMenu.items[i].isActive)
			{
				//признак неактивного пункта
				var lineDash = []; if (constructionMenu.items[i].isEnabled === false) lineDash = [1,5];
				//выводим пункт меню
				draw_circle(constructionMenu.items[i].x, constructionMenu.items[i].y, constructionMenu.itemRadius, lineWidth = 1, strokeStyle = '#986d1f', fillStyle = 'transparent', setLineDash = lineDash);
				
				//название пункта меню
				var constructionMenuFont = 'normal 7pt Arial';
				if (constructionMenu.items[i].isPressed) constructionMenuFont = 'bold 7pt Arial';
				draw_text(constructionMenu.items[i].name, constructionMenu.items[i].x, constructionMenu.items[i].y, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				
				//стоимость строительства башни
				if (constructionMenu.items[i].name != 'Level up' && constructionMenu.items[i].name != 'Destroy')
				{
					draw_text(game_towers[getTowerIdByName(constructionMenu.items[i].name)].price, constructionMenu.items[i].x, constructionMenu.items[i].y + 10, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}
				//стоимость улучшения башни
				if (constructionMenu.items[i].name == 'Level up')
				{
					var nextLevelId = getNextLevelId(tower_spaces[constructionMenu.towerSpaceId].gameTowersId);
					if (nextLevelId !== undefined) draw_text(game_towers[nextLevelId].price, constructionMenu.items[i].x, constructionMenu.items[i].y + 10, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}
				//стоимость разрушения башни
				if (constructionMenu.items[i].name == 'Destroy')
				{
					draw_text(game_towers[tower_spaces[constructionMenu.towerSpaceId].gameTowersId].destroy_price, constructionMenu.items[i].x, constructionMenu.items[i].y + 10, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}
			}
		}
	}
}

//отрисовка юнитов
function draw_units()
{
	for (var i=0; i<units.length; i++)
	{
		if (units[i].isOnField)
		{
			//сам юнит
			draw_circle(units[i].x, units[i].y, units[i].size, lineWidth = 1, strokeStyle = 'black', fillStyle = units[i].color, setLineDash = []);
			//полоса жизни над головой
			var red = Math.round(units[i].size*2*((units[i].initialHealth - units[i].currentHealth) / units[i].initialHealth), 0);
			var green = units[i].size*2 - red;
			draw_line(units[i].x + units[i].size, units[i].y - units[i].size - 5, units[i].x + units[i].size - red, units[i].y - units[i].size - 5, lineWidth = 5, fillStyle = 'red', setLineDash = []);
			draw_line(units[i].x - units[i].size, units[i].y - units[i].size - 5, units[i].x - units[i].size + green, units[i].y - units[i].size - 5, lineWidth = 5, fillStyle = 'lightgreen', setLineDash = []);
		}
	}
}

//обработка нажатий на поле
function canvas_click()
{
	var real_x = parseInt((event.clientX - canvas.offsetLeft) / zoom);
	var real_y = parseInt((event.clientY - canvas.offsetTop) / zoom);
	
	//проверяем - нажат ли активный объект
	//кнопки
	for (var i=0; i<buttons.length; i++)
	{
		if (buttons[i].isClickable)
		{
			if (isPointInRectangle(buttons[i].x, buttons[i].y, buttons[i].x2, buttons[i].y2, real_x, real_y))
			{
				console.log('button', i, 'clicked');
				
				//нажатие кнопки "Старт"
				if (buttons[i].type == BUTTON_START_TEXT)
				{
					//запускаем игру
					gameIsPlaying = true;
					if (timerId === undefined) setTimer();

					//выключаем и скрываем кнопку "Старт"
					buttons[i].isVisible = false;
					buttons[i].isClickable = false;
					
					//включаем игровые кнопки
					for (var f=0; f<buttons.length; f++)
					{
						if (buttons[f].type == BUTTON_PAUSE_TEXT)
						{
							buttons[f].isVisible = true;
							buttons[f].isClickable = true;
						}
						if (buttons[f].type == BUTTON_EXIT_TEXT)
						{
							buttons[f].isVisible = true;
							buttons[f].isClickable = true;
						}
					}
					
					//включаем поля башен
					for (var f=0; f<tower_spaces.length; f++)
					{
						tower_spaces[f].isClickable = true;
					}
					
				}
				
				//нажатие кнопки "Пауза"
				if (buttons[i].type == BUTTON_PAUSE_TEXT)
				{
					//меняем текст
					if (buttons[i].text == BUTTON_PAUSE_TEXT)
					{
						buttons[i].text = BUTTON_PLAY_TEXT;
						gameIsPlaying = false;
						draw_field();
					}
					else
					{
						buttons[i].text = BUTTON_PAUSE_TEXT;
						gameIsPlaying = true;
					}
				}
				
				//нажатие кнопки "Выход"
				if (buttons[i].type == BUTTON_EXIT_TEXT)
				{
					initialize(level_number = 1);
				}
				
				//выходим из функции
				if (gameIsPlaying === false) draw_field();
				return;
			}
		}
	}
	
	//поля для башен
	for (var i=0; i<tower_spaces.length; i++)
	{
		if (tower_spaces[i].isClickable)
		{
			if (isPointInCircle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, real_x, real_y))
			{
				//гасим выбор на всех остальных башнях
				for (var f=0; f<tower_spaces.length; f++)
				{
					if (f != i) tower_spaces[f].isSelected = false;
				}
				
				//меняем выбрана/не выбрана
				tower_spaces[i].isSelected = !tower_spaces[i].isSelected;
				
				//если башня выбрана - включаем объект строительства башни и перемещаем его на выбранную башню
				if (tower_spaces[i].isSelected)
				{
					constructionMenu.isActive = true;
					//ID выбранного места
					constructionMenu.towerSpaceId = i;
					//координаты меню
					constructionMenu.x = tower_spaces[i].x;
					constructionMenu.y = tower_spaces[i].y;
					
					//активируем нужные пункты меню
					for (var f=0; f<constructionMenu.items.length; f++)
					{
						//снимаем активацию со всех пунктов меню
						constructionMenu.items[f].isActive = false;
						constructionMenu.items[f].isPressed = false;
						
						//пустое место - активируем только пункты под новые башни
						if (game_towers[tower_spaces[i].gameTowersId].name == 'Empty space')
						{
							if (constructionMenu.items[f].name != 'Level up' && constructionMenu.items[f].name != 'Destroy') constructionMenu.items[f].isActive = true;
						}
						//построенная башня - активируем только Level up и Destroy
						else
						{
							if (constructionMenu.items[f].name == 'Level up' || constructionMenu.items[f].name == 'Destroy') constructionMenu.items[f].isActive = true;
						}
						
						//вычисляем координаты активных пунктов меню
						if (constructionMenu.items[f].isActive)
						{
							var angle = degToRad(constructionMenu.items[f].angle);
							constructionMenu.items[f].x = constructionMenu.x + constructionMenu.radius * Math.cos(angle);
							constructionMenu.items[f].y = constructionMenu.y - constructionMenu.radius * Math.sin(angle);
							
							//можно ли будет нажимать на пункты
							constructionMenu.items[f].isEnabled = false;
							
							//проверяем - хватает ли золота на постройку
							var towerId = getTowerIdByName(constructionMenu.items[f].name);
							if (constructionMenu.items[f].name != 'Level up' && constructionMenu.items[f].name != 'Destroy' && gold >= game_towers[towerId].price) constructionMenu.items[f].isEnabled = true;
							//проверяем - доступно ли повышение уровня
							var nextLevelId = getNextLevelId(tower_spaces[constructionMenu.towerSpaceId].gameTowersId);
							if (constructionMenu.items[f].name == 'Level up' && nextLevelId !== undefined && gold >= game_towers[nextLevelId].price) constructionMenu.items[f].isEnabled = true;
							//или это пункт разрушения
							if (constructionMenu.items[f].name == 'Destroy') constructionMenu.items[f].isEnabled = true;
						}
					}
				}
				else
				{
					constructionMenu.isActive = false;
				}
				
				//выходим из функции
				if (gameIsPlaying === false) draw_field();
				return;
			}
		}
	}
	
	//меню строительства
	if (constructionMenu.isActive)
	{
		//проходим по всем пунктам
		for (var i=0; i<constructionMenu.items.length; i++)
		{
			//выбираем активные
			if (constructionMenu.items[i].isActive)
			{
				//ловим на них нажатия
				if (isPointInCircle(constructionMenu.items[i].x, constructionMenu.items[i].y, constructionMenu.itemRadius, real_x, real_y))
				{
					//ID выбранной башни 1 уровня
					var towerId = getTowerIdByName(constructionMenu.items[i].name);
					//ID башни следующего уровня
					var nextLevelId = getNextLevelId(tower_spaces[constructionMenu.towerSpaceId].gameTowersId);
					
					//первое нажатие
					if (constructionMenu.items[i].isPressed === false)
					{
						//снимаем нажатия со всех пунктов меню
						for (var f=0; f<constructionMenu.items.length; f++)
						{
							constructionMenu.items[f].isPressed = false;
						}
						
						//ставим нажатие на выбранный пункт
						if (constructionMenu.items[i].isEnabled) constructionMenu.items[i].isPressed = true;
					}
					//подтвержденное нажатие
					else
					{
						//выполняем подтвержденное действие
						//повышение уровня
						if (constructionMenu.items[i].name == 'Level up')
						{
							//если есть, что строить
							if (nextLevelId !== undefined)
							{
								//если хватает золота
								if (gold >= game_towers[nextLevelId].price)
								{
									gold = gold - game_towers[nextLevelId].price;
									tower_spaces[constructionMenu.towerSpaceId].gameTowersId = nextLevelId;
								}
							}
						}
						//разрушение
						else if (constructionMenu.items[i].name == 'Destroy')
						{
							gold = gold + game_towers[tower_spaces[constructionMenu.towerSpaceId].gameTowersId].destroy_price;
							tower_spaces[constructionMenu.towerSpaceId].gameTowersId = 0;
						}
						//постройка
						else
						{
							//если хватает золота
							if (gold >= game_towers[towerId].price)
							{
								gold = gold - game_towers[towerId].price;
								tower_spaces[constructionMenu.towerSpaceId].gameTowersId = towerId;
							}
						}
						
						//убираем меню строительства
						hide_construction_menu();
					}
					
					//выходим из функции
					if (gameIsPlaying === false) draw_field();
					return;
				}
			}
		}
	}
	
	//ничего так и не нажали
	//убираем меню строительства
	hide_construction_menu();
}

function hide_construction_menu()
{
	//гасим выбор на всех башнях
	for (var i=0; i<tower_spaces.length; i++)
	{
		tower_spaces[i].isSelected = false;
	}

	//убираем меню строительства
	constructionMenu.isActive = false;
	
	//снимаем активность и нажатия со всех пунктов
	for (var i=0; i<constructionMenu.items.length; i++)
	{
		constructionMenu.items[i].isActive = false;
		constructionMenu.items[i].isPressed = false;
	}
	
	//отрисовываем поле, если стоим на паузе
	if (gameIsPlaying === false) draw_field();
}

//вычисляем ID башни для строительства по ее названию
function getTowerIdByName(name)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == name && game_towers[i].level == 1) return i;
	}
}

//вычисляем ID следующего уровня
function getNextLevelId(tower_id)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == game_towers[tower_id].name && game_towers[i].level == game_towers[tower_id].level + 1) return i;
	}
	
	return undefined;
}

//вычисляем ID предыдущего уровня
function getPreviousLevelId(tower_id)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == game_towers[tower_id].name && game_towers[i].level == game_towers[tower_id].level - 1) return i;
	}
	
	return undefined;
}

//стоимость разрушения башни
function getDestroyPrice(tower_id)
{
	var destroy_cost = game_towers[tower_id].price;
	
	//рекурсивно обходим все предыдущие уровни
	if (game_towers[tower_id].level > 1) destroy_cost = destroy_cost + getDestroyPrice(getPreviousLevelId(tower_id));
	
	return Math.round(destroy_cost*DESTROY_COEFF);
}

//таймер
function setTimer()
{
	timerId = setTimeout(function tick()
	{
		if (gameIsPlaying) play_game();
		timerId = setTimeout(tick, Math.round(1000/FPS, 0));
	}, Math.round(1000/FPS, 0));
}

//попадает ли точка в круг
function isPointInCircle(circle_x, circle_y, circle_radius, point_x, point_y)
{
	if ((circle_x-point_x)*(circle_x-point_x) + (circle_y-point_y)*(circle_y-point_y) <= circle_radius*circle_radius) return true;
	
	return false;
}

//попадает ли точка в прямоугольник
function isPointInRectangle(x, y, x2, y2, point_x, point_y)
{
	if (point_x >= x && point_x <= x2 && point_y >= y && point_y <= y2) return true;
	
	return false;
}

//градусы в радианы и обратно
function degToRad (deg) { return deg / 180 * Math.PI; }
function radToDeg (rad) { return rad / Math.PI * 180; }

//реакиця на изменение размера экрана
function resize_field()
{
	var window_width = document.getElementById(INIT_ID).clientWidth;
	var window_height = document.getElementById(INIT_ID).clientHeight;
	var window_k = window_width / window_height;
	
	//если экран более широкий, чем канва - то добавляем полосы слева и справа
	if (window_k >= FIELD_K)
	{
		bg.style.marginLeft = (window_width - FIELD_K * window_height) / 2 + 'px';
		bg.width = FIELD_K * window_height;
		bg.height = window_height;
		
		canvas.width = FIELD_K * window_height;
		canvas.height = window_height;
	}

	//если экран более узкий, чем канва - то добавляем полосы сверху и снизу
	if (window_k < FIELD_K)
	{
		bg.style.marginTop = (window_height - window_width / FIELD_K) / 2 + 'px';
		bg.width = window_width;
		bg.height = window_width / FIELD_K;
		
		canvas.width = window_width;
		canvas.height = window_width / FIELD_K;
	}
	
	canvas.style.top = bg.offsetTop;
	canvas.style.left = bg.offsetLeft;

	zoom = canvas.width / FIELD_WIDTH;
	
	draw_field();
}

//рисование линии
function draw_line(x1, y1, x2, y2, lineWidth = 2, strokeStyle, setLineDash = [])
{
	var context = canvas.getContext('2d');
	if (canvas.getContext) 
	{
		context.beginPath(); 
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;
		context.setLineDash(setLineDash);
		context.moveTo(x1*zoom, y1*zoom);
		context.lineTo(x2*zoom, y2*zoom);
		context.stroke();
	}
}

//рисование прямоугольника
function draw_rect(x1, y1, x2, y2, lineWidth = 2, strokeStyle, fillStyle, setLineDash = [])
{
	var context = canvas.getContext('2d');
	if (canvas.getContext) 
	{
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;
		context.fillStyle = fillStyle;
		context.setLineDash(setLineDash);
		context.fillRect(x1*zoom, y1*zoom, (x2-x1)*zoom, (y2-y1)*zoom);
		context.strokeRect(x1*zoom, y1*zoom, (x2-x1)*zoom, (y2-y1)*zoom);
	}
}

//рисование круга
function draw_circle(x, y, radius, lineWidth = 2, strokeStyle = 'green', fillStyle = 'lightgreen', setLineDash = [])
{
	var context = canvas.getContext('2d');
	if (canvas.getContext) 
	{
		context.beginPath(); 
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;
		context.fillStyle = fillStyle;
		context.setLineDash(setLineDash);
		context.arc(x*zoom, y*zoom, radius*zoom, 0, Math.PI*2, true)
		context.fill();
		context.stroke();
	}
}

//рисование текста
function draw_text(my_text, x, y, textAlign = 'left', textBaseline = 'top', font = 'bold 30pt Arial', lineWidth = 2, strokeStyle = 'darkgreen', fillStyle = 'green', setLineDash = [])
{
	//масштабируем размер текста
	var start = 0; if (font.indexOf('pt') > font.indexOf(' ')) start = font.indexOf(' ') + 1;
	font = font.substr(0, start) + parseInt(parseInt(font.substr(start, font.indexOf('pt') - start))*zoom) + font.substr(font.indexOf('pt'));
	
	var context = canvas.getContext('2d');
	if (canvas.getContext) 
	{
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeStyle;
		context.fillStyle = fillStyle;
		context.setLineDash(setLineDash);
		context.font = font;
		context.textAlign = textAlign;//center, start, end, left, right
		context.textBaseline = textBaseline;//top, hanging, middle, alphabetic, ideographic и bottom
		if (fillStyle != '') context.fillText(my_text, x*zoom, y*zoom);
		if (strokeStyle != '') context.strokeText(my_text, x*zoom, y*zoom);
		//тень
		//context.shadowColor = "#F00";
		//context.shadowOffsetX = 5;
		//context.shadowOffsetY = 5;
		//context.shadowBlur = 5;
	}
}

function clone(o) {
	if (!o || 'object' !== typeof o) {
		return o;
	}
	var c = 'function' === typeof o.pop ? [] : {};
	var p, v;
	for (p in o) 
	{
		if (o.hasOwnProperty(p))
		{
		   v = o[p];
		   if (v && 'object' === typeof v)
		   {
				c[p] = clone(v);
		   }
		   else
		   {
				c[p] = v;
		   }
		}
	}
	return c;
}

//расстояние между точками
function distance(x1, y1, x2, y2)
{
	return Math.pow((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1), 0.5);
}

//квадрат расстояния между точками
function distance_q(x1, y1, x2, y2)
{
	return (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
}

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

//ИГРОВАЯ ЛОГИКА
function play_game()
{
	timer = timer + Math.round(1000/FPS, 0);
	
	//движение юнитов
	for (var i=0; i<units.length; i++)
	{
		//если юнит на поле - двигаем его по нужному пути
		if (units[i].isOnField)
		{
			//расстояние от юнита до цели
			var target_x = ways[units[i].way][units[i].initial_point+1][0];
			var target_y = ways[units[i].way][units[i].initial_point+1][1];
			var way_length = distance(units[i].x, units[i].y, target_x, target_y);
			var k = units[i].currentSpeed/FPS / way_length;
			//новые координаты
			units[i].x = units[i].x + k * (target_x - units[i].x);
			units[i].y = units[i].y + k * (target_y - units[i].y);
			
			//координаты точки, из которой идем
			var initial_x = ways[units[i].way][units[i].initial_point][0];
			var initial_y = ways[units[i].way][units[i].initial_point][1];
			//квадрат расстояния от исходной точки до цели
			var way_length_full = distance_q(initial_x, initial_y, target_x, target_y);
			//квадрат расстояния от исходной точки до юнита
			var way_length_to_unit = distance_q(initial_x, initial_y, units[i].x, units[i].y);
			//если до точки дальше, чем до цели, значит дошли и надо назначить новую цель или сыграть логику окончания
			if (way_length_to_unit >= way_length_full)
			{
				units[i].initial_point++;
				//дошли до конца
				if (units[i].initial_point >= ways[units[i].way].length - 1)
				{
					//снимаем юнит с поля
					units[i].isOnField = false;
					units[i].currentHealth = 0;
					//убавляем счетчик жизней уровня
					lives = lives - units[i].lives;
					//заканчиваем уровень, если закончились жизни
					if (lives <= 0)
					{
						//TODO
						alert("Game over");
						initialize(level_number = 1);
					}
				}
			}
		}
		
		//выпускаем нового юнита, если подошло его время и он не дохлый (второе условие позволяет выпускать юнитов с неполным здоровьем)
		if (units[i].isOnField === false && units[i].currentHealth > 0 && units[i].startTime <= timer)
		{
			units[i].isOnField = true;
			//ставим юнит в начало пути (0)
			units[i].initial_point = 0;
			units[i].x = ways[units[i].way][0][0];
			units[i].y = ways[units[i].way][0][1];
		}
		
	}
	
	//отрисовка получившегося поля
	draw_field();
}

