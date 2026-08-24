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