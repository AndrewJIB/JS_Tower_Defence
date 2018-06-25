var game_towers = [];

//сначала всегда пустое поле
game_towers.push(new Tower(
											'Empty space'
										));
//остальные башни
game_towers.push(new Tower(
											'Archery tower',
											level=1,
											price=50,
											destroy_price=0,
											fire_speed=1000,
											bullet='arrow',
											trajectory='arc',
											damage=5,
											damage_type='phisical',
											damage_radius=0,
											affected_targets='all',
											effects=[false, false],
											effect_damage=[],
											effect_time=[]
										));
game_towers.push(new Tower(
											'Archery tower',
											level=2,
											price=75,
											destroy_price=0,
											fire_speed=1000,
											bullet='arrow',
											trajectory='arc',
											damage=7,
											damage_type='phisical',
											damage_radius=0,
											affected_targets='all',
											effects=[false, false],
											effect_damage=[],
											effect_time=[]
										));
game_towers.push(new Tower(
											'Mage tower',
											level=1,
											price=75,
											destroy_price=0,
											fire_speed=1000,
											bullet='ray',
											trajectory='straight',
											damage=10,
											damage_type='magical',
											damage_radius=0,
											affected_targets='all',
											effects=[false, false],
											effect_damage=[],
											effect_time=[]
										));
game_towers.push(new Tower(
											'Bomberman',
											level=1,
											price=100,
											destroy_price=0,
											fire_speed=1500,
											bullet='bomb',
											trajectory='arc',
											damage=5,
											damage_type='phisical',
											damage_radius=30,
											affected_targets='ground',
											effects=[false, false],
											effect_damage=[],
											effect_time=[]
										));

function Tower(name, level, price, destroy_price, fire_speed, bullet, trajectory, damage, damage_type, damage_radius, affected_targets, effects, effect_damage, effect_time)
{
	this.name = name;//название
	this.level = level;//уровень
	this.price = price;//стоимость
	this.destroy_price = destroy_price;//стоимость
	this.fire_speed = fire_speed;//миллисекунд между выстрелами
	this.bullet = bullet;//вид снаряда (arrow, ray, bomb)
	this.trajectory = trajectory;//траектория (straight, arc)
	this.damage = damage;//урон
	this.damage_type = damage_type;//тип урона (phisical, magical)
	this.damage_radius = damage_radius;//радиус поражения (0 - поражение только одной цели)
	this.affected_targets = affected_targets;//по кому бьет (ground, air, all)
	this.effects = effects;//эффекты от попадания - массив (замедление, горение). например [true, false] означает замедление - да, горение - нет
	this.effect_damage = effect_damage;//урон от эффектов - массив []
	this.effect_time = effect_time;//время действия эффектов в миллисекундах - массив []
}

