import { mount } from 'svelte'
import './app.css'
import './themes/vet2000.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
