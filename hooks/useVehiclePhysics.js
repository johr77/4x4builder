import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useRapier, useAfterPhysicsStep } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { Vector3, Quaternion } from 'three'

import useGameStore, { vehicleState } from '../store/gameStore'
import useVehicleInput from './useVehicleInput'
import useBuoyancy from './useBuoyancy'

const SCALE = 0.40 // must match Vehicle.jsx

const RESET_POSITION = { x: 0, y: 1, z: 0 }
const RESET_ROTATION = { x: 0, y: 0, z: 0, w: 1 }

const VECTORS = {
	UP: new Vector3(0, 1, 0),
	RIGHT: new Vector3(1, 0, 0),
	DOWN: new Vector3(0, -1, 0),
	FORWARD: new Vector3(0, 0, 1),
}

const FORCES = {
	accelerate: 30,
	reverse: 15,
	brake: 0.5,
	engineBrake: 0.3,
	steerAngle: Math.PI / 6,
	airControl: 0.1,
}

const REVERSE_THRESHOLD = 0.5

const FRONT_WHEEL_FRICTION = 0.95
const REAR_WHEEL_FRICTION = 0.85

const TRANSMISSION = {
	gearRatios: [0, 3.5, 2.2, 1.4, 1.0, 0.75],
	finalDrive: 4.88,
	wheelRadius: 0.35,
	idleRpm: 850,
	maxRpm: 9000,
	redlineRpm: 7000,
	shiftCooldown: 0.4,
	parkEngageSpeed: 0.05,
	parkEngageDelay: 0.1,
}

const TORQUE_CURVE = [
	[850, 0.65],
	[1500, 0.78],
	[2000, 0.88],
	[2500, 0.94],
	[3000, 0.98],
	[3500, 1.0],
	[4000, 0.97],
	[4500, 0.92],
	[5000, 0.85],
	[5500, 0.75],
	[6000, 0.6],
	[6200, 0.5],
]

const getTorqueMultiplier = (rpm) => {
	if (rpm <= TORQUE_CURVE[0][0]) return TORQUE_CURVE[0][1]
	if (rpm >= TORQUE_CURVE[TORQUE_CURVE.length - 1][0]) return TORQUE_CURVE[TORQUE_CURVE.length - 1][1]

	for (let i = 0; i < TORQUE_CURVE.length - 1; i++) {
		const [rpm1, torque1] = TORQUE_CURVE[i]
		const [rpm2, torque2] = TORQUE_CURVE[i + 1]
		if (rpm >= rpm1 && rpm <= rpm2) {
			const t = (rpm - rpm1) / (rpm2 - rpm1)
			return torque1 + t * (torque2 - torque1)
		}
	}
	return 1.0
}

const getShiftUpRpm = (gear) => {
	if (gear <= 0) return TRANSMISSION.redlineRpm * 0.95
	const t = Math.min(gear - 1, 4) / 4
	const shiftPercent = 0.95 - 0.65 * Math.pow(t, 2.5)
	return TRANSMISSION.redlineRpm * shiftPercent
}

const getShiftDownRpm = (gear) => {
	if (gear <= 1) return TRANSMISSION.idleRpm
	const t = Math.min(gear - 1, 4) / 4
	const shiftPercent = 0.55 - 0.15 * Math.pow(t, 2.5)
	return Math.max(TRANSMISSION.redlineRpm * shiftPercent, TRANSMISSION.idleRpm)
}

