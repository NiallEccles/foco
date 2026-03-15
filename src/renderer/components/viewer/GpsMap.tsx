import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadowUrl, iconRetinaUrl: iconUrl })

interface GpsMapProps {
  lat: number
  lon: number
}

export function GpsMap({ lat, lon }: GpsMapProps) {
  return (
    <MapContainer
      key={`${lat},${lon}`}
      center={[lat, lon]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: 160, width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]}>
        <Popup>{`${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`}</Popup>
      </Marker>
    </MapContainer>
  )
}
