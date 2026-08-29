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
const SCALE = 0.250
// Vehicle component with physics
const Vehicle = ({ spawnPosition = [0, 0, 0], spawnRotation = [0, 0, 0] }) => {
	// Sync vehicle config changes to multiplayer server
	useVehicleSync()

	// Get current vehicle config from store and merge with defaults
	const currentVehicle = useGameStore((state) => state.currentVehicle, shallow)
	const config = useMemo(
		() => ({
			...vehicleConfigs.defaults,
			...currentVehicle,
		}),
		[currentVehicle]
	)

	// Get vehicle store
	const performanceDegraded = useGameStore((state) => state.performanceDegraded)
	const isMobile = useGameStore((state) => state.isMobile)

	const chassisRef = useRef(null)
	const chassisGroupRef = useRef(null) // Reference to the visual group that follows interpolated physics
	const bodyRef = useRef(null) // Reference to body group for spare wheel to follow
	const wheelRefsArray = useRef([{ current: null }, { current: null }, { current: null }, { current: null }])
	const wheelRefs = wheelRefsArray.current

	// Get vehicle dimensions and wheel positions from shared hook
	const { axleHeight, vehicleHeight, wheelbase, wheelPositions } = useVehicleDimensions(config)

	// Convert wheel width from inches to meters
	const wheelWidth = (config.rim_width * 2.54) / 100

	// Create wheel configurations
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

	// Use vehicle physics
	const { vehicleController } = useVehiclePhysics(chassisRef, physicsWheels)

	// Broadcast transform to multiplayer server
	useVehicleBroadcast(chassisRef, vehicleController)

	// Reusable vectors/quaternions to avoid GC pressure
	const tempWorldPos = useMemo(() => new Vector3(), [])
	const tempQuat = useMemo(() => new Quaternion(), [])

	// Update vehicle position for camera and other systems each frame
	// Use the visual group's world position which is interpolated by Rapier
	useFrame(() => {
		if (!chassisGroupRef.current) return

		// Get interpolated world position and quaternion from the visual group
		chassisGroupRef.current.getWorldPosition(tempWorldPos)
		chassisGroupRef.current.getWorldQuaternion(tempQuat)

		// Update vehicle position for camera and other systems
		vehicleState.position.copy(tempWorldPos)

		// Calculate heading (yaw) from quaternion for minimap
		const sinYaw = 2 * (tempQuat.w * tempQuat.y + tempQuat.x * tempQuat.z)
		const cosYaw = 1 - 2 * (tempQuat.y * tempQuat.y + tempQuat.x * tempQuat.x)
		vehicleState.heading = Math.atan2(sinYaw, cosYaw)
	})

	// Collider props
	// colliderArgs
	// 1st (0.9),half width,Left–right.
	// 2nd (0.5),half height,Up–down. Full height = 1.0,
	// 3rd (wheelbase / 2 + axleHeight),half length,Front–back,
	// Bigger = nose/tail hit jumps and ramps sooner
	const colliderArgs = useMemo(() => [.2,.12,(wheelbase / 2 + axleHeight) * .3], [wheelbase, axleHeight])
	// colliderPosition
	// 1st (0),left / right,Keep 0,—
	// 2nd (1),up / down,Center of the box. 
	// 3rd (0),forward / back,Keep 0,—
	const colliderPosition = useMemo(() => [0,.2 ,-0.04])

	return (
		<>
			<RigidBody ref={chassisRef} type='dynamic' position={spawnPosition}
							rotation={spawnRotation} colliders={false} canSleep={false} linearDamping={0.05} angularDamping={1}>
				<CuboidCollider args={colliderArgs} position={colliderPosition} mass={20} />
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
