export const MAP_SIZE = 156
export const PARTS_ACROSS = 10
export const SIZE = MAP_SIZE / PARTS_ACROSS // 15.6 — 10 parts between fences
export const LAYERS = 5
export const LAYER_HEIGHT = 3
export const OUTER_HEIGHT = LAYERS * LAYER_HEIGHT // 15
export const WALL = 0.5

export const COLORS = {
	outer: '#4a3728',
	inner: '#5a4330',
	road: '#5c4324',
	roadDark: '#3d2c18',
	rut: '#2a1c10',
	puddle: '#1c2a24',
	puddleRim: '#3a3420',
}