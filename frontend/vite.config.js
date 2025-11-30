import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {

  //const env = loadEnv(mode, process.cwd(), '') 

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://shukuma-exercise-app.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  })
}
