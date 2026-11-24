import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Sky, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, useSite, useLink, visibleSats } from '../store'
import { dirVector } from '../lib/geo'
import { fmtLon } from '../data/satellites'
import TVScreen from './TVScreen'

/* World frame: +x = east, +y = up, -z = north. Azimuth clockwise from north. */
const worldDir = (az: number, el: number) => { const d = dirVector(az, el); return new THREE.Vector3(d.x, d.y, -d.z) }

function Room({ southFacing }: { southFacing: boolean }) {
  const rot = southFacing ? 0 : Math.PI
  return (
    <group rotation={[0, rot, 0]}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[7, 7]} /><meshStandardMaterial color="#8a6a4b" roughness={0.8} /></mesh>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.6]} receiveShadow><planeGeometry args={[3.2, 2.2]} /><meshStandardMaterial color="#5b6472" roughness={1} /></mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.8, 0]}><planeGeometry args={[7, 7]} /><meshStandardMaterial color="#f3f0ea" /></mesh>
      {/* back wall (north) */}
      <mesh position={[0, 1.4, -3.5]} receiveShadow><boxGeometry args={[7, 2.8, 0.1]} /><meshStandardMaterial color="#e9e2d6" /></mesh>
      {/* side walls */}
      <mesh position={[-3.5, 1.4, 0]}><boxGeometry args={[0.1, 2.8, 7]} /><meshStandardMaterial color="#e3dccf" /></mesh>
      <mesh position={[3.5, 1.4, 0]}><boxGeometry args={[0.1, 2.8, 7]} /><meshStandardMaterial color="#e3dccf" /></mesh>
      {/* front wall with sliding door (south) */}
      <mesh position={[-2.2, 1.4, 3.5]}><boxGeometry args={[2.6, 2.8, 0.15]} /><meshStandardMaterial color="#e3dccf" /></mesh>
      <mesh position={[2.6, 1.4, 3.5]}><boxGeometry args={[1.8, 2.8, 0.15]} /><meshStandardMaterial color="#e3dccf" /></mesh>
      <mesh position={[0.4, 2.55, 3.5]}><boxGeometry args={[2.8, 0.5, 0.15]} /><meshStandardMaterial color="#e3dccf" /></mesh>
      {/* glass */}
      <mesh position={[0.4, 1.15, 3.5]}><boxGeometry args={[2.8, 2.3, 0.02]} /><meshPhysicalMaterial color="#bfe0f5" transmission={0.9} transparent opacity={0.35} roughness={0.05} /></mesh>
      <mesh position={[0.4, 1.15, 3.5]}><boxGeometry args={[0.04, 2.3, 0.08]} /><meshStandardMaterial color="#555" /></mesh>
      {/* balcony */}
      <mesh position={[0, -0.08, 4.7]} receiveShadow><boxGeometry args={[7, 0.16, 2.4]} /><meshStandardMaterial color="#9b9b96" /></mesh>
      {[-3.4, 3.4].map(x => <mesh key={x} position={[x, 0.55, 4.7]}><boxGeometry args={[0.06, 1.1, 2.4]} /><meshStandardMaterial color="#333" /></mesh>)}
      <mesh position={[0, 1.08, 5.85]}><boxGeometry args={[7, 0.06, 0.06]} /><meshStandardMaterial color="#333" /></mesh>
      {Array.from({ length: 23 }).map((_, i) => <mesh key={i} position={[-3.3 + i * 0.3, 0.55, 5.85]}><boxGeometry args={[0.025, 1.1, 0.025]} /><meshStandardMaterial color="#333" /></mesh>)}
      {/* plant */}
      <mesh position={[-2.8, 0.25, 4.3]}><cylinderGeometry args={[0.2, 0.15, 0.5, 16]} /><meshStandardMaterial color="#b0552f" /></mesh>
      <mesh position={[-2.8, 0.8, 4.3]}><sphereGeometry args={[0.4, 16, 12]} /><meshStandardMaterial color="#3f8f3a" /></mesh>
      {/* sofa */}
      <group position={[0, 0, 1.9]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2.2, 0.5, 0.9]} /><meshStandardMaterial color="#4b5b7a" /></mesh>
        <mesh position={[0, 0.65, -0.35]} castShadow><boxGeometry args={[2.2, 0.5, 0.25]} /><meshStandardMaterial color="#3f4d69" /></mesh>
        {[-1.0, 1.0].map(x => <mesh key={x} position={[x, 0.55, 0]}><boxGeometry args={[0.2, 0.25, 0.9]} /><meshStandardMaterial color="#3f4d69" /></mesh>)}
      </group>
      {/* coffee table */}
      <mesh position={[0, 0.4, 0.4]} castShadow><boxGeometry args={[1.1, 0.04, 0.55]} /><meshStandardMaterial color="#3a2a1d" /></mesh>
      {[-0.5, 0.5].map(x => [-0.22, 0.22].map(z => <mesh key={`${x}${z}`} position={[x, 0.2, 0.4 + z]}><cylinderGeometry args={[0.02, 0.02, 0.4]} /><meshStandardMaterial color="#222" /></mesh>))}
      {/* lamp */}
      <mesh position={[-2.8, 0.75, -2.6]}><cylinderGeometry args={[0.02, 0.02, 1.5]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[-2.8, 1.6, -2.6]}><cylinderGeometry args={[0.18, 0.25, 0.3, 24, 1, true]} /><meshStandardMaterial color="#f1d9a8" side={THREE.DoubleSide} emissive="#f1d9a8" emissiveIntensity={0.4} /></mesh>
      <pointLight position={[-2.8, 1.5, -2.6]} intensity={2} distance={6} color="#ffe2b0" />
      {/* picture frame */}
      <mesh position={[-2, 1.7, -3.44]}><boxGeometry args={[0.9, 0.6, 0.03]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[-2, 1.7, -3.42]}><planeGeometry args={[0.8, 0.5]} /><meshStandardMaterial color="#6fa8dc" /></mesh>
      {/* city outside */}
      {[-5, -2, 1.5, 4.5].map((x, i) => <mesh key={i} position={[x, 2 + i, 14 + i * 2]}><boxGeometry args={[2.5, 6 + i * 2, 2.5]} /><meshStandardMaterial color={['#8d9aa6', '#a3adb8', '#77838f', '#b2bcc5'][i]} /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 10]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#6f8a5a" /></mesh>
    </group>
  )
}

