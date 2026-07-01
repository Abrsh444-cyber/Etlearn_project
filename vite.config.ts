import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'EthioLearn Pro',
          short_name: 'EthioLearn',
          description: 'Premium AI Learning Platform for Ethiopian Students',
          theme_color: '#d4af37',
          background_color: '#1a1a1a',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },

npm install vite-plugin-pwa -D
npm install vite-plugin-pwa -D
ls public/
ls public
mkdir -p public
find . -name "*.png" -not -path "./node_modules/*"

curl -o public/icon-192.png https://via.placeholder.com/192/d4af37/1a1a1a.png
curl -o public/icon-512.png https://via.placeholder.com/512/d4af37/1a1a1a.png
cp node_modules/vite-plugin-pwa/dist/icons/favicon.ico public/icon-192.png 2>/dev/null || echo "not found"
ls -la public/
python3 -c "
import struct, zlib

def make_png(size, color):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
    r, g, b = color
    raw = (b'\x00' + bytes([r, g, b] * size)) * size
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

with open('public/icon-192.png', 'wb') as f:
    f.write(make_png(192, (212, 175, 55)))
with open('public/icon-512.png', 'wb') as f:
    f.write(make_png(512, (212, 175, 55)))
print('Icons created!')
"
ls -la public/
cat > make_icons.py << 'EOF'
import struct, zlib, os

def make_png(size, color):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
    r, g, b = color
    raw = (b'\x00' + bytes([r, g, b] * size)) * size
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

os.makedirs('public', exist_ok=True)
with open('public/icon-192.png', 'wb') as f:
    f.write(make_png(192, (212, 175, 55)))
with open('public/icon-512.png', 'wb') as f:
    f.write(make_png(512, (212, 175, 55)))
print('Icons created!')
