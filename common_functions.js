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

//таймер
function setTimer()
{
	timerId = setTimeout(function tick()
	{
		if (gameIsPlaying) play_game();
		timerId = setTimeout(tick, Math.round(1000/FPS, 0));
	}, Math.round(1000/FPS, 0));
}

