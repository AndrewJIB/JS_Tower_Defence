//��������� �����
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

//��������� ��������������
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

//��������� �����
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

//��������� ������
function draw_text(my_text, x, y, textAlign = 'left', textBaseline = 'top', font = 'bold 30pt Arial', lineWidth = 2, strokeStyle = 'darkgreen', fillStyle = 'green', setLineDash = [])
{
	//������������ ������ ������
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
		context.textBaseline = textBaseline;//top, hanging, middle, alphabetic, ideographic � bottom
		if (fillStyle != '') context.fillText(my_text, x*zoom, y*zoom);
		if (strokeStyle != '') context.strokeText(my_text, x*zoom, y*zoom);
		//����
		//context.shadowColor = "#F00";
		//context.shadowOffsetX = 5;
		//context.shadowOffsetY = 5;
		//context.shadowBlur = 5;
	}
}

//������� �� ��������� ������� ������
function resize_field()
{
	var window_width = document.getElementById(INIT_ID).clientWidth;
	var window_height = document.getElementById(INIT_ID).clientHeight;
	var window_k = window_width / window_height;
	
	//���� ����� ����� �������, ��� ����� - �� ��������� ������ ����� � ������
	if (window_k >= FIELD_K)
	{
		bg.style.marginLeft = (window_width - FIELD_K * window_height) / 2 + 'px';
		bg.width = FIELD_K * window_height;
		bg.height = window_height;
		
		canvas.width = FIELD_K * window_height;
		canvas.height = window_height;
	}

	//���� ����� ����� �����, ��� ����� - �� ��������� ������ ������ � �����
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

//��������� ����
function draw_field()
{
	//������� ����
	var context = canvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);
	
	//������
	draw_text(timer, x = FIELD_WIDTH, y = FIELD_HEIGHT, textAlign = 'right', textBaseline = 'bottom', font = '10pt Arial', lineWidth = 1, strokeStyle = 'black', fillStyle = 'black');
	
	//���������� �������
	draw_text(gold+' gold', x = 5, y = 0, textAlign = 'left', textBaseline = 'top', font = 'bold 20pt Arial', lineWidth = 1, strokeStyle = '#775915', fillStyle = '#ffff44');
	
	//���������� �����
	draw_text(lives+' lives', x = 5, y = 30, textAlign = 'left', textBaseline = 'top', font = 'bold 20pt Arial', lineWidth = 1, strokeStyle = '#471d1d', fillStyle = '#c75454');
	
	//����������
	for (var i=0; i<ways.length; i++)
	{
		for (f=0; f<ways[i].length - 1; f++)
		{
			draw_line(ways[i][f][0], ways[i][f][1], ways[i][f+1][0], ways[i][f+1][1], 1, 'grey', [5,5]);
		}
	}
	
	//������
	draw_buttons();
	
	//�����
	draw_towers();
	
	//���� �������������
	draw_construction_menu();
	
	//�����
	draw_units();
	
	//�������
	draw_bullets();
	
}

//��������� ������
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

//��������� �����
function draw_towers()
{
	for (var i=0; i<tower_spaces.length; i++)
	{
		//������ �����
		if (game_towers[tower_spaces[i].gameTowersId].name == 'Empty space')
		{
			var emptySpaceFillStyle = '#ede6d6'; if (tower_spaces[i].isSelected) emptySpaceFillStyle = '#ada696';
			draw_circle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, lineWidth = 1, strokeStyle = '#986d1f', fillStyle = emptySpaceFillStyle, setLineDash = [3,3]);
		}
		//�����
		else
		{
			draw_circle(tower_spaces[i].x, tower_spaces[i].y, TOWER_RADIUS, lineWidth = 1, strokeStyle = '#2c3273', fillStyle = '#a7abd9', setLineDash = []);
			draw_text(game_towers[tower_spaces[i].gameTowersId].name + ' ' + game_towers[tower_spaces[i].gameTowersId].level, tower_spaces[i].x, tower_spaces[i].y, textAlign = 'center', textBaseline = 'middle', font = 'normal 7pt Arial', lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
		}
	}
}

