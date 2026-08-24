import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBindings, saveBindings, resetBindings } from '../../store/controlBindings'

const BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right']
const AXIS_NAMES = ['Left Stick X', 'Left Stick Y', 'Right Stick X', 'Right Stick Y']

const ACTIONS = [
	{ id: 'throttle', name: 'Gas' },
	{ id: 'brake', name: 'Brake' },
	{ id: 'steer', name: 'Steer' },
	{ id: 'camera', name: 'Camera' },
	{ id: 'horn', name: 'Horn' },
	{ id: 'drift', name: 'Drift' },
]

function labelFor(binding) {
	if (!binding) return 'Not set'
	if (binding.label) return binding.label
	if (binding.kind === 'stick') return binding.label || 'Stick'
	if (binding.kind === 'button') return BUTTON_NAMES[binding.index] || `Button ${binding.index}`
	if (binding.kind === 'axis') return AXIS_NAMES[binding.index] || `Axis ${binding.index}`
	if (binding.kind === 'key') return binding.key.toUpperCase()
	return 'Not set'
}

export default function SettingsScreen() {
	const navigate = useNavigate()
	const [bindings, setBindings] = useState(getBindings)
	const [listening, setListening] = useState(null)
	const [pending, setPending] = useState(null)

	useEffect(() => {
		if (!listening) return
		let cancelled = false
		const started = performance.now()

		const tick = () => {
			if (cancelled || pending) return
			if (performance.now() - started < 250) {
				requestAnimationFrame(tick)
				return
			}
			const gp = navigator.getGamepads()[0]
			if (gp) {
				for (let i = 0; i < gp.buttons.length; i++) {
					if ((gp.buttons[i]?.value || 0) > 0.55) {
						if (listening === 'camera') continue
						setPending({
							kind: 'button',
							index: i,
							label: BUTTON_NAMES[i] || `Button ${i}`,
						})
						return
					}
				}
				for (let i = 0; i < gp.axes.length; i++) {
					const v = gp.axes[i] || 0
					if (Math.abs(v) > 0.6) {
						if (listening === 'camera') {
							const isRight = i === 2 || i === 3
							setPending({
								kind: 'stick',
								xAxis: isRight ? 2 : 0,
								yAxis: isRight ? 3 : 1,
								invertY: 1,
								label: isRight ? 'Right Stick' : 'Left Stick',
							})
							return
						}
						const sign = v >= 0 ? 1 : -1
						setPending({
							kind: 'axis',
							index: i,
							sign,
							label: `${AXIS_NAMES[i] || 'Axis ' + i}${sign < 0 ? ' (inverted)' : ''}`,
						})
						return
					}
				}
			}
			requestAnimationFrame(tick)
		}

		const onKey = (e) => {
			if (listening === 'camera') return
			e.preventDefault()
			const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
			setPending({ kind: 'key', key, label: key.length === 1 ? key.toUpperCase() : key })
		}

		window.addEventListener('keydown', onKey)
		requestAnimationFrame(tick)
		return () => {
			cancelled = true
			window.removeEventListener('keydown', onKey)
		}
	}, [listening, pending])

	const startListen = (id) => {
		setPending(null)
		setListening(id)
	}

	const accept = () => {
		if (!listening || !pending) return
		const next = { ...bindings, [listening]: pending }
		setBindings(next)
		saveBindings(next)
		setListening(null)
		setPending(null)
	}

	const cancelListen = () => {
		setListening(null)
		setPending(null)
	}

	const doReset = () => {
		const next = resetBindings()
		setBindings(next)
		setListening(null)
		setPending(null)
	}

	const screen = {
		minHeight: '100vh',
		width: '100%',
		background: 'linear-gradient(180deg, #1a1208 0%, #3d2a14 50%, #1a1208 100%)',
		color: '#f4e6c8',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: 'system-ui, sans-serif',
		padding: 24,
	}

	const row = {
		width: 'min(420px, 100%)',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		background: '#00000044',
		border: '1px solid #f4e6c822',
		borderRadius: 8,
		padding: '12px 16px',
		marginBottom: 12,
		cursor: 'pointer',
	}

	return (
		<div style={screen}>
			<p style={{ letterSpacing: '0.35em', fontSize: 12, opacity: 0.7, marginBottom: 12 }}>SETTINGS</p>
			<h1 style={{ fontSize: 32, margin: '0 0 8px' }}>Controls</h1>
			<p style={{ opacity: 0.7, marginBottom: 28, textAlign: 'center' }}>
				Click an action, then press a button, key, or move a stick
			</p>

			{ACTIONS.map((action) => (
				<div key={action.id} style={row} onClick={() => startListen(action.id)}>
					<strong>{action.name}</strong>
					<span style={{ opacity: 0.85 }}>{labelFor(bindings[action.id])}</span>
				</div>
			))}

			<button
				onClick={doReset}
				style={{
					marginTop: 8,
					background: 'transparent',
					color: '#f4e6c8',
					border: '1px solid #f4e6c855',
					borderRadius: 8,
					padding: '12px 48px',
					minWidth: 260,
					cursor: 'pointer',
				}}
			>
				Reset to defaults
			</button>
			<button
				onClick={() => navigate('/taters')}
				style={{
					marginTop: 12,
					background: '#c2410c',
					color: 'white',
					border: 'none',
					borderRadius: 8,
					padding: '12px 48px',
					minWidth: 260,
					cursor: 'pointer',
					fontWeight: 700,
				}}
			>
				Back
			</button>

			{(listening || pending) && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: '#00000088',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 24,
					}}
				>
					<div
						style={{
							background: '#2a1c0e',
							border: '1px solid #f4e6c844',
							borderRadius: 12,
							padding: 28,
							width: 'min(380px, 100%)',
							textAlign: 'center',
						}}
					>
						{pending ? (
							<>
								<p style={{ marginTop: 0 }}>
									Set <strong>{ACTIONS.find((a) => a.id === listening)?.name}</strong> to
								</p>
								<p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 24px' }}>{pending.label}</p>
								<button
									onClick={accept}
									style={{
										background: '#c2410c',
										color: 'white',
										border: 'none',
										borderRadius: 8,
										padding: '10px 28px',
										marginRight: 8,
										cursor: 'pointer',
										fontWeight: 700,
									}}
								>
									Accept
								</button>
								<button
									onClick={cancelListen}
									style={{
										background: 'transparent',
										color: '#f4e6c8',
										border: '1px solid #f4e6c855',
										borderRadius: 8,
										padding: '10px 28px',
										cursor: 'pointer',
									}}
								>
									Cancel
								</button>
							</>
						) : (
							<>
								<p style={{ fontSize: 18, fontWeight: 700 }}>
									{listening === 'camera'
										? 'Move a stick for Camera'
										: `Press a button or move a stick for ${ACTIONS.find((a) => a.id === listening)?.name}`}
								</p>
								<button
									onClick={cancelListen}
									style={{
										background: 'transparent',
										color: '#f4e6c8',
										border: '1px solid #f4e6c855',
										borderRadius: 8,
										padding: '10px 28px',
										cursor: 'pointer',
									}}
								>
									Cancel
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	)
}