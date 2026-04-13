import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function parseCloudinaryUrl(url) {
  if (!url) return { cloudName: '', apiKey: '' }

  try {
    const normalized = url.startsWith('cloudinary://') ? url : `cloudinary://${url}`
    const parsed = new URL(normalized)
    return {
      cloudName: parsed.hostname || '',
      apiKey: parsed.username || '',
    }
  } catch {
    return { cloudName: '', apiKey: '' }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsed = parseCloudinaryUrl(env.CLOUDINARY_URL)

  return {
    plugins: [react()],
    define: {
      __CLOUDINARY_CLOUD_NAME_FROM_URL__: JSON.stringify(parsed.cloudName),
      __CLOUDINARY_API_KEY_FROM_URL__: JSON.stringify(parsed.apiKey),
      __CLOUDINARY_UPLOAD_PRESET_FROM_ENV__: JSON.stringify(env.CLOUDINARY_UPLOAD_PRESET || ''),
    },
    server: {
      // Expose dev server on LAN so mobile devices can access it.
      host: true,
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: true,
      port: 4173,
      strictPort: true,
    },
  }
})