function TVStand() {
  return (
    <group position={[0, 0, -2.95]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[1.9, 0.5, 0.45]} /><meshStandardMaterial color="#2f2a26" roughness={0.6} /></mesh>
      <mesh position={[0, 0.56, 0]}><boxGeometry args={[1.98, 0.03, 0.5]} /><meshStandardMaterial color="#1f1b18" roughness={0.3} /></mesh>
      {[-0.6, 0.6].map(x => <mesh key={x} position={[x, 0.3, 0.23]}><boxGeometry args={[0.6, 0.35, 0.01]} /><meshStandardMaterial color="#3b352f" /></mesh>)}
      {[-0.9, 0.9].map(x => <mesh key={x} position={[x, 0.025, 0]}><boxGeometry args={[0.08, 0.05, 0.4]} /><meshStandardMaterial color="#111" /></mesh>)}
    </group>
  )
}

function SamsungTV() {
  const tvOn = useStore(s => s.tvOn)
  const setView = useStore(s => s.setView)
  const setOverlayTV = useStore(s => s.setOverlayTV)
  const W = 1.45, H = 0.82
  return (
    <group position={[0, 0.58 + H / 2 + 0.08, -2.95]} onClick={e => { e.stopPropagation(); setView('tv'); setOverlayTV(true) }}>
      {/* panel */}
      <mesh castShadow><boxGeometry args={[W + 0.02, H + 0.02, 0.035]} /><meshStandardMaterial color="#0d0d0f" metalness={0.6} roughness={0.3} /></mesh>
      {/* screen (dark glass when off) */}
      <mesh position={[0, 0, 0.019]}><planeGeometry args={[W, H]} /><meshStandardMaterial color={tvOn ? '#000' : '#05060a'} roughness={0.1} metalness={0.4} /></mesh>
      {/* screen content (CSS3D) */}
      <Html transform position={[0, 0, 0.021]} scale={W / 960} style={{ width: 960, height: 540, pointerEvents: 'auto' }} zIndexRange={[5, 0]}>
        <TVScreen compact />
      </Html>
      {/* Samsung logo */}
      <Html transform position={[0, -H / 2 - 0.028, 0.02]} scale={0.0032} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#c9cbd0', fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 6, fontSize: 20 }}>SAMSUNG</div>
      </Html>
      {/* bottom bezel + stand */}
      <mesh position={[0, -H / 2 - 0.028, 0]}><boxGeometry args={[W + 0.02, 0.04, 0.035]} /><meshStandardMaterial color="#1b1c20" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, -H / 2 - 0.08, -0.02]}><boxGeometry args={[0.35, 0.08, 0.04]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, -H / 2 - 0.08, 0.0]}><boxGeometry args={[0.55, 0.02, 0.25]} /><meshStandardMaterial color="#222" /></mesh>
      {/* standby LED */}
      <mesh position={[0.5, -H / 2 - 0.028, 0.02]}><sphereGeometry args={[0.006]} /><meshStandardMaterial color={tvOn ? '#000' : '#ff2020'} emissive={tvOn ? '#000' : '#ff2020'} emissiveIntensity={2} /></mesh>
    </group>
  )
}

