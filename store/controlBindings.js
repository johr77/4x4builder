const KEY = 'taters-control-bindings'

export const DEFAULT_BINDINGS = {
	throttle: { kind: 'button', index: 7, label: 'Right Trigger (RT)' },
	brake: { kind: 'button', index: 6, label: 'Left Trigger (LT)' },
	steer: { kind: 'axis', index: 0, sign: 1, label: 'Left Stick X' },
	camera: { kind: 'stick', xAxis: 2, yAxis: 3, invertY: 1, label: 'Right Stick' },
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