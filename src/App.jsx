import { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('gerencial');

  const reportes = {
    gerencial: `REMEINIA Gestión IA - Alerta Gerencial\nServicio: Urgencias Adultos\nPersonal programado: 10\nPersonal presente: 7\nAusentismo: 30%\nPacientes: 32\nPacientes críticos: 5\n\nRiesgo operativo: CRÍTICO\nPrioridad: pacientes críticos y vigilancia continua.\nAcción: redistribuir actividades, reforzar prevención de caídas y documentar riesgo.`,
    calidad: `REMEINIA Gestión IA - Higiene de Manos OMS\nApego global: 70.5%\nMomento con menor cumplimiento: Momento 2\n\nRecomendación: reforzar técnica antes de tarea limpia/aséptica, auditoría por turno y retroalimentación inmediata.`,
    evento: `REMEINIA Gestión IA - Evento Adverso / Cuasifalla\nTipo: Caída hospitalaria\nClasificación: Evento adverso\n\nAnálisis causa raíz inicial:\n- Carga laboral\n- Vigilancia insuficiente\n- Barreras preventivas incompletas\n\nAcciones: análisis de caso, reforzar rondas, señalización y plan preventivo.`,
    iaas: `REMEINIA Gestión IA - Indicadores IAAS\nTipo: IVU asociada a catéter\nCasos: 3\nDías dispositivo: 920\nTasa: 3.26 por 1,000 días dispositivo\n\nInterpretación: riesgo alto, reforzar bundle, técnica aséptica y retiro oportuno de dispositivos.`
  };

  return (
    <main style={{ minHeight: '100vh', background: '#061427', color: '#f2f7ff', fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <section style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ border: '1px solid #1c4f80', borderRadius: 18, padding: 24, background: '#0b223f', marginBottom: 18 }}>
          <p style={{ margin: 0, color: '#5db7ff', fontWeight: 700 }}>REMEINIA · Red Mexicana de Innovación en Enfermería e IA</p>
          <h1 style={{ margin: '10px 0', fontSize: 36 }}>REMEINIA Gestión IA</h1>
          <p style={{ margin: 0, fontSize: 18, color: '#acc6e6' }}>Alerta Gerencial de Enfermería · De los datos invisibles a las decisiones inteligentes</p>
        </header>

        <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 18 }}>
          {[
            ['gerencial', 'Alerta Gerencial'],
            ['calidad', 'Indicadores de Calidad'],
            ['evento', 'Evento Adverso / Cuasifalla'],
            ['iaas', 'Indicadores IAAS']
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: 14, borderRadius: 12, border: '1px solid #1c4f80', cursor: 'pointer', background: tab === id ? '#2575bd' : '#0b223f', color: '#fff', fontWeight: 700 }}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'gerencial' && <ModuloGerencial />}
        {tab === 'calidad' && <ModuloCalidad />}
        {tab === 'evento' && <ModuloEvento />}
        {tab === 'iaas' && <ModuloIAAS />}

        <section style={{ marginTop: 18, border: '1px solid #1c4f80', borderRadius: 18, padding: 18, background: '#0b223f' }}>
          <h2 style={{ marginTop: 0 }}>Reporte ejecutivo listo para copiar</h2>
          <textarea readOnly value={reportes[tab]} style={{ width: '100%', minHeight: 220, borderRadius: 12, border: '1px solid #1c4f80', background: '#061427', color: '#f2f7ff', padding: 14, fontSize: 15 }} />
        </section>
      </section>
    </main>
  );
}

function Card({ title, children }) {
  return <article style={{ border: '1px solid #1c4f80', borderRadius: 16, padding: 18, background: '#0b223f' }}><h3 style={{ marginTop: 0 }}>{title}</h3>{children}</article>;
}

function ModuloGerencial() {
  return <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
    <Card title="Datos del turno"><p>Servicio: Urgencias Adultos</p><p>Personal programado: 10</p><p>Personal presente: 7</p><p>Pacientes totales: 32</p></Card>
    <Card title="Semáforo gerencial"><h2 style={{ color: '#ff6b6b' }}>CRÍTICO</h2><p>Ausentismo 30% + alta complejidad clínica.</p></Card>
    <Card title="Acciones inmediatas"><p>Priorizar pacientes críticos, vigilancia continua, prevención de caídas y medicación segura.</p></Card>
  </section>;
}

function ModuloCalidad() {
  return <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
    {[1,2,3,4,5].map((m) => <Card key={m} title={`Momento ${m} OMS`}><p>Apego estimado: {m === 2 ? '62.5%' : '75.0%'}</p><p>Requiere seguimiento por turno.</p></Card>)}
  </section>;
}

function ModuloEvento() {
  return <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
    <Card title="Clasificación"><p>Evento adverso / cuasifalla / evento centinela.</p></Card>
    <Card title="Causa raíz inicial"><p>Factores humanos, comunicación, proceso, carga laboral e insumos.</p></Card>
    <Card title="Acciones"><p>Correctivas, preventivas, indicadores de seguimiento y cierre documental.</p></Card>
  </section>;
}

function ModuloIAAS() {
  return <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
    <Card title="Indicador"><p>IVU asociada a catéter, NAV, ITS/CVC o ISQ.</p></Card>
    <Card title="Tasa"><h2>3.26</h2><p>Por 1,000 días dispositivo.</p></Card>
    <Card title="Acciones"><p>Verificar bundle, técnica aséptica y retiro oportuno del dispositivo.</p></Card>
  </section>;
}
