import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { useNavigate } from 'react-router-dom'
import Vehicle from '../scene/vehicles/Vehicle'
import CameraManager from '../scene/managers/CameraManager'
import InputManager from '../scene/managers/InputManager'
import Loader from './Loader'
import Speedometer from './Speedometer'

function DirtGround() {
	return (
		<RigidBody type='fixed' colliders={false}>
			<CuboidCollider args={[80, 0.5, 80]} position={[0, -0.5, 0]} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow name='Terrain'>
				<planeGeometry args={[160, 160]} />
				<meshStandardMaterial color='#9a6b32' />
			</mesh>
		</RigidBody>
	)
}

export default function RaceTrack() {
	const navigate = useNavigate()

	return (
		<div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1208' }}>
			<Canvas shadows camera={{ position: [-4, 2, 8], fov: 40 }}>
				<color attach='background' args={['#87a0b8']} />
				<fog attach='fog' args={['#87a0b8', 50, 140]} />
				<ambientLight intensity={0.6} />
				<hemisphereLight args={['#cfe8ff', '#8B6914', 0.45]} />
				<directionalLight position={[40, 60, 20]} intensity={1.2} castShadow />
				<Suspense fallback={<Loader />}>
					<CameraManager />
					<InputManager />
					<Physics>
						<Vehicle />
						<DirtGround />
					</Physics>
				</Suspense>
			</Canvas>

			<div
				style={{
					position: 'absolute',
					top: 16,
					left: 16,
					right: 16,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					zIndex: 20,
					pointerEvents: 'none',
				}}
			>
				<button
					onClick={() => navigate('/taters/races')}
					style={{
						pointerEvents: 'auto',
						background: '#1a1208cc',
						color: '#f4e6c8',
						border: '1px solid #f4e6c855',
						borderRadius: 6,
						padding: '8px 14px',
						cursor: 'pointer',
					}}
				>
					Back
				</button>
				<div style={{ color: 'white', fontWeight: 700, textShadow: '0 1px 4px #000' }}>Race 1</div>
				<div />
			</div>

			<Speedometer />
		</div>
	)
}