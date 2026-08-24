import TrackLoop from '../track/TrackLoop'
import { SIZE, PARTS_ACROSS } from '../track/TrackConstants'
import Sky from '../scene/environment/Sky'
import Sun from '../scene/environment/Sun'
import EnvMap from '../scene/environment/EnvMap'
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
				<meshStandardMaterial color='#2a1c10' />
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow name='Terrain'></mesh>
			</mesh>
		</RigidBody>
	)
}
function GuardrailFence({ size = 156 }) {
	const half = size / 2
	const wallH = 1.1
	const steel = '#c5ced4'
	const steelDark = '#8d969c'
	const postColor = '#5b6268'
	const postSpacing = 4
	const postCount = Math.round(size / postSpacing)

	const posts = []
	for (let i = 0; i <= postCount; i++) {
		const t = -half + (i * size) / postCount
		posts.push([t, 0, half], [t, 0, -half], [half, 0, t], [-half, 0, t])
	}

	const rail = (pos, args, color) => (
		<mesh position={pos} castShadow receiveShadow>
			<boxGeometry args={args} />
			<meshStandardMaterial color={color} metalness={0.85} roughness={0.35} />
		</mesh>
	)

	return (
		<>
			{/* Invisible walls so you cannot drive off */}
			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[half, wallH / 2, 0.18]} position={[0, wallH / 2, half]} />
				<CuboidCollider args={[half, wallH / 2, 0.18]} position={[0, wallH / 2, -half]} />
				<CuboidCollider args={[0.18, wallH / 2, half]} position={[half, wallH / 2, 0]} />
				<CuboidCollider args={[0.18, wallH / 2, half]} position={[-half, wallH / 2, 0]} />
			</RigidBody>

			{/* Posts */}
			{posts.map((p, i) => (
				<mesh key={i} position={[p[0], 0.55, p[2]]} castShadow>
					<boxGeometry args={[0.12, 1.1, 0.12]} />
					<meshStandardMaterial color={postColor} metalness={0.6} roughness={0.45} />
				</mesh>
			))}

			{/* Two steel rails on each side */}
			{rail([0, 0.38, half], [size, 0.16, 0.08], steel)}
			{rail([0, 0.72, half], [size, 0.16, 0.08], steelDark)}
			{rail([0, 0.38, -half], [size, 0.16, 0.08], steel)}
			{rail([0, 0.72, -half], [size, 0.16, 0.08], steelDark)}
			{rail([half, 0.38, 0], [0.08, 0.16, size], steel)}
			{rail([half, 0.72, 0], [0.08, 0.16, size], steelDark)}
			{rail([-half, 0.38, 0], [0.08, 0.16, size], steel)}
			{rail([-half, 0.72, 0], [0.08, 0.16, size], steelDark)}
		</>
	)
}
const spawnZ = -((PARTS_ACROSS * SIZE) / 2) + SIZE / 2
export default function RaceTrack() {
	const navigate = useNavigate()

	return (
		<div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1208' }}>
			<Canvas shadows camera={{ position: [-4, 2, 8], fov: 40 }}>
							<fog attach='fog' args={['#dbebf9', 150, 450]} />
				<ambientLight intensity={0.35} />
				<Sun />
				<Sky />
				<EnvMap />
				<Suspense fallback={<Loader />}>
				<CameraManager forceMode='chase' chaseOffset={[0, 1.6, -5]} chaseLookAt={[0, 0.7, 4]} />
					<InputManager />
					<Physics>
					<Vehicle spawnPosition={[0, 0.8, spawnZ]} spawnRotation={[0, Math.PI / 2, 0]} />
						<DirtGround />
                        <GuardrailFence />
                        <TrackLoop />
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