export const useVehiclePhysics = (vehicleRef, wheels) => {
	const { world } = useRapier()

	const vehicleController = useRef()
	const isAirborne = useRef(false)
	const currentRearWheelFriction = useRef(null)

	const tempVelocity = useMemo(() => new Vector3(), [])
	const tempForward = useMemo(() => new Vector3(), [])
	const tempLocalTorque = useMemo(() => new Vector3(), [])
	const tempWorldTorque = useMemo(() => new Vector3(), [])
	const tempQuat = useMemo(() => new Quaternion(), [])
	const wheelQuat1 = useMemo(() => new Quaternion(), [])
	const wheelQuat2 = useMemo(() => new Quaternion(), [])

	const { applyBuoyancy } = useBuoyancy(vehicleRef)

	const smoothedLoad = useRef(0.5)
	const drivetrainAngularVel = useRef(TRANSMISSION.idleRpm * ((2 * Math.PI) / 60))
	const lastShiftTime = useRef(0)
	const canEngageReverse = useRef(false)
	const parkEngageTimer = useRef(0)
	const isInPark = useRef(false)

	const getVehicleInput = useVehicleInput()
	const toggleLights = useGameStore((state) => state.toggleLights)

	const resetVehicle = useCallback(() => {
		const vehicle = vehicleRef.current
		if (!vehicle) return

		const t = vehicle.translation()
		const r = vehicle.rotation()
		const yaw = Math.atan2(2 * (r.w * r.y + r.x * r.z), 1 - 2 * (r.y * r.y + r.x * r.x))

		vehicle.setTranslation({ x: t.x, y: t.y + 1.2, z: t.z }, true)
		vehicle.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true)
		vehicle.setLinvel({ x: 0, y: 0, z: 0 }, true)
		vehicle.setAngvel({ x: 0, y: 0, z: 0 }, true)
	}, [vehicleRef])

	useEffect(() => {
		if (!vehicleRef.current) return

		const vehicle = world.createVehicleController(vehicleRef.current)
		vehicle.setIndexForwardAxis = 2

		wheels.forEach((wheel, index) => {
			vehicle.addWheel(
				wheel.position,
				wheel.suspensionDirection || VECTORS.DOWN,
				wheel.axleCs || VECTORS.RIGHT,
				wheel.suspensionRestLength || 0.05,
				wheel.radius
			)
			vehicle.setWheelSuspensionStiffness(index, wheel.suspensionStiffness || 20)
			vehicle.setWheelMaxSuspensionTravel(index, wheel.maxSuspensionTravel || 0.23)
			vehicle.setWheelSuspensionCompression(index, wheel.suspensionCompression || 2.3)
			vehicle.setWheelSuspensionRelaxation(index, wheel.suspensionRebound || 3.4)
			if (index < 2) {
				vehicle.setWheelSideFrictionStiffness(index, FRONT_WHEEL_FRICTION)
			} else {
				vehicle.setWheelSideFrictionStiffness(index, REAR_WHEEL_FRICTION)
			}
		})

		vehicleController.current = vehicle

		if (currentRearWheelFriction.current === null) {
			currentRearWheelFriction.current = REAR_WHEEL_FRICTION
		}

		return () => {
			if (vehicleController.current) {
				world.removeVehicleController(vehicle)
				vehicleController.current = null
			}
		}
	}, [vehicleRef, wheels, world])

	useAfterPhysicsStep((world) => {
		const controller = vehicleController.current
		if (!controller) return

		controller.updateVehicle(world.timestep)

		let wheelsInContact = 0

		wheels.forEach((wheel, index) => {
			const wheelRef = wheel.ref.current
			if (!wheelRef) return

			const wheelAxleCs = controller.wheelAxleCs(index) || VECTORS.RIGHT
			const connection = controller.wheelChassisConnectionPointCs(index)
			const suspension = controller.wheelSuspensionLength(index) || 0
			const steering = controller.wheelSteering(index) || 0
			const rotation = controller.wheelRotation(index) || 0

			if (controller.wheelIsInContact(index)) {
				wheelsInContact++
			}

				wheelRef.position.y = connection?.y - suspension

			wheelQuat1.setFromAxisAngle(VECTORS.UP, steering)
			wheelQuat2.setFromAxisAngle(wheelAxleCs, rotation)
			wheelRef.quaternion.multiplyQuaternions(wheelQuat1, wheelQuat2)
		})

		const newAirborneState = wheelsInContact === 0
		if (newAirborneState !== isAirborne.current) {
			isAirborne.current = newAirborneState
		}
	})

	useFrame((state, delta) => {
		if (!vehicleController.current) return

		const vehicle = vehicleRef.current
		let forwardSpeed = 0
		if (vehicle) {
			const velocity = vehicle.linvel()
			tempForward.copy(VECTORS.FORWARD).applyQuaternion(vehicle.rotation())
			tempVelocity.set(velocity.x, velocity.y, velocity.z)
			forwardSpeed = tempVelocity.dot(tempForward)

			vehicleState.speed = forwardSpeed
			applyBuoyancy(delta)
		}

		const { throttleInput, brakeInput, brakeJustPressed, steerInput, isDrifting, shouldReset, shouldToggleLights, pitchInput, rollInput, yawInput } =
			getVehicleInput(delta, forwardSpeed)

		if (shouldReset) {
			resetVehicle()
		}

		if (shouldToggleLights) {
			toggleLights()
		}

		const targetFriction = isDrifting ? 0.1 : REAR_WHEEL_FRICTION
		const lerpFactor = isDrifting ? 0.15 : 0.0015
		if (currentRearWheelFriction.current === null) {
			currentRearWheelFriction.current = targetFriction
		} else {
			currentRearWheelFriction.current += (targetFriction - currentRearWheelFriction.current) * lerpFactor
		}

		if (wheels.length > 2) vehicleController.current.setWheelSideFrictionStiffness(2, currentRearWheelFriction.current)
		if (wheels.length > 3) vehicleController.current.setWheelSideFrictionStiffness(3, currentRearWheelFriction.current)

		const steerForce = FORCES.steerAngle * steerInput

		const absSpeed = Math.abs(forwardSpeed)
		const currentAngularVel = drivetrainAngularVel.current
		const currentRpmFromDrivetrain = (currentAngularVel * 60) / (2 * Math.PI)

		let currentGear = vehicleState.gear
		const gearRatio = TRANSMISSION.gearRatios[currentGear] || 1
		const totalRatio = gearRatio * TRANSMISSION.finalDrive

		const groundWheelAngularVel = absSpeed / TRANSMISSION.wheelRadius
		const groundEngineAngularVel = groundWheelAngularVel * totalRatio

		const currentTime = performance.now() / 1000

		if (absSpeed < TRANSMISSION.parkEngageSpeed && throttleInput === 0 && currentGear !== -1) {
			parkEngageTimer.current += delta
			if (parkEngageTimer.current >= TRANSMISSION.parkEngageDelay && !isInPark.current) {
				vehicleState.gear = 0
				isInPark.current = true
				currentGear = 0
			}
		} else if (absSpeed >= TRANSMISSION.parkEngageSpeed || throttleInput > 0) {
			parkEngageTimer.current = 0
		}

		if (isInPark.current && throttleInput > 0) {
			isInPark.current = false
			vehicleState.gear = 1
			currentGear = 1
			parkEngageTimer.current = 0
		}

		if (isInPark.current && brakeInput > 0) {
			isInPark.current = false
			parkEngageTimer.current = 0
		}

		const canShift = currentTime - lastShiftTime.current > TRANSMISSION.shiftCooldown

		if (!isAirborne.current && vehicleState.gear !== -1 && !isInPark.current) {
			const dynamicShiftUpRpm = getShiftUpRpm(currentGear)
			const dynamicShiftDownRpm = getShiftDownRpm(currentGear)
			if (canShift && currentRpmFromDrivetrain > dynamicShiftUpRpm && currentGear < TRANSMISSION.gearRatios.length - 1 && throttleInput > 0.3) {
				currentGear++
				vehicleState.gear = currentGear
				lastShiftTime.current = currentTime
			} else if (canShift && currentRpmFromDrivetrain < dynamicShiftDownRpm && currentGear > 1 && absSpeed > 0.5) {
				currentGear--
				vehicleState.gear = currentGear
				lastShiftTime.current = currentTime
			} else if (absSpeed < 0.5) {
				currentGear = 1
				vehicleState.gear = 1
			}
		}

		const idleAngularVel = TRANSMISSION.idleRpm * ((2 * Math.PI) / 60)
		const maxAngularVel = TRANSMISSION.maxRpm * ((2 * Math.PI) / 60)

		let angularAccel = 0

		const baseInertia = 0.15
		const wheelInertia = 1.0
		const drivetrainInertia = isAirborne.current ? baseInertia : baseInertia + wheelInertia

		const rpmNormalized = (currentAngularVel - idleAngularVel) / (maxAngularVel - idleAngularVel)
		const torqueFromCurve = getTorqueMultiplier(currentRpmFromDrivetrain)
		const throttleForce = throttleInput * 25.0 * torqueFromCurve
		angularAccel += throttleForce / drivetrainInertia

		const frictionBase = 0.3
		const frictionRpmScale = 1.5
		const internalFriction = frictionBase + rpmNormalized * frictionRpmScale
		angularAccel -= internalFriction / drivetrainInertia

		if (!isAirborne.current) {
			const baseCouplingStiffness = 12.0
			const velocityError = groundEngineAngularVel - currentAngularVel

			let couplingStiffness
			if (velocityError < 0 && throttleInput > 0.1) {
				couplingStiffness = baseCouplingStiffness * currentRearWheelFriction.current * currentRearWheelFriction.current
			} else {
				couplingStiffness = baseCouplingStiffness
			}

			angularAccel += (velocityError * couplingStiffness) / drivetrainInertia
		}

		if (currentAngularVel < idleAngularVel && throttleInput < 0.1) {
			const idleCorrection = (idleAngularVel - currentAngularVel) * 5.0
			angularAccel += idleCorrection / drivetrainInertia
		}

		const dt = 1 / 60
		drivetrainAngularVel.current += angularAccel * dt
		drivetrainAngularVel.current = Math.max(idleAngularVel * 0.9, Math.min(maxAngularVel, drivetrainAngularVel.current))

		vehicleState.rpm = (drivetrainAngularVel.current * 60) / (2 * Math.PI)
		vehicleState.rpm = Math.max(TRANSMISSION.idleRpm, Math.min(TRANSMISSION.maxRpm, vehicleState.rpm))

		let engineLoad = 0.1

		if (throttleInput > 0.05) {
			const rpmNorm = (vehicleState.rpm - TRANSMISSION.idleRpm) / (TRANSMISSION.maxRpm - TRANSMISSION.idleRpm)
			engineLoad += throttleInput * 0.4
			engineLoad += throttleInput * (1 - rpmNorm) * 0.3
			engineLoad += Math.min(0.2, absSpeed * 0.01)
			if (isAirborne.current) {
				engineLoad *= 0.4
			}
		}

		engineLoad = Math.max(0.05, Math.min(1.0, engineLoad))
		const loadLerpSpeed = 0.08
		smoothedLoad.current += (engineLoad - smoothedLoad.current) * loadLerpSpeed

		vehicleState.load = smoothedLoad.current
		vehicleState.throttle = throttleInput

		if (brakeJustPressed && Math.abs(forwardSpeed) < REVERSE_THRESHOLD) {
			canEngageReverse.current = true
		}

		if (brakeInput === 0) {
			canEngageReverse.current = false
		}

		if (throttleInput > 0 && vehicleState.gear === -1) {
			vehicleState.gear = 1
			canEngageReverse.current = false
		} else if (brakeInput > 0 && canEngageReverse.current && vehicleState.gear !== -1 && !isInPark.current) {
			vehicleState.gear = -1
			canEngageReverse.current = false
		}

		let engineForce = 0
		let brakeForce = 0

		if (isInPark.current || vehicleState.gear === 0) {
			engineForce = 0
			brakeForce = FORCES.brake * 2
		} else if (vehicleState.gear === -1) {
			engineForce = -FORCES.reverse * brakeInput
			brakeForce = FORCES.brake * throttleInput
		} else {
			if (brakeInput > 0) {
				engineForce = 0
				brakeForce = FORCES.brake * brakeInput
			} else if (throttleInput > 0) {
				const torqueMultiplier = getTorqueMultiplier(vehicleState.rpm)
				const currentGearRatio = TRANSMISSION.gearRatios[currentGear] || 1
				const gearMultiplier = currentGearRatio / TRANSMISSION.gearRatios[1]
				engineForce = FORCES.accelerate * throttleInput * torqueMultiplier * gearMultiplier
				const maxSpeed = 200 / 3.6
				if (forwardSpeed >= maxSpeed) {
					engineForce = 0
				} else if (forwardSpeed > maxSpeed * 0.9) {
					engineForce *= 1 - (forwardSpeed / maxSpeed - 0.9) / 0.1
				}
				brakeForce = 0
			} else if (forwardSpeed > 1.0) {
				const coastGearRatio = TRANSMISSION.gearRatios[currentGear] || 1
				const rpmFactor = Math.max(0, (vehicleState.rpm - TRANSMISSION.idleRpm) / (TRANSMISSION.maxRpm - TRANSMISSION.idleRpm))
				const brakingForce = FORCES.engineBrake * rpmFactor * coastGearRatio * TRANSMISSION.finalDrive
				engineForce = -brakingForce
				brakeForce = 0
			} else {
				engineForce = 0
				brakeForce = 0
			}
		}

		for (let i = 0; i < 2 && i < wheels.length; i++) {
			vehicleController.current.setWheelSteering(i, steerForce)
			vehicleController.current.setWheelEngineForce(i, -engineForce * 0.4)
		}

		for (let i = 2; i < 4 && i < wheels.length; i++) {
			vehicleController.current.setWheelEngineForce(i, -engineForce * 0.6)
		}

		for (let i = 0; i < wheels.length; i++) {
			vehicleController.current.setWheelBrake(i, brakeForce)
		}

		if (isAirborne.current && !vehicleState.isInWater) {
			if (vehicle) {
				tempLocalTorque.set(pitchInput, yawInput, rollInput)
				tempQuat.copy(vehicle.rotation())
				tempWorldTorque.copy(tempLocalTorque).applyQuaternion(tempQuat).multiplyScalar(FORCES.airControl)
				vehicle.applyTorqueImpulse(tempWorldTorque, true)
			}
		}

		if (!useGameStore.getState().physicsEnabled && (throttleInput > 0 || brakeInput > 0)) {
			useGameStore.getState().setPhysicsEnabled(true)
		}
	})

	return {
		vehicleController,
		resetVehicle,
	}
}

export default useVehiclePhysics