function Receiver() {
  const purchased = useStore(s => s.purchased)
  const install = useStore(s => s.install)
  const on = useStore(s => s.receiverOn)
  const setView = useStore(s => s.setView)
  if (!purchased) return null
  return (
    <group position={[0.45, 0.6, -2.95]} onClick={e => { e.stopPropagation(); setView('tv') }}>
      <mesh castShadow><boxGeometry args={[0.28, 0.045, 0.2]} /><meshStandardMaterial color="#141416" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[-0.08, 0, 0.101]}><planeGeometry args={[0.07, 0.02]} /><meshStandardMaterial color="#000" emissive={on ? '#16d16a' : '#000'} emissiveIntensity={1.5} /></mesh>
      <mesh position={[0.11, 0, 0.101]}><sphereGeometry args={[0.004]} /><meshStandardMaterial emissive={install.receiverPowered ? (on ? '#20ff60' : '#ff3030') : '#000'} emissiveIntensity={2} color="#000" /></mesh>
      {/* coax F-connector cable on back */}
      {install.cableToReceiver && (
        <mesh position={[0.08, -0.01, -0.3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.004, 0.004, 0.4]} /><meshStandardMaterial color="#eee" /></mesh>
      )}
      {install.hdmiConnected && (
        <mesh position={[-0.08, 0.1, -0.14]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.004, 0.004, 0.25]} /><meshStandardMaterial color="#222" /></mesh>
      )}
    </group>
  )
}

function Dish({ southFacing }: { southFacing: boolean }) {
  const install = useStore(s => s.install)
  const dish = useStore(s => s.dish)
  const cart = useStore(s => s.cart)
  const phase = useStore(s => s.phase)
  const setView = useStore(s => s.setView)
  const diameter = cart.dish?.diameter ?? 0.8
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = []
    const r = diameter / 2, f = diameter * 0.6
    for (let i = 0; i <= 16; i++) { const x = (i / 16) * r; pts.push(new THREE.Vector2(x, (x * x) / (4 * f))) }
    return new THREE.LatheGeometry(pts, 48)
  }, [diameter])
  const houseRot = southFacing ? 0 : Math.PI
  const mountPos = new THREE.Vector3(2.4, 1.6, 3.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), houseRot)
  if (!install.mountDrilled) return null
  const visualEl = dish.el - 24 // offset-feed reflector appears tilted back by ~24° less than the beam elevation
  return (
    <group position={mountPos} onClick={e => { e.stopPropagation(); if (phase !== 'shop' && phase !== 'install') setView('dish') }}>
      {/* wall bracket */}
      <group rotation={[0, houseRot, 0]}>
        <mesh position={[0, 0, -0.06]}><boxGeometry args={[0.15, 0.3, 0.02]} /><meshStandardMaterial color="#9aa0a6" metalness={0.8} roughness={0.4} /></mesh>
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.36]} /><meshStandardMaterial color="#9aa0a6" metalness={0.8} /></mesh>
        <mesh position={[0, 0.2, 0.28]}><cylinderGeometry args={[0.024, 0.024, 0.7]} /><meshStandardMaterial color="#9aa0a6" metalness={0.8} /></mesh>
      </group>
      {install.dishMounted && (
        <group position={new THREE.Vector3(0, 0.45, 0.28).applyAxisAngle(new THREE.Vector3(0, 1, 0), houseRot)} rotation={[0, -THREE.MathUtils.degToRad(dish.az) + Math.PI, 0]}>
          <group rotation={[THREE.MathUtils.degToRad(visualEl), 0, 0]}>
            <group rotation={[0, 0, THREE.MathUtils.degToRad(-dish.skew)]}>
              {/* reflector: axis +z = boresight after rotation */}
              <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} position={[0, diameter * 0.22, 0]} castShadow>
                <meshStandardMaterial color="#d9dde2" metalness={0.35} roughness={0.45} side={THREE.DoubleSide} />
              </mesh>
              {/* feed arm + LNB */}
              <mesh position={[0, -diameter * 0.2, diameter * 0.35]} rotation={[-0.9, 0, 0]}><boxGeometry args={[0.03, 0.03, diameter * 0.8]} /><meshStandardMaterial color="#9aa0a6" /></mesh>
              {install.lnbAttached && (
                <group position={[0, 0.02, diameter * 0.66]} rotation={[Math.PI / 2, 0, 0]}>
                  <mesh><cylinderGeometry args={[0.02, 0.02, 0.12]} /><meshStandardMaterial color="#f4f4f4" /></mesh>
                  <mesh position={[0, -0.07, 0]}><cylinderGeometry args={[0.028, 0.02, 0.03]} /><meshStandardMaterial color="#e5e5e5" /></mesh>
                  <mesh position={[0, 0.07, 0]}><boxGeometry args={[0.05, 0.04, 0.04]} /><meshStandardMaterial color="#ddd" /></mesh>
                </group>
              )}
            </group>
          </group>
        </group>
      )}
      {install.cableRun && install.lnbAttached && (
        <mesh position={new THREE.Vector3(-0.1, -0.5, 0.15).applyAxisAngle(new THREE.Vector3(0, 1, 0), houseRot)} rotation={[0.15, 0, 0.1]}><cylinderGeometry args={[0.005, 0.005, 1.6]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
      )}
      {cart.finder && install.lnbAttached && (
        <Html position={[0.35, -0.2, 0.2]} distanceFactor={3} style={{ pointerEvents: 'none' }}>
          <FinderBadge />
        </Html>
      )}
    </group>
  )
}

