import { useMemo, useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Vector3, Quaternion } from 'three'
import { shallow } from 'zustand/shallow'

import useGameStore, { vehicleState } from '../../../store/gameStore'
import vehicleConfigs from '../../../config/vehicles'
import useVehicleSync from '../../../hooks/useVehicleSync'
import useVehiclePhysics from '../../../hooks/useVehiclePhysics'
import useVehicleBroadcast from '../../../hooks/useVehicleBroadcast'
import useVehicleDimensions from '../../../hooks/useVehicleDimensions'

import VehicleAudio from './VehicleAudio'
import WheelParticles from './WheelParticles'
import TireTracks from './TireTracks'
import Wheels from './Wheels'
import VehicleBody from './VehicleBody'

const SCALE = 0.40 // must match hooks/useVehiclePhysics.js

const Vehicle = ({ spawnPosition = [0, 0, 0], spawnRotation = [0, 0, 0] }) => {
	useVehicleSync()

	const currentVehicle = useGameStore((state) => state.currentVehicle, shallow)
	const config = useMemo(
		() => ({
			...vehicleConfigs.defaults,
			...currentVehicle,
		}),
		[currentVehicle]
	)

	const performanceDegraded = useGameStore((state) => state.performanceDegraded)
	const isMobile = useGameStore((state) => state.isMobile)

	const chassisRef = useRef(null)
	const chassisGroupRef = useRef(null)
	const bodyRef = useRef(null)
	const wheelRefsArray = useRef([{ current: null }, { current: null }, { current: null }, { current: null }])
	const wheelRefs = wheelRefsArray.current

	const { axleHeight, vehicleHeight, wheelbase, wheelPositions } = useVehicleDimensions(config)

	const wheelWidth = (config.rim_width * 2.54) / 100

		const physicsWheels = useMemo(() => {
		return wheelPositions.map((wheel, i) => ({
			ref: wheelRefs[i],
			axleCs: new Vector3(1, 0, 0),
			position: new Vector3(...wheel.position),
			suspensionDirection: new Vector3(0, -1, 0),
			maxSuspensionTravel: 0.3,
			suspensionRestLength: 0.1,
			suspensionStiffness: 28,
			radius: (config.tire_diameter * 2.54) / 100 / 2,
		}))
	}, [wheelPositions, config.tire_diameter])

	const { vehicleController } = useVehiclePhysics(chassisRef, physicsWheels)

	useVehicleBroadcast(chassisRef, vehicleController)

	const tempWorldPos = useMemo(() => new Vector3(), [])
	const tempQuat = useMemo(() => new Quaternion(), [])

	useFrame(() => {
		if (!chassisGroupRef.current) return

		chassisGroupRef.current.getWorldPosition(tempWorldPos)
		chassisGroupRef.current.getWorldQuaternion(tempQuat)

		vehicleState.position.copy(tempWorldPos)

		const sinYaw = 2 * (tempQuat.w * tempQuat.y + tempQuat.x * tempQuat.z)
		const cosYaw = 1 - 2 * (tempQuat.y * tempQuat.y + tempQuat.x * tempQuat.x)
		vehicleState.heading = Math.atan2(sinYaw, cosYaw)
	})

	// Box SIZE is scaled. Position is NOT — it stays the center.
	const colliderArgs = useMemo(
		() => [0.8 , 0.4 , (wheelbase / 2 + axleHeight)],
		[wheelbase, axleHeight]
	)
	const colliderPosition = useMemo(() => [0, 1, 0], [])
	const colliderMass = useMemo(
		() => 8 * 0.8 * 0.4 * (wheelbase / 2 + axleHeight),
		[wheelbase, axleHeight]
	)

	return (
		<>
			<RigidBody
				ref={chassisRef}
				type='dynamic'
				position={spawnPosition}
				rotation={spawnRotation}
				colliders={false}
				canSleep={false}
				linearDamping={0.05}
				angularDamping={1}
			>
				<CuboidCollider args={colliderArgs} position={colliderPosition} mass={colliderMass} />
				<group ref={chassisGroupRef} name='Vehicle' scale={[SCALE, SCALE, SCALE]}>
					<VehicleAudio />
					<Suspense fallback={null}>
						<VehicleBody
							ref={bodyRef}
							key={config.body}
							id={config.body}
							height={vehicleHeight}
							color={config.color}
							roughness={config.roughness}
							addons={config.addons}
							lighting={config.lighting}
						/>
					</Suspense>
					<Wheels
						rim={config.rim}
						rim_diameter={config.rim_diameter}
						rim_width={config.rim_width}
						rim_color={config.rim_color}
						rim_color_secondary={config.rim_color_secondary}
						tire={config.tire}
						tire_diameter={config.tire_diameter}
						tire_muddiness={config.tire_muddiness}
						color={config.color}
						roughness={config.roughness}
						wheelPositions={wheelPositions}
						wheelRefs={wheelRefs}
						spare={config.spare}
						bodyId={config.body}
						bodyRef={bodyRef}
					/>
				</group>
			</RigidBody>
			{!performanceDegraded && !isMobile && (
				<>
					<WheelParticles vehicleController={vehicleController} wheelRefs={wheelRefs} wheelRadius={axleHeight} wheelWidth={wheelWidth} />
					<TireTracks vehicleController={vehicleController} wheelRefs={wheelRefs} tireWidth={wheelWidth} tireRadius={axleHeight} />
				</>
			)}
		</>
	)
}

export default Vehicle