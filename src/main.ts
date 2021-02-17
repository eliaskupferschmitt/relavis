import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../public/style.css'

createApp(App).use(store).mount('#app')
