import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './components/App'
import TatersRacingScreen from './components/ui/TatersRacingScreen'
import RaceSelectScreen from './components/ui/RaceSelectScreen'
import RaceTrack from './components/ui/RaceTrack'
import './assets/styles/global.css'
import SettingsScreen from './components/ui/SettingsScreen'
ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<App />} />
				<Route path='/taters' element={<TatersRacingScreen />} />
				<Route path='/taters/races' element={<RaceSelectScreen />} />
				<Route path='/taters/race/:id' element={<RaceTrack />} />
				<Route path='/:slug' element={<App />} />
                <Route path='/taters/settings' element={<SettingsScreen />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)