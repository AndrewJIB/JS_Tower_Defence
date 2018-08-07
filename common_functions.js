//��������� ������� �� ����
function canvas_click()
{
	var real_x = parseInt((event.clientX - canvas.offsetLeft) / zoom);
	var real_y = parseInt((event.clientY - canvas.offsetTop) / zoom);
	
	//��������� - ����� �� �������� ������
	//������
	for (var i=0; i<buttons.length; i++)
	{
		if (buttons[i].isClickable)
		{
			if (isPointInRectangle(buttons[i].x, buttons[i].y, buttons[i].x2, buttons[i].y2, real_x, real_y))
			{
				//������� ������ "�����"
				if (buttons[i].type == BUTTON_START_TEXT)
				{
					//��������� ����
					gameIsPlaying = true;
					if (timerId === undefined) setTimer();

					//��������� � �������� ������ "�����"
					buttons[i].isVisible = false;
					buttons[i].isClickable = false;
					
					//�������� ������� ������
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
					
					//�������� ���� �����
					for (var f=0; f<tower_spaces.length; f++)
					{
						tower_spaces[f].isClickable = true;
					}
					
				}
				
				//������� ������ "�����"
				if (buttons[i].type == BUTTON_PAUSE_TEXT)
				{
					//������ �����
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
				
				//������� ������ "�����"
				if (buttons[i].type == BUTTON_EXIT_TEXT)
				{
					initialize(level_number = 1);
				}
				
				//������� �� �������
				if (gameIsPlaying === false) draw_field();
				return;
			}
		}
	}
	
	//���� ��� �����
	for (var i=0; i<tower_spaces.length; i++)
	{
		if (tower_spaces[i].isClickable)
		{
			if (isPointInCircle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, real_x, real_y))
			{
				//����� ����� �� ���� ��������� ������
				for (var f=0; f<tower_spaces.length; f++)
				{
					if (f != i) tower_spaces[f].isSelected = false;
				}
				
				//������ �������/�� �������
				tower_spaces[i].isSelected = !tower_spaces[i].isSelected;
				
				//���� ����� ������� - �������� ������ ������������� ����� � ���������� ��� �� ��������� �����
				if (tower_spaces[i].isSelected)
				{
					constructionMenu.isActive = true;
					//ID ���������� �����
					constructionMenu.towerSpaceId = i;
					//���������� ����
					constructionMenu.x = tower_spaces[i].x;
					constructionMenu.y = tower_spaces[i].y;
					
					//���������� ������ ������ ����
					for (var f=0; f<constructionMenu.items.length; f++)
					{
						//������� ��������� �� ���� ������� ����
						constructionMenu.items[f].isActive = false;
						constructionMenu.items[f].isPressed = false;
						
						//������ ����� - ���������� ������ ������ ��� ����� �����
						if (game_towers[tower_spaces[i].gameTowersId].name == 'Empty space')
						{
							if (constructionMenu.items[f].name != 'Level up' && constructionMenu.items[f].name != 'Destroy') constructionMenu.items[f].isActive = true;
						}
						//����������� ����� - ���������� ������ Level up � Destroy
						else
						{
							if (constructionMenu.items[f].name == 'Level up' || constructionMenu.items[f].name == 'Destroy') constructionMenu.items[f].isActive = true;
						}
						
						//��������� ���������� �������� ������� ����
						if (constructionMenu.items[f].isActive)
						{
							var angle = degToRad(constructionMenu.items[f].angle);
							constructionMenu.items[f].x = constructionMenu.x + constructionMenu.radius * Math.cos(angle);
							constructionMenu.items[f].y = constructionMenu.y - constructionMenu.radius * Math.sin(angle);
							
							//����� �� ����� �������� �� ������
							constructionMenu.items[f].isEnabled = false;
							
							//��������� - ������� �� ������ �� ���������
							var towerId = getTowerIdByName(constructionMenu.items[f].name);
							if (constructionMenu.items[f].name != 'Level up' && constructionMenu.items[f].name != 'Destroy' && gold >= game_towers[towerId].price) constructionMenu.items[f].isEnabled = true;
							//��������� - �������� �� ��������� ������
							var nextLevelId = getNextLevelId(tower_spaces[constructionMenu.towerSpaceId].gameTowersId);
							if (constructionMenu.items[f].name == 'Level up' && nextLevelId !== undefined && gold >= game_towers[nextLevelId].price) constructionMenu.items[f].isEnabled = true;
							//��� ��� ����� ����������
							if (constructionMenu.items[f].name == 'Destroy') constructionMenu.items[f].isEnabled = true;
						}
					}
				}
				else
				{
					constructionMenu.isActive = false;
				}
				
				//������� �� �������
				if (gameIsPlaying === false) draw_field();
				return;
			}
		}
	}
	
	//���� �������������
	if (constructionMenu.isActive)
	{
		//�������� �� ���� �������
		for (var i=0; i<constructionMenu.items.length; i++)
		{
			//�������� ��������
			if (constructionMenu.items[i].isActive)
			{
				//����� �� ��� �������
				if (isPointInCircle(constructionMenu.items[i].x, constructionMenu.items[i].y, constructionMenu.itemRadius, real_x, real_y))
				{
					//ID ��������� ����� 1 ������
					var towerId = getTowerIdByName(constructionMenu.items[i].name);
					//ID ����� ���������� ������
					var nextLevelId = getNextLevelId(tower_spaces[constructionMenu.towerSpaceId].gameTowersId);
					
					//������ �������
					if (constructionMenu.items[i].isPressed === false)
					{
						//������� ������� �� ���� ������� ����
						for (var f=0; f<constructionMenu.items.length; f++)
						{
							constructionMenu.items[f].isPressed = false;
						}
						
						//������ ������� �� ��������� �����
						if (constructionMenu.items[i].isEnabled) constructionMenu.items[i].isPressed = true;
					}
					//�������������� �������
					else
					{
						//��������� �������������� ��������
						//��������� ������
						if (constructionMenu.items[i].name == 'Level up')
						{
							//���� ����, ��� �������
							if (nextLevelId !== undefined)
							{
								//���� ������� ������
								if (gold >= game_towers[nextLevelId].price)
								{
									gold = gold - game_towers[nextLevelId].price;
									tower_spaces[constructionMenu.towerSpaceId].gameTowersId = nextLevelId;
								}
							}
						}
						//����������
						else if (constructionMenu.items[i].name == 'Destroy')
						{
							gold = gold + game_towers[tower_spaces[constructionMenu.towerSpaceId].gameTowersId].destroy_price;
							tower_spaces[constructionMenu.towerSpaceId].gameTowersId = 0;
						}
						//���������
						else
						{
							//���� ������� ������
							if (gold >= game_towers[towerId].price)
							{
								gold = gold - game_towers[towerId].price;
								tower_spaces[constructionMenu.towerSpaceId].gameTowersId = towerId;
							}
						}
						
						//������� ���� �������������
						hide_construction_menu();
					}
					
					//������� �� �������
					if (gameIsPlaying === false) draw_field();
					return;
				}
			}
		}
	}
	
	//������ ��� � �� ������
	//������� ���� �������������
	hide_construction_menu();
}

function hide_construction_menu()
{
	//����� ����� �� ���� ������
	for (var i=0; i<tower_spaces.length; i++)
	{
		tower_spaces[i].isSelected = false;
	}

	//������� ���� �������������
	constructionMenu.isActive = false;
	
	//������� ���������� � ������� �� ���� �������
	for (var i=0; i<constructionMenu.items.length; i++)
	{
		constructionMenu.items[i].isActive = false;
		constructionMenu.items[i].isPressed = false;
	}
	
	//������������ ����, ���� ����� �� �����
	if (gameIsPlaying === false) draw_field();
}

//������
function setTimer()
{
	timerId = setTimeout(function tick()
	{
		if (gameIsPlaying) play_game();
		timerId = setTimeout(tick, Math.round(1000/FPS, 0));
	}, Math.round(1000/FPS, 0));
}