function FinderBadge() {
  const { results, lnbPowered } = useLink()
  const best = results.reduce((a, b) => (b.cnDb > a.cnDb ? b : a))
  const pct = lnbPowered ? Math.max(0, Math.min(100, (best.cnDb + 2) * 5)) : 0
  return (
    <div className="rounded bg-zinc-900/90 border border-zinc-600 px-2 py-1 text-[10px] text-green-400 font-mono shadow w-28">
      <div className="text-zinc-400">SATFINDER</div>
      <div className="h-1.5 bg-zinc-700 rounded mt-1"><div className="h-full bg-green-400 rounded" style={{ width: `${pct}%` }} /></div>
      <div>{lnbPowered ? `${pct.toFixed(0)} %` : 'NO LNB PWR'}</div>
    </div>
  )
}

function SatelliteArc() {
  const show = useStore(s => s.showArc)
  const { city } = useSite()
  const sats = useMemo(() => visibleSats(city.lat, city.lon), [city])
  if (!show) return null
  return (
    <group position={[2.4, 2, 3.9]}>
      {sats.map(({ sat, p }) => {
        const v = worldDir(p.az, p.el).multiplyScalar(60)
        return (
          <group key={sat.id} position={v}>
            <mesh><sphereGeometry args={[0.5, 12, 12]} /><meshBasicMaterial color="#ffd166" /></mesh>
            <Html distanceFactor={60} style={{ pointerEvents: 'none' }} center>
              <div className="whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-amber-200">{sat.name.split('/')[0].split('(')[0].trim()} {fmtLon(sat.lon)} · el {p.el.toFixed(0)}°</div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function Character() {
  const phase = useStore(s => s.phase)
  const view = useStore(s => s.view)
  const { city } = useSite()
  const south = city.lat >= 0
  const ref = useRef<THREE.Group>(null)
  const target = useMemo(() => {
    const flip = (v: THREE.Vector3) => (south ? v : new THREE.Vector3(-v.x, v.y, -v.z))
    if (phase === 'shop') return { p: flip(new THREE.Vector3(-1.5, 0, 0.5)), r: south ? 0 : Math.PI }
    if (phase === 'install' || phase === 'align' || view === 'dish' || view === 'balcony') return { p: flip(new THREE.Vector3(1.6, 0, 4.4)), r: south ? -1.2 : -1.2 + Math.PI }
    return { p: flip(new THREE.Vector3(0.3, 0, 1.75)), r: south ? Math.PI : 0 }
  }, [phase, view, south])
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.position.lerp(target.p, Math.min(1, dt * 2))
    ref.current.rotation.y += (target.r - ref.current.rotation.y) * Math.min(1, dt * 3)
  })
  const sitting = phase === 'watch' && view !== 'dish' && view !== 'balcony'
  return (
    <group ref={ref}>
      <mesh position={[0, sitting ? 0.65 : 1.0, 0]} castShadow><capsuleGeometry args={[0.17, sitting ? 0.35 : 0.6, 6, 12]} /><meshStandardMaterial color="#d9442b" /></mesh>
      <mesh position={[0, sitting ? 1.15 : 1.55, 0]} castShadow><sphereGeometry args={[0.14, 16, 16]} /><meshStandardMaterial color="#f1c4a0" /></mesh>
      <mesh position={[0, sitting ? 1.24 : 1.64, 0]}><sphereGeometry args={[0.145, 16, 16, 0, Math.PI * 2, 0, 1.2]} /><meshStandardMaterial color="#3b2a20" /></mesh>
      {!sitting && [-0.22, 0.22].map(x => <mesh key={x} position={[x, 0.95, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}><capsuleGeometry args={[0.05, 0.5, 4, 8]} /><meshStandardMaterial color="#d9442b" /></mesh>)}
      {[-0.08, 0.08].map(x => <mesh key={x} position={[x, sitting ? 0.25 : 0.3, sitting ? 0.25 : 0]} rotation={[sitting ? 1.4 : 0, 0, 0]}><capsuleGeometry args={[0.06, 0.45, 4, 8]} /><meshStandardMaterial color="#2c3e66" /></mesh>)}
    </group>
  )
}

const VIEWS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  room: { pos: [3.2, 2.4, 4.0], target: [0, 1, -0.5] },
  tv: { pos: [0, 1.2, -0.6], target: [0, 1.0, -2.95] },
  balcony: { pos: [-1.5, 2.2, 7.5], target: [1.5, 1.2, 3.8] },
  dish: { pos: [1.2, 1.9, 5.4], target: [2.4, 1.9, 3.9] },
}

function CameraRig({ south }: { south: boolean }) {
  const view = useStore(s => s.view)
  const controls = useRef<any>(null)
  const { camera } = useThree()
  const goal = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), t: 1 })
  useEffect(() => {
    const v = VIEWS[view]
    const flip = (a: [number, number, number]) => (south ? new THREE.Vector3(...a) : new THREE.Vector3(-a[0], a[1], -a[2]))
    goal.current = { pos: flip(v.pos), target: flip(v.target), t: 0 }
  }, [view, south])
  useFrame((_, dt) => {
    const g = goal.current
    if (g.t >= 1 || !controls.current) return
    g.t = Math.min(1, g.t + dt * 1.2)
    camera.position.lerp(g.pos, Math.min(1, dt * 3))
    controls.current.target.lerp(g.target, Math.min(1, dt * 3))
    controls.current.update()
  })
  return <OrbitControls ref={controls} makeDefault maxPolarAngle={Math.PI / 2 + 0.05} minDistance={0.4} maxDistance={14} enableDamping />
}

export default function Scene() {
  const { city } = useSite()
  const south = city.lat >= 0
  const weather = useStore(s => s.weather)
  const setView = useStore(s => s.setView)
  return (
    <Canvas shadows camera={{ position: [3.2, 2.4, 4.0], fov: 55 }} dpr={[1, 1.75]} onPointerMissed={() => {}}>
      <Sky sunPosition={south ? [0.3, 0.6, 1] : [-0.3, 0.6, -1]} turbidity={weather === 'clear' ? 4 : 20} rayleigh={weather === 'clear' ? 1.2 : 0.3} />
      <ambientLight intensity={weather === 'clear' ? 0.55 : 0.35} />
      <directionalLight position={south ? [2, 6, 8] : [-2, 6, -8]} intensity={weather === 'clear' ? 1.6 : 0.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <hemisphereLight intensity={0.4} groundColor="#4a3a2a" />
      <Room southFacing={south} />
      <group rotation={[0, south ? 0 : Math.PI, 0]}>
        <TVStand />
        <SamsungTV />
        <Receiver />
      </group>
      <Dish southFacing={south} />
      <SatelliteArc />
      <Character />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={10} blur={2} far={3} />
      <CameraRig south={south} />
      {/* clickable balcony hotspot */}
      <mesh position={south ? [0, 0.1, 4.7] : [0, 0.1, -4.7]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => setView('balcony')} visible={false}><planeGeometry args={[7, 2.4]} /></mesh>
    </Canvas>
  )
}
