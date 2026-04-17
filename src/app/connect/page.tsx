'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OS_LIST = [
  { id: 'ios', label: 'iOS', icon: '🍎' },
  { id: 'android', label: 'Android', icon: '🤖' },
  { id: 'windows', label: 'Windows', icon: '🪟' },
  { id: 'macos', label: 'macOS', icon: '💻' },
  { id: 'android_tv', label: 'Android TV', icon: '📺' },
  { id: 'apple_tv', label: 'Apple TV', icon: '📺' },
  { id: 'keenetic', label: 'Keenetic', icon: '🖥️' },
]

const APPS: Record<string, Array<{ id: string; name: string; primary: boolean; download: string; download2?: string; download2_label?: string; deep_link: (url: string) => string }>> = {
  ios: [
    { id: 'happ', name: 'HAPP', primary: true,
      download: 'https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973',
      download2: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215',
      download2_label: 'App Store (Global)',
      deep_link: (url) => `happ://add/${url}` },
    { id: 'v2ray', name: 'V2Ray Tun', primary: false,
      download: 'https://apps.apple.com/app/id6446814690',
      deep_link: (url) => `v2raytun://install-sub?url=${encodeURIComponent(url)}` },
    { id: 'foxray', name: 'FoXray', primary: false,
      download: 'https://apps.apple.com/app/id6448898396',
      deep_link: (url) => `foxray://yiguo.dev/sub/add/?url=${encodeURIComponent(url)}#TUMAN` },
  ],
  android: [
    { id: 'happ', name: 'HAPP', primary: true,
      download: 'https://play.google.com/store/apps/details?id=com.happproxy',
      download2: 'https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk',
      download2_label: 'Скачать APK',
      deep_link: (url) => `happ://add/${url}` },
  ],
  windows: [
    { id: 'happ', name: 'HAPP', primary: true,
      download: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe',
      deep_link: (url) => `happ://add/${url}` },
  ],
  macos: [
    { id: 'happ', name: 'HAPP', primary: true,
      download: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg',
      deep_link: (url) => `happ://add/${url}` },
  ],
  android_tv: [
    { id: 'happ', name: 'HAPP TV', primary: true,
      download: 'https://play.google.com/store/apps/details?id=com.happproxy',
      deep_link: (url) => `happ://add/${url}` },
  ],
  apple_tv: [
    { id: 'happ', name: 'HAPP TV', primary: true,
      download: 'https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274',
      deep_link: (url) => `happ://add/${url}` },
  ],
  keenetic: [],
}

