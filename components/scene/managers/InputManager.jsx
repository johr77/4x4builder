import { getBindings, getStickSensitivity } from '../../../store/controlBindings'
import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useInputStore from '../../../store/inputStore'
import useMultiplayerStore from '../../../store/multiplayerStore'
import useGameStore from '../../../store/gameStore'

// Standard gamepad button/axis indices (Xbox layout)
const GAMEPAD = {
	AXIS_LEFT_X: 0,
	AXIS_LEFT_Y: 1,
	AXIS_RIGHT_X: 2,
	AXIS_RIGHT_Y: 3,
	BUTTON_A: 0,
	BUTTON_B: 1,
	BUTTON_X: 2,
	BUTTON_Y: 3,
	BUTTON_LB: 4,
	BUTTON_RB: 5,
	BUTTON_LT: 6,
	BUTTON_RT: 7,
}

/**
 * Component to handle all input sources:
 * - Keyboard input
 * - Standard gamepad input
 * - Touch joystick input (via touchInput in store)
 */
const InputManager = () => {
	const setKey = useInputStore((state) => state.setKey)
	const setInput = useInputStore((state) => state.setInput)

	// Setup keyboard event listeners
	useEffect(() => {
		// Normalize key to handle Shift+key case changes
		// e.g., pressing 'w' then Shift will fire keyup as 'W'
		const normalizeKey = (key) => {
			if (!key) return key
			// Only normalize single character keys (letters)
			if (key.length === 1) {
				return key.toLowerCase()
			}
			return key
		}

		const handleKeyDown = (e) => {
			// Ignore keyboard input when a modal or chat is open
			if (useGameStore.getState().notification) return
			if (useMultiplayerStore.getState().chatOpen) return
			setKey(normalizeKey(e.key), true)
		}
		const handleKeyUp = (e) => {
			// Always process key up to prevent stuck keys
			setKey(normalizeKey(e.key), false)
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
		}
	}, [setKey])

	// Poll all input sources every frame and combine them
		useFrame(() => {
		const touchInput = useInputStore.getState().touchInput
		const keys = useInputStore.getState().keys
		let input = {
			leftStickX: touchInput.leftStickX,
			leftStickY: touchInput.leftStickY,
			rightStickX: touchInput.rightStickX,
			rightStickY: touchInput.rightStickY,
			leftTrigger: 0,
			rightTrigger: 0,
			buttonA: false,
			buttonB: false,
			buttonX: false,
			buttonY: false,
			leftBumper: false,
			rightBumper: false,
		}

		const gamepad = navigator.getGamepads()[0]
		if (gamepad) {
			input.leftStickX = gamepad.axes[GAMEPAD.AXIS_LEFT_X] ?? 0
			input.leftStickY = gamepad.axes[GAMEPAD.AXIS_LEFT_Y] ?? 0
			input.rightStickX = gamepad.axes[GAMEPAD.AXIS_RIGHT_X] ?? 0
			input.rightStickY = gamepad.axes[GAMEPAD.AXIS_RIGHT_Y] ?? 0
			input.leftTrigger = gamepad.buttons[GAMEPAD.BUTTON_LT]?.value ?? 0
			input.rightTrigger = gamepad.buttons[GAMEPAD.BUTTON_RT]?.value ?? 0
			input.buttonA = gamepad.buttons[GAMEPAD.BUTTON_A]?.pressed ?? false
			input.buttonB = gamepad.buttons[GAMEPAD.BUTTON_B]?.pressed ?? false
			input.buttonX = gamepad.buttons[GAMEPAD.BUTTON_X]?.pressed ?? false
			input.buttonY = gamepad.buttons[GAMEPAD.BUTTON_Y]?.pressed ?? false
			input.leftBumper = gamepad.buttons[GAMEPAD.BUTTON_LB]?.pressed ?? false
			input.rightBumper = gamepad.buttons[GAMEPAD.BUTTON_RB]?.pressed ?? false
		}

				const bindings = getBindings()
		const { left: leftSens, right: rightSens } = getStickSensitivity()
		const ls = leftSens / 100
		const rs = rightSens / 100
		const stickScale = (axisIndex) => (axisIndex === 2 || axisIndex === 3 ? rs : ls)

		const read = (binding) => {
			if (!binding) return 0
			let v = 0
			if (binding.key && keys?.has?.(binding.key)) v = 1
			if (binding.kind === 'key') return keys?.has?.(binding.key) ? 1 : v
			if (!gamepad) return v
			if (binding.kind === 'button') return Math.max(v, gamepad.buttons[binding.index]?.value ?? 0)
			if (binding.kind === 'axis') return (gamepad.axes[binding.index] ?? 0) * (binding.sign ?? 1)
			return v
		}

		input.rightTrigger = Math.max(0, read(bindings.throttle))
		input.leftTrigger = Math.max(0, read(bindings.brake))

		input.leftStickY *= ls
		input.rightStickX *= rs
		input.rightStickY *= rs

		const steerAxis = bindings.steer?.kind === 'axis' ? bindings.steer.index : 0
		input.leftStickX = read(bindings.steer) * stickScale(steerAxis)

		if (bindings.camera?.kind === 'stick' && gamepad) {
			const camScale = stickScale(bindings.camera.xAxis)
			input.lookX = (gamepad.axes[bindings.camera.xAxis] ?? 0) * camScale
			input.lookY = (gamepad.axes[bindings.camera.yAxis] ?? 0) * (bindings.camera.invertY ?? 1) * camScale
		} else {
			input.lookX = input.rightStickX || 0
			input.lookY = input.rightStickY || 0
		}
		input.horn = read(bindings.horn) > 0.5
		input.drift = read(bindings.drift) > 0.5
		input.reset = read(bindings.reset) > 0.5
		input.lights = read(bindings.lights) > 0.5
		input.cameraCycle = read(bindings.cameraCycle) > 0.5
		setInput(input)
	})

	return null
}

export default InputManager
