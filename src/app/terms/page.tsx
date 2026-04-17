export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#0A0A0A", color: "#ededed" }}>
      <div className="max-w-2xl mx-auto" style={{ lineHeight: 1.8 }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "32px", fontFamily: "Unbounded,sans-serif" }}>Условия использования</h1>

        <p style={{ color: "#aaa" }}>Дата вступления в силу: 9 апреля 2026 г.</p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>1. Описание сервиса</h2>
        <p style={{ color: "#ccc" }}>TUMAN VPN — сервис для защиты интернет-соединения. Мы предоставляем зашифрованный доступ к интернету через серверы в нескольких странах.</p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>2. Использование сервиса</h2>
        <p style={{ color: "#ccc" }}>Запрещается использовать TUMAN VPN для:</p>
        <ul style={{ color: "#ccc", paddingLeft: "20px" }}>
          <li>Рассылки спама и вредоносного ПО</li>
          <li>DDoS-атак и сканирования портов</li>
          <li>Распространения нелегального контента</li>
          <li>Скачивания торрентов (BitTorrent заблокирован)</li>
        </ul>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>3. Оплата и возвраты</h2>
        <p style={{ color: "#ccc" }}>Подписка активируется сразу после оплаты. Пробный период — 3 дня бесплатно (один раз на аккаунт). Возврат средств возможен в течение 24 часов после оплаты через поддержку.</p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>4. Ограничение ответственности</h2>
        <p style={{ color: "#ccc" }}>Сервис предоставляется «как есть». Мы стремимся к 99.9% uptime, но не гарантируем бесперебойную работу. В случае длительных перебоев мы компенсируем дни простоя.</p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>5. Прекращение доступа</h2>
        <p style={{ color: "#ccc" }}>Мы оставляем за собой право заблокировать аккаунт при нарушении правил использования без возврата средств.</p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginTop: "32px", marginBottom: "12px" }}>6. Контакты</h2>
        <p style={{ color: "#ccc" }}>Поддержка: <a href="https://t.me/tumannetbot" style={{ color: "#6B8CFF" }}>@tumannetbot</a></p>

        <p style={{ color: "#555", marginTop: "40px", fontSize: "13px" }}>TUMAN VPN · tuman.help</p>
      </div>
    </main>
  );
}
