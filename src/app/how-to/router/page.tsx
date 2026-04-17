'use client'
import Link from 'next/link'

const steps = [
  {
    num: 1,
    title: 'Получи Sub URL в боте',
    desc: 'Открой @tumannetbot → нажми "Личный кабинет" → скопируй ссылку подписки (начинается с https://sub.tuman.help/sub/...)',
    tip: 'Sub URL работает со всеми клиентами — HAPP, Sing-box, и роутерами с поддержкой Xray/V2Ray'
  },
  {
    num: 2,
    title: 'Установи компонент Xray на Keenetic',
    desc: 'Зайди в веб-интерфейс роутера → Управление → Компоненты системы → найди "Протокол Xray" → установи.',
    tip: 'Требуется KeeneticOS 4.1 или новее. Проверь версию: Управление → О системе'
  },
  {
    num: 3,
    title: 'Добавь подписку в Keenetic',
    desc: 'Интернет → Другие подключения → Xray → Добавить подписку → вставь твой Sub URL → Сохранить.',
    tip: 'Keenetic автоматически загрузит все серверы из подписки и выберет быстрейший'
  },
  {
    num: 4,
    title: 'Настрой политику маршрутизации',
    desc: 'В настройках Xray выбери режим "Раздельное туннелирование" → включи "Обходить российские сайты" — банки и Госуслуги будут работать напрямую.',
    tip: 'Можно указать конкретные устройства которые ходят через VPN — например только телевизор'
  },
  {
    num: 5,
    title: 'Проверь что всё работает',
    desc: 'Открой YouTube на любом устройстве подключённом к роутеру — должен работать без VPN-клиента на самом устройстве.',
    tip: 'Обнови подписку раз в неделю: в интерфейсе Keenetic → Xray → Обновить подписку'
  },
]

export default function RouterPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px' }}>
        <Link href="/" style={{ color: '#6B8CFF', textDecoration: 'none', fontSize: 14 }}>
          &larr; Назад на главную
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6B8CFF22', border: '1px solid #6B8CFF44', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#6B8CFF', marginBottom: 20 }}>
            🖥️ Инструкция для роутера
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, fontFamily: 'Unbounded, sans-serif' }}>
            TUMAN на роутере<br />
            <span style={{ color: '#6B8CFF' }}>Keenetic</span>
          </h1>
          <p style={{ color: '#888', fontSize: 17, lineHeight: 1.6 }}>
            Настрой один раз — и YouTube, Instagram, Discord работают на всех устройствах дома без установки VPN-клиента на каждый гаджет.
          </p>
        </div>

        {/* Advantages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { icon: '📺', text: 'Работает на Smart TV и приставках' },
            { icon: '🎮', text: 'Игровые консоли без лагов' },
            { icon: '📱', text: 'Все телефоны в сети автоматически' },
            { icon: '🏠', text: 'Один раз настроил — работает всегда' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ color: '#ccc', fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 24, marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#fff' }}>Что нужно:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '✅ Роутер Keenetic с KeeneticOS 4.1+',
              '✅ Активная подписка TUMAN (или 3 дня бесплатно)',
              '✅ Sub URL из бота @tumannetbot',
            ].map((item, i) => (
              <li key={i} style={{ color: '#ccc', fontSize: 15 }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 }}>
          {steps.map((step) => (
            <div key={step.num} style={{ display: 'flex', gap: 20 }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: '#6B8CFF22', border: '1px solid #6B8CFF44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B8CFF', fontWeight: 700, fontSize: 16 }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#fff' }}>{step.title}</h3>
                <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.6, marginBottom: step.tip ? 12 : 0 }}>{step.desc}</p>
                {step.tip && (
                  <div style={{ background: '#6B8CFF11', border: '1px solid #6B8CFF22', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#6B8CFF' }}>
                    💡 {step.tip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #6B8CFF22, #a78bfa22)', border: '1px solid #6B8CFF44', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Нет подписки?</h3>
          <p style={{ color: '#aaa', marginBottom: 24 }}>Попробуй TUMAN бесплатно 3 дня — никаких карт не нужно</p>
          <a href="https://t.me/tumannetbot" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#6B8CFF', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
            Получить бесплатный доступ &rarr;
          </a>
        </div>

        {/* Other guides */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 32 }}>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>Другие инструкции:</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/how-to" style={{ color: '#6B8CFF', fontSize: 14, textDecoration: 'none' }}>📱 HAPP для телефона</Link>
            <Link href="/download" style={{ color: '#6B8CFF', fontSize: 14, textDecoration: 'none' }}>💻 Скачать приложения</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
