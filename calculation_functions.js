//��������� ID ����� ��� ������������� �� �� ��������
function getTowerIdByName(name)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == name && game_towers[i].level == 1) return i;
	}
}

//��������� ID ���������� ������
function getNextLevelId(tower_id)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == game_towers[tower_id].name && game_towers[i].level == game_towers[tower_id].level + 1) return i;
	}
	
	return undefined;
}

//��������� ID ����������� ������
function getPreviousLevelId(tower_id)
{
	for (var i=0; i<game_towers.length; i++)
	{
		if (game_towers[i].name == game_towers[tower_id].name && game_towers[i].level == game_towers[tower_id].level - 1) return i;
	}
	
	return undefined;
}

//��������� ���������� �����
function getDestroyPrice(tower_id)
{
	var destroy_cost = game_towers[tower_id].price;
	
	//���������� ������� ��� ���������� ������
	if (game_towers[tower_id].level > 1) destroy_cost = destroy_cost + getDestroyPrice(getPreviousLevelId(tower_id));
	
	return Math.round(destroy_cost*DESTROY_COEFF);
}

//�������� �� ����� � ����
function isPointInCircle(circle_x, circle_y, circle_radius, point_x, point_y)
{
	if ((circle_x-point_x)*(circle_x-point_x) + (circle_y-point_y)*(circle_y-point_y) <= circle_radius*circle_radius) return true;
	
	return false;
}

//�������� �� ����� � �������������
function isPointInRectangle(x, y, x2, y2, point_x, point_y)
{
	if (point_x >= x && point_x <= x2 && point_y >= y && point_y <= y2) return true;
	
	return false;
}

//������� � ������� � �������
function degToRad (deg)
{
	return deg / 180 * Math.PI;
}

function radToDeg (rad)
{
	return rad / Math.PI * 180;
}

//��������� ������ ��� ������
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

//���������� ����� �������
function distance(x1, y1, x2, y2)
{
	return Math.pow((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1), 0.5);
}

//������� ���������� ����� �������
function distance_q(x1, y1, x2, y2)
{
	return (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
}

//������ ��������� ����� �� ����������
function calculate_next_point_on_trajectory(x, y, targetX, targetY, towerX, towerY, trajectory, bullet_speed, k_trajectory)
{
	var newXY = [];
	newXY['goal'] = 0;
	
	if (trajectory == 'line')//������ ��������
	{
		var full_distance = distance(x, y, targetX, targetY);
		var part_distance = bullet_speed/FPS;//����� ���������� ������� ������ �� ���� ���
		var k_distance = part_distance/full_distance;//����� ����� �� ������ ���������� ������� ������ �� ���� ���
		
		newXY['x'] = x + (targetX - x)*k_distance;
		newXY['y'] = y + (targetY - y)*k_distance;

		//��������� � ����
		if (part_distance >= full_distance) newXY['goal'] = 1;
	}
	
	if (trajectory == 'arc')//�� ��������
	{
		var full_distance = distance(towerX, towerY, targetX, targetY);
		var part_distance = bullet_speed/FPS;//����� ���������� ������� ������ �� ���� ���
		var k_distance = part_distance/full_distance;//����� ����� �� ������ ���������� ������� ������ �� ���� ���
		
		if (targetY > towerY) y2 = targetY - (targetY - towerY) - DELTA_BEZIER;
		else y2 = towerY - (towerY - targetY) - DELTA_BEZIER;
		x2 = towerX + (targetX - towerX)/2;
		
		var t = k_trajectory + k_distance;
		newXY['t'] = t;
		
		newXY['x'] = Math.pow(1 - t, 2)*towerX + 2*(1 - t)*t*x2 + Math.pow(t, 2)*targetX;
		newXY['y'] = Math.pow(1 - t, 2)*towerY + 2*(1 - t)*t*y2 + Math.pow(t, 2)*targetY;

		//��������� � ����
		if (t >= 1) newXY['goal'] = 1;
	}
	
	//console.log('before', x, y, targetX, targetY, trajectory, bullet_speed);
	//console.log('after', full_distance, part_distance, newXY['x'], newXY['y']);
	return newXY;
}















