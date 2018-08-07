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
											destroy_price=null,
											fire_range=90,
											fire_speed=1000,
											bullet='arrow',
											bullet_speed=100,
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
											destroy_price=null,
											fire_range=100,
											fire_speed=1000,
											bullet='arrow',
											bullet_speed=100,
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
											destroy_price=null,
											fire_range=80,
											fire_speed=1000,
											bullet='ray',
											bullet_speed=300,
											trajectory='line',
											damage=5,
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
											destroy_price=null,
											fire_range=75,
											fire_speed=1500,
											bullet='bomb',
											bullet_speed=50,
											trajectory='arc',
											damage=5,
											damage_type='phisical',
											damage_radius=30,
											affected_targets='ground',
											effects=[false, false],
											effect_damage=[],
											effect_time=[]
										));

function Tower(name, level, price, destroy_price, fire_range, fire_speed, bullet, bullet_speed, trajectory, damage, damage_type, damage_radius, affected_targets, effects, effect_damage, effect_time)
{
	this.name = name;//название
	this.level = level;//уровень
	this.price = price;//стоимость
	this.destroy_price = destroy_price;//стоимость
	this.fire_range = fire_range;//миллисекунд между выстрелами
	this.fire_speed = fire_speed;//миллисекунд между выстрелами
	this.bullet = bullet;//вид снаряда (arrow, ray, bomb)
	this.bullet_speed = bullet_speed;//скорость снаряда, точек в секунду
	this.trajectory = trajectory;//траектория (line, arc)
	this.damage = damage;//урон
	this.damage_type = damage_type;//тип урона (phisical, magical)
	this.damage_radius = damage_radius;//радиус поражения (0 - поражение только одной цели)
	this.affected_targets = affected_targets;//по кому бьет (ground, air, all)
	this.effects = effects;//эффекты от попадания - массив (замедление, горение). например [true, false] означает замедление - да, горение - нет
	this.effect_damage = effect_damage;//урон от эффектов - массив []
	this.effect_time = effect_time;//время действия эффектов в миллисекундах - массив []
}

