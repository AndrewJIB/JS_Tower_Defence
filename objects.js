//������ "������"
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

//������ "������"
function Bullet(x, y, targetX, targetY, targetId, parentTowerSpaceId, k_trajectory)
{
	this.x = x;//����������
	this.y = y;
	this.targetX = targetX;//���������� ����
	this.targetY = targetY;
	this.targetId = targetId;//ID ���� (�����)
	this.parentTowerSpaceId = parentTowerSpaceId;//ID ����� �� ����, ������ ������� ������
	this.k_trajectory = k_trajectory;//����� ����� ���� ������ ������
}