export default function ConnectPage() {
  const [subUrl, setSubUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [os, setOs] = useState('ios')
  const [app, setApp] = useState('happ')
  const [copied, setCopied] = useState(false)
  const [subscriptionAdded, setSubscriptionAdded] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPhone|iPad/.test(ua)) setOs('ios')
    else if (/Android/.test(ua)) {
      if (/TV/.test(ua)) setOs('android_tv')
      else setOs('android')
    }
    else if (/Windows/.test(ua)) setOs('windows')
    else if (/Mac/.test(ua)) setOs('macos')
  }, [])

  const fetchedRef = useRef(false)
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) { setError(true); setLoading(false); return }
    fetch(`https://api.tuman.help/api/connect/sub-url?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setSubUrl(data.sub_url); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const copySubUrl = () => {
    if (!subUrl) return
    navigator.clipboard.writeText(subUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addSubscription = (deepLink: string) => {
    window.location.href = deepLink
    setTimeout(() => setSubscriptionAdded(true), 1500)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #6B8CFF33', borderTop: '3px solid #6B8CFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888', fontFamily: 'Inter, sans-serif' }}>Загружаем твой ключ...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏱️</div>
        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'Unbounded, sans-serif' }}>Ссылка устарела</h2>
        <p style={{ color: '#888', marginBottom: 32, lineHeight: 1.6 }}>Ссылка действует 10 минут. Запроси новую в боте — нажми &laquo;Подключить устройство&raquo;.</p>
        <a href="https://t.me/tumannetbot" style={{ display: 'inline-block', background: '#6B8CFF', color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>
          Открыть бот &rarr;
        </a>
      </div>
    </div>
  )

  const currentApps = APPS[os] || []
  const currentApp = currentApps.find(a => a.id === app) || currentApps[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid #ffffff10', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6B8CFF, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌫️</div>
          <span style={{ fontWeight: 700, fontFamily: 'Unbounded, sans-serif', fontSize: 15 }}>TUMAN VPN</span>
        </div>
        <button onClick={copySubUrl} style={{ display: 'flex', alignItems: 'center', gap: 8, background: copied ? '#22c55e22' : '#ffffff10', border: `1px solid ${copied ? '#22c55e44' : '#ffffff20'}`, borderRadius: 8, padding: '8px 14px', color: copied ? '#22c55e' : '#ccc', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
          {copied ? '✓ Скопировано' : '🔗 Скопировать ключ'}
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, fontFamily: 'Unbounded, sans-serif', marginBottom: 8, lineHeight: 1.2 }}>
            Подключи устройство
          </h1>
          <p style={{ color: '#888', fontSize: 15 }}>Выбери своё устройство и следуй инструкции</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OS_LIST.map(o => (
              <button key={o.id} onClick={() => { setOs(o.id); setApp('happ'); setSubscriptionAdded(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: `1px solid ${os === o.id ? '#6B8CFF' : '#ffffff15'}`, background: os === o.id ? '#6B8CFF22' : '#ffffff08', color: os === o.id ? '#6B8CFF' : '#888', cursor: 'pointer', fontSize: 14, fontWeight: os === o.id ? 600 : 400, transition: 'all 0.2s' }}>
                <span>{o.icon}</span> {o.label}
              </button>
            ))}
          </div>
        </motion.div>

        {os === 'keenetic' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#ffffff08', border: '1px solid #ffffff10', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🖥️ Настройка на Keenetic</h3>
            {[
              { n: 1, t: 'Установи компонент Xray', d: 'Управление → Компоненты → Xray → Установить (нужен KeeneticOS 4.1+)' },
              { n: 2, t: 'Скопируй свой ключ', d: 'Нажми кнопку "Скопировать ключ" вверху страницы' },
              { n: 3, t: 'Добавь подписку', d: 'Интернет → Другие подключения → Xray → Добавить подписку → вставь ключ' },
              { n: 4, t: 'Настрой маршрутизацию', d: 'Включи "Обходить российские сайты" — банки будут работать напрямую' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#6B8CFF22', border: '1px solid #6B8CFF44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B8CFF', fontWeight: 700, fontSize: 14 }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.t}</div>
                  <div style={{ color: '#888', fontSize: 14, lineHeight: 1.5 }}>{step.d}</div>
                </div>
              </div>
            ))}
            <button onClick={copySubUrl} style={{ width: '100%', padding: '14px', background: '#6B8CFF', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              {copied ? '✓ Скопировано!' : '📋 Скопировать ключ подписки'}
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={os} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {currentApps.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {currentApps.map(a => (
                    <button key={a.id} onClick={() => setApp(a.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${app === a.id ? '#6B8CFF' : '#ffffff15'}`, background: app === a.id ? '#6B8CFF22' : '#ffffff08', color: app === a.id ? '#fff' : '#666', cursor: 'pointer', fontSize: 14, fontWeight: app === a.id ? 600 : 400, transition: 'all 0.2s' }}>
                      {a.name} {a.primary && <span style={{ fontSize: 10, background: '#6B8CFF', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>рекомендуем</span>}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#ffffff08', border: '1px solid #ffffff10', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>1</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Установи приложение</h3>
                  </div>
                  <p style={{ color: '#888', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>Скачай {currentApp?.name} и установи на устройство. После установки вернись на эту страницу.</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a href={currentApp?.download} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff15', border: '1px solid #ffffff20', borderRadius: 8, padding: '10px 16px', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                      ↗ Скачать {currentApp?.name}
                    </a>
                    {currentApp?.download2 && (
                      <a href={currentApp.download2} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff10', border: '1px solid #ffffff15', borderRadius: 8, padding: '10px 16px', color: '#aaa', textDecoration: 'none', fontSize: 14 }}>
                        ↗ {currentApp.download2_label}
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ background: '#ffffff08', border: `1px solid ${subscriptionAdded ? '#22c55e44' : '#ffffff10'}`, borderRadius: 16, padding: 20, transition: 'border-color 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: subscriptionAdded ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0, transition: 'background 0.3s' }}>
                      {subscriptionAdded ? '✓' : '2'}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Добавь подписку</h3>
                  </div>
                  <p style={{ color: '#888', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                    Нажми кнопку ниже — приложение откроется и подписка добавится автоматически.
                  </p>
                  {currentApp && (
                    <button onClick={() => addSubscription(currentApp.deep_link(subUrl!))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: subscriptionAdded ? '#22c55e22' : 'linear-gradient(135deg, #6B8CFF, #a78bfa)', border: subscriptionAdded ? '1px solid #22c55e44' : 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all 0.3s' }}>
                      {subscriptionAdded ? '✓ Подписка добавлена' : '+ Добавить подписку'}
                    </button>
                  )}
                </div>

                <div style={{ background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚠️</div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>Если не добавилось автоматически</h3>
                  </div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 16, lineHeight: 1.8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}><span style={{ color: '#6B8CFF', fontWeight: 600 }}>1.</span> Нажми &laquo;Скопировать ключ&raquo; ниже</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}><span style={{ color: '#6B8CFF', fontWeight: 600 }}>2.</span> Открой {currentApp?.name} на устройстве</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}><span style={{ color: '#6B8CFF', fontWeight: 600 }}>3.</span> Нажми <b style={{ color: '#ccc' }}>+</b> внизу экрана</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}><span style={{ color: '#6B8CFF', fontWeight: 600 }}>4.</span> Выбери &laquo;Добавить подписку&raquo; → вставь ссылку</div>
                  </div>
                  <button onClick={copySubUrl}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: copied ? '#22c55e22' : '#ffffff10', border: `1px solid ${copied ? '#22c55e44' : '#ffffff20'}`, borderRadius: 10, padding: '12px 20px', color: copied ? '#22c55e' : '#ccc', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}>
                    {copied ? '✓ Скопировано!' : '📋 Скопировать ключ подписки'}
                  </button>
                </div>

                <div style={{ background: '#ffffff08', border: '1px solid #ffffff10', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Подключись и пользуйся</h3>
                  </div>
                  <p style={{ color: '#888', fontSize: 14, lineHeight: 1.5 }}>
                    Открой {currentApp?.name}, выбери сервер и нажми кнопку подключения.
                    <br /><br />
                    <span style={{ color: '#6B8CFF' }}>💡 Совет:</span> включи <b style={{ color: '#fff' }}>Bypass LAN &amp; RU</b> в настройках маршрутизации — Сбербанк и Госуслуги будут работать без отключения VPN.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #ffffff10', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <a href="https://t.me/tumannetbot" style={{ color: '#6B8CFF', fontSize: 13, textDecoration: 'none' }}>&larr; Вернуться в бот</a>
          <a href="https://t.me/tumannet_news" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>Поддержка &rarr;</a>
        </div>
      </div>
    </div>
  )
}