//��������� ���� �������������
function draw_construction_menu()
{
	if (constructionMenu.isActive)
	{
		//ID ����� �����
		var thisPlaceId = constructionMenu.towerSpaceId;

		//ID �����, ������� ������ �� ���� �����
		var idOfTowerOnThisPlace = tower_spaces[thisPlaceId].gameTowersId;
		
		//ID ����� ���������� ������
		var nextLevelId = getNextLevelId(idOfTowerOnThisPlace);

		//������ ��������� ������� �����
		if (game_towers[idOfTowerOnThisPlace].name != 'Empty space')
		{
			draw_circle(tower_spaces[thisPlaceId].x, tower_spaces[thisPlaceId].y, game_towers[idOfTowerOnThisPlace].fire_range, lineWidth = 1, strokeStyle = '#134B14', fillStyle = 'rgba(131, 232, 131, 0.5)', setLineDash = [3,3]);
		}
		
		//������ ��������� ������� �����
		for (var i=0; i<constructionMenu.items.length; i++)
		{
			if (constructionMenu.items[i].isPressed)
			{
				//������������� ����� �����
				if (constructionMenu.items[i].name != 'Level up' && constructionMenu.items[i].name != 'Destroy')
				{
					draw_circle(tower_spaces[thisPlaceId].x, tower_spaces[thisPlaceId].y, game_towers[getTowerIdByName(constructionMenu.items[i].name)].fire_range, lineWidth = 1, strokeStyle = '#134B14', fillStyle = 'rgba(131, 232, 131, 0.5)', setLineDash = [3,3]);
				}
				//��������� ������������ �����
				if (constructionMenu.items[i].name == 'Level up')
				{
					if (nextLevelId !== undefined) draw_circle(tower_spaces[thisPlaceId].x, tower_spaces[thisPlaceId].y, game_towers[nextLevelId].fire_range, lineWidth = 1, strokeStyle = '#134B14', fillStyle = 'rgba(131, 232, 131, 0.5)', setLineDash = [3,3]);
				}
			}
		}
		
		//���� ������ ����
		for (var i=0; i<constructionMenu.items.length; i++)
		{
			if (constructionMenu.items[i].isActive)
			{
				//������� ����������� ������
				var lineDash = [];
				if (constructionMenu.items[i].isEnabled === false) lineDash = [1,5];
				
				//����� ������ (�����/�� �����)
				var constructionMenuFont = 'normal 7pt Arial';
				if (constructionMenu.items[i].isPressed) constructionMenuFont = 'bold 7pt Arial';

				//��������� ������������� �����
				if (constructionMenu.items[i].name != 'Level up' && constructionMenu.items[i].name != 'Destroy')
				{
					draw_text(game_towers[getTowerIdByName(constructionMenu.items[i].name)].price, constructionMenu.items[i].x, constructionMenu.items[i].y + CONSTRUCTION_MENU_ITEM_RADIUS/2, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}
				//��������� ��������� �����
				if (constructionMenu.items[i].name == 'Level up')
				{
					if (nextLevelId !== undefined) draw_text(game_towers[nextLevelId].price, constructionMenu.items[i].x, constructionMenu.items[i].y + CONSTRUCTION_MENU_ITEM_RADIUS/2, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}
				//��������� ���������� �����
				if (constructionMenu.items[i].name == 'Destroy')
				{
					draw_text(game_towers[idOfTowerOnThisPlace].destroy_price, constructionMenu.items[i].x, constructionMenu.items[i].y + CONSTRUCTION_MENU_ITEM_RADIUS/2, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
				}

				//������ ��� ����� ����
				draw_circle(constructionMenu.items[i].x, constructionMenu.items[i].y, constructionMenu.itemRadius, lineWidth = 1, strokeStyle = '#986d1f', fillStyle = 'transparent', setLineDash = lineDash);
				draw_text(constructionMenu.items[i].name, constructionMenu.items[i].x, constructionMenu.items[i].y, textAlign = 'center', textBaseline = 'middle', font = constructionMenuFont, lineWidth = 1, strokeStyle = '', fillStyle = '#000000');
			}
		}
	}
}

//��������� ������
function draw_units()
{
	for (var i=0; i<units.length; i++)
	{
		if (units[i].isOnField)
		{
			//��� ����
			draw_circle(units[i].x, units[i].y, units[i].size, lineWidth = 1, strokeStyle = 'black', fillStyle = units[i].color, setLineDash = []);
			//������ ����� ��� �������
			var red = Math.round(units[i].size*2*((units[i].initialHealth - units[i].currentHealth) / units[i].initialHealth), 0);
			var green = units[i].size*2 - red;
			draw_line(units[i].x + units[i].size, units[i].y - units[i].size - 5, units[i].x + units[i].size - red, units[i].y - units[i].size - 5, lineWidth = 5, fillStyle = 'red', setLineDash = []);
			draw_line(units[i].x - units[i].size, units[i].y - units[i].size - 5, units[i].x - units[i].size + green, units[i].y - units[i].size - 5, lineWidth = 5, fillStyle = 'lightgreen', setLineDash = []);
		}
	}
}

//��������� ��������
function draw_bullets()
{
	bullets.forEach(function(item, i, arr){
		draw_circle(item.x, item.y, 3, lineWidth = 1, strokeStyle = 'black', fillStyle = 'yellow', setLineDash = []);
	});
}

