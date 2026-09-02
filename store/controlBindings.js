const KEY = 'taters-control-bindings'

export const CONTROL_ACTIONS = [
	{ id: 'throttle', name: 'Gas' },
	{ id: 'brake', name: 'Brake' },
	{ id: 'steer', name: 'Steer' },
	{ id: 'camera', name: 'Camera Look' },
	{ id: 'horn', name: 'Horn' },
	{ id: 'drift', name: 'Drift' },
	{ id: 'reset', name: 'Reset' },
	{ id: 'lights', name: 'Lights' },
	{ id: 'cameraCycle', name: 'Change Camera' },
	{ id: 'nitro', name: 'Nitro' },
]

export const DEFAULT_BINDINGS = {
	throttle: { kind: 'button', index: 7, label: 'Right Trigger (RT)', key: 'w' },
	brake: { kind: 'button', index: 6, label: 'Left Trigger (LT)', key: 's' },
	steer: { kind: 'axis', index: 0, sign: 1, label: 'Left Stick X' },
	camera: { kind: 'stick', xAxis: 2, yAxis: 3, invertY: 1, label: 'Right Stick' },
	horn: { kind: 'button', index: 2, label: 'X', key: 'h' },
	drift: { kind: 'button', index: 5, label: 'RB', key: 'Shift' },
	reset: { kind: 'button', index: 1, label: 'B', key: 'r' },
	lights: { kind: 'key', key: 'l', label: 'L' },
	cameraCycle: { kind: 'button', index: 3, label: 'Y', key: 'c' },
	nitro: { kind: 'button', index: 0, label: 'A', key: 'n' },
}

export function getBindings() {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
		return { ...DEFAULT_BINDINGS, ...saved }
	} catch {
		return { ...DEFAULT_BINDINGS }
	}
}

export function saveBindings(next) {
	localStorage.setItem(KEY, JSON.stringify(next))
}

export function resetBindings() {
	localStorage.removeItem(KEY)
	return { ...DEFAULT_BINDINGS }
}
const SENS_KEY = 'taters-stick-sensitivity'
export const DEFAULT_STICK_SENSITIVITY = { left: 100, right: 100 }

function clampSens(v) {
	const n = Number(v)
	if (!Number.isFinite(n)) return 100
	return Math.min(100, Math.max(0, Math.round(n)))
}

let cachedSens = null

export function getStickSensitivity() {
	if (cachedSens) return cachedSens
	try {
		const saved = JSON.parse(localStorage.getItem(SENS_KEY) || '{}')
		cachedSens = { left: clampSens(saved.left ?? 100), right: clampSens(saved.right ?? 100) }
	} catch {
		cachedSens = { ...DEFAULT_STICK_SENSITIVITY }
	}
	return cachedSens
}

export function saveStickSensitivity(next) {
	cachedSens = { left: clampSens(next.left), right: clampSens(next.right) }
	localStorage.setItem(SENS_KEY, JSON.stringify(cachedSens))
}

export function resetStickSensitivity() {
	localStorage.removeItem(SENS_KEY)
	cachedSens = { ...DEFAULT_STICK_SENSITIVITY }
	return cachedSens
}