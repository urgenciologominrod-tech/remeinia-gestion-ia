import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  ClipboardList,
  Gauge,
  Hand,
  Hospital,
  RefreshCcw,
  ShieldAlert,
  Siren,
  Stethoscope,
  UserRoundX,
  UsersRound,
  Virus
} from 'lucide-react';

const demoData = {
  hospital: 'Hospital Público Central REMEINIA',
  service: 'Medicina Interna',
  shift: 'Noche',
  date: new Date().toISOString().slice(0, 10),
  plannedNurses: 12,
  presentNurses: 9,
  patients: 68,
  criticalPatients: 11,
  adverseEvents: 2,
  suppliesRisk: 'medio',
  transfersPending: 7
};

const qualityDemo = {
  m1Opp: 24,
  m1Done: 19,
  m2Opp: 16,
  m2Done: 10,
  m3Opp: 11,
  m3Done: 8,
  m4Opp: 26,
  m4Done: 20,
  m5Opp: 18,
  m5Done: 12
};

const eventDemo = {
  eventType: 'Error de medicación (dosis omitida)',
  classification: 'evento adverso',
  service: 'Hospitalización Adulto',
  shift: 'Tarde',
  description: 'Paciente no recibió dosis programada por quiebre en comunicación del relevo.',
  patientDamage: 'si',
  contributors: 'Relevo incompleto, sobrecarga asistencial y hoja de tratamiento sin verificación cruzada.',
  failedBarriers: 'Doble chequeo de administración, pase de guardia estructurado.',
  immediateAction: 'Notificación a médico tratante, administración de dosis ajustada y vigilancia clínica.'
};

const iaasDemo = {
  iaasType: 'IVU asociada a catéter',
  cases: 3,
  denominatorDays: 920,
  bundleCompliance: 82,
  service: 'UCI Adulto',
  month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const safePct = (done, opp) => (Number(opp) > 0 ? (Number(done) / Number(opp)) * 100 : 0);

const riskConfig = {
  verde: { label: 'Verde', className: 'verde', range: '0 - 24' },
  amarillo: { label: 'Amarillo', className: 'amarillo', range: '25 - 49' },
  rojo: { label: 'Rojo', className: 'rojo', range: '50 - 74' },
  critico: { label: 'Crítico', className: 'critico', range: '75 - 100' }
};

function App() {
  const [activeTab, setActiveTab] = useState('gerencial');
  const [formData, setFormData] = useState(demoData);
  const [qualityData, setQualityData] = useState(qualityDemo);
  const [eventData, setEventData] = useState(eventDemo);
  const [iaasData, setIaasData] = useState(iaasDemo);

  const calculations = useMemo(() => {
    const planned = Number(formData.plannedNurses) || 0;
    const present = Number(formData.presentNurses) || 0;
    const patients = Number(formData.patients) || 0;
    const criticalPatients = Number(formData.criticalPatients) || 0;
    const adverseEvents = Number(formData.adverseEvents) || 0;
    const transfersPending = Number(formData.transfersPending) || 0;

    const absenteeism = planned > 0 ? ((planned - present) / planned) * 100 : 0;
    const ratio = present > 0 ? patients / present : patients;

    const absenteeismScore = clamp(absenteeism * 1.2, 0, 30);
    const ratioScore = clamp((ratio - 4) * 4.5, 0, 30);
    const criticalScore = clamp(criticalPatients * 1.4, 0, 20);
    const eventsScore = clamp(adverseEvents * 5, 0, 12);
    const transfersScore = clamp(transfersPending * 0.8, 0, 8);
    const suppliesScore =
      formData.suppliesRisk === 'alto' ? 10 : formData.suppliesRisk === 'medio' ? 5 : 1;

    const riskScore = Math.round(
      clamp(
        absenteeismScore + ratioScore + criticalScore + eventsScore + transfersScore + suppliesScore,
        0,
        100
      )
    );

    const riskLevel =
      riskScore >= 75 ? 'critico' : riskScore >= 50 ? 'rojo' : riskScore >= 25 ? 'amarillo' : 'verde';

    const risks = [
      { name: 'Ausentismo de enfermería', weight: absenteeismScore },
      { name: 'Relación pacientes/enfermera', weight: ratioScore },
      { name: 'Pacientes críticos', weight: criticalScore },
      { name: 'Eventos adversos del turno', weight: eventsScore },
      { name: 'Traslados pendientes', weight: transfersScore },
      { name: 'Riesgo de insumos', weight: suppliesScore }
    ]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    const priorityOne = risks[0]?.name ?? 'Sin prioridad crítica';
    const actions = [
      'Reasignar personal a camas de mayor complejidad en los próximos 30 minutos.',
      'Activar coordinación con jefatura para cobertura extraordinaria del turno.',
      'Ejecutar ronda rápida de seguridad clínica en pacientes críticos.',
      'Confirmar stock de insumos esenciales y solicitar reposición inmediata si aplica.'
    ];
    const indicators = [
      `Tasa de ausentismo: ${absenteeism.toFixed(1)}%`,
      `Relación pacientes/enfermera: ${ratio.toFixed(2)}`,
      `Pacientes críticos en unidad: ${criticalPatients}`,
      `Eventos adversos reportados: ${adverseEvents}`
    ];
    const report = `REMEINIA Gestión IA - Alerta Gerencial de Enfermería\nHospital: ${formData.hospital}\nServicio: ${formData.service}\nTurno: ${formData.shift}\nFecha: ${formData.date}\n\nSemáforo de riesgo: ${riskConfig[riskLevel].label} (${riskScore}/100)\nAusentismo: ${absenteeism.toFixed(1)}%\nRelación pacientes/enfermera: ${ratio.toFixed(2)}\n\nRiesgos principales:\n1. ${risks[0]?.name ?? '-'}\n2. ${risks[1]?.name ?? '-'}\n3. ${risks[2]?.name ?? '-'}\n\nPrioridad número uno:\n- ${priorityOne}\n\nAcciones inmediatas:\n- ${actions.join('\n- ')}\n\nIndicadores a vigilar:\n- ${indicators.join('\n- ')}`;

    return { absenteeism, ratio, riskScore, riskLevel, risks, priorityOne, actions, indicators, report };
  }, [formData]);

  const qualityCalc = useMemo(() => {
    const moments = [
      { id: 1, title: 'Antes de tocar al paciente', opp: Number(qualityData.m1Opp), done: Number(qualityData.m1Done) },
      { id: 2, title: 'Antes de tarea limpia/aséptica', opp: Number(qualityData.m2Opp), done: Number(qualityData.m2Done) },
      { id: 3, title: 'Después de riesgo de exposición a líquidos corporales', opp: Number(qualityData.m3Opp), done: Number(qualityData.m3Done) },
      { id: 4, title: 'Después de tocar al paciente', opp: Number(qualityData.m4Opp), done: Number(qualityData.m4Done) },
      { id: 5, title: 'Después del contacto con entorno del paciente', opp: Number(qualityData.m5Opp), done: Number(qualityData.m5Done) }
    ].map((m) => ({ ...m, adherence: safePct(m.done, m.opp) }));

    const totalOpp = moments.reduce((acc, m) => acc + m.opp, 0);
    const totalDone = moments.reduce((acc, m) => acc + m.done, 0);
    const globalAdherence = safePct(totalDone, totalOpp);
    const lowest = [...moments].sort((a, b) => a.adherence - b.adherence)[0];
    const semaforo = globalAdherence >= 90 ? 'verde' : globalAdherence >= 75 ? 'amarillo' : globalAdherence >= 60 ? 'rojo' : 'critico';
    const recommendation =
      semaforo === 'verde'
        ? 'Mantener auditoría semanal y retroalimentación positiva por servicio.'
        : semaforo === 'amarillo'
          ? 'Refuerzo focalizado en el momento de menor cumplimiento con observación directa diaria.'
          : semaforo === 'rojo'
            ? 'Plan de choque de adherencia: capacitación corta por turno + monitoreo de jefatura.'
            : 'Intervención inmediata institucional con supervisión continua y reentrenamiento completo.';

    const report = `REMEINIA Gestión IA - Indicadores de Calidad (Higiene de Manos OMS)\nApego global: ${globalAdherence.toFixed(1)}%\nSemáforo: ${riskConfig[semaforo].label}\nMomento con menor cumplimiento: M${lowest?.id} - ${lowest?.title} (${lowest?.adherence.toFixed(1)}%)\n\nDetalle por momento:\n${moments.map((m) => `- M${m.id}: ${m.adherence.toFixed(1)}% (${m.done}/${m.opp})`).join('\n')}\n\nRecomendación de mejora:\n- ${recommendation}`;

    return { moments, globalAdherence, lowest, semaforo, recommendation, report };
  }, [qualityData]);

  const eventCalc = useMemo(() => {
    const map = {
      cuasifalla: ['Factores del proceso', 'Factores de comunicación'],
      'evento adverso': ['Factores humanos', 'Factores de carga laboral', 'Factores del proceso'],
      'evento centinela': ['Factores organizacionales', 'Factores de comunicación', 'Factores de insumos/equipo']
    };
    const rootCategories = map[eventData.classification] ?? ['Factores del proceso'];
    const causes = rootCategories.map((c) => `Brecha identificada en ${c.toLowerCase()}.`);
    const corrective = [
      'Aplicar análisis de caso en reunión de seguridad del turno siguiente.',
      'Estandarizar doble verificación en proceso crítico asociado.',
      'Documentar aprendizaje y retroalimentar al equipo sin enfoque punitivo.'
    ];
    const preventive = [
      'Implementar checklist breve de seguridad por turno.',
      'Refuerzo de pase de guardia estructurado SBAR.',
      'Monitoreo semanal de adherencia a barreras críticas.'
    ];
    const indicators = [
      'Tasa de eventos similares por 1,000 pacientes-día.',
      'Cumplimiento de barreras críticas (%).',
      'Oportunidad de notificación (<24 h).',
      'Cierre de acciones correctivas en tiempo (%).'
    ];
    const report = `REMEINIA Gestión IA - Reporte Preliminar de Evento\nTipo: ${eventData.eventType}\nClasificación: ${eventData.classification}\nServicio: ${eventData.service}\nTurno: ${eventData.shift}\nDaño al paciente: ${eventData.patientDamage}\n\nDescripción breve:\n${eventData.description}\n\nAnálisis causa raíz inicial:\n- ${rootCategories.join('\n- ')}\n\nCausas probables:\n- ${causes.join('\n- ')}\n\nAcciones correctivas:\n- ${corrective.join('\n- ')}\n\nAcciones preventivas:\n- ${preventive.join('\n- ')}\n\nIndicadores de seguimiento:\n- ${indicators.join('\n- ')}`;
    return { rootCategories, causes, corrective, preventive, indicators, report };
  }, [eventData]);

  const iaasCalc = useMemo(() => {
    const cases = Number(iaasData.cases) || 0;
    const days = Number(iaasData.denominatorDays) || 0;
    const bundle = Number(iaasData.bundleCompliance) || 0;
    const rate = days > 0 ? (cases / days) * 1000 : 0;
    const level = rate <= 1 && bundle >= 95 ? 'verde' : rate <= 3 && bundle >= 85 ? 'amarillo' : rate <= 5 ? 'rojo' : 'critico';
    const interpretation =
      level === 'verde'
        ? 'Control adecuado del riesgo IAAS, mantener vigilancia activa.'
        : level === 'amarillo'
          ? 'Riesgo moderado, fortalecer adherencia a bundle y auditoría de práctica.'
          : level === 'rojo'
            ? 'Riesgo alto, requiere intervención inmediata del equipo de enfermería y control de infecciones.'
            : 'Riesgo crítico institucional, activar plan intensivo y seguimiento diario de jefatura.';
    const actions = [
      'Verificar cumplimiento del bundle cama a cama en turno actual.',
      'Reforzar técnica aséptica y mantenimiento de dispositivos invasivos.',
      'Retiro oportuno de dispositivos no indispensables.',
      'Huddle de 10 minutos con enfermería y comité IAAS.'
    ];
    const report = `REMEINIA Gestión IA - Indicadores IAAS\nTipo: ${iaasData.iaasType}\nServicio: ${iaasData.service}\nMes: ${iaasData.month}\nCasos: ${cases}\nDías dispositivo/denominador: ${days}\nCumplimiento bundle: ${bundle.toFixed(1)}%\nTasa por 1,000 días: ${rate.toFixed(2)}\nSemáforo: ${riskConfig[level].label}\n\nInterpretación gerencial:\n${interpretation}\n\nAcciones prioritarias de enfermería:\n- ${actions.join('\n- ')}`;
    return { rate, level, interpretation, actions, report };
  }, [iaasData]);

  const onChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="title-wrap">
          <Hospital size={28} />
          <div>
            <h1>REMEINIA Gestión IA</h1>
            <p>Alerta Gerencial de Enfermería · Congreso Internacional de Enfermería</p>
          </div>
        </div>
        <div className="btn-group">
          <button type="button" className="demo-btn" onClick={() => setFormData(demoData)}><RefreshCcw size={16} /> Demo Módulo 1</button>
          <button type="button" className="demo-btn secondary" onClick={() => { setQualityData(qualityDemo); setEventData(eventDemo); setIaasData(iaasDemo); }}><RefreshCcw size={16} /> Demo Módulos 2-4</button>
        </div>
      </header>

      <nav className="tabs">
        {[
          ['gerencial', 'Alerta Gerencial'],
          ['calidad', 'Indicadores de Calidad'],
          ['evento', 'Evento Adverso / Cuasifalla'],
          ['iaas', 'Indicadores IAAS']
        ].map(([id, label]) => (
          <button key={id} className={activeTab === id ? 'tab active' : 'tab'} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </nav>

      {activeTab === 'gerencial' && <main className="grid-layout"><section className="card form-card"><h2><ClipboardList size={18} /> Datos mínimos del turno</h2><div className="form-grid">{[['hospital','Hospital'],['service','Servicio'],['shift','Turno'],['date','Fecha']].map(([name,label])=><label key={name}><span>{label}</span><input name={name} type={name==='date'?'date':'text'} value={formData[name]} onChange={onChange(setFormData)} /></label>)}{[['plannedNurses','Enfermeras planificadas'],['presentNurses','Enfermeras presentes'],['patients','Pacientes totales'],['criticalPatients','Pacientes críticos'],['adverseEvents','Eventos adversos'],['transfersPending','Traslados pendientes']].map(([name,label])=><label key={name}><span>{label}</span><input name={name} type="number" min="0" value={formData[name]} onChange={onChange(setFormData)} /></label>)}<label><span>Riesgo de insumos</span><select name="suppliesRisk" value={formData.suppliesRisk} onChange={onChange(setFormData)}><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select></label></div></section><section className="card dashboard-card"><h2><Gauge size={18} /> Alerta gerencial</h2><div className={`semaforo ${riskConfig[calculations.riskLevel].className}`}><ShieldAlert size={24} /><div><strong>{riskConfig[calculations.riskLevel].label}</strong><p>Score: {calculations.riskScore}/100 · Rango {riskConfig[calculations.riskLevel].range}</p></div></div><div className="kpis"><article><UserRoundX size={16} /><span>Ausentismo</span><strong>{calculations.absenteeism.toFixed(1)}%</strong></article><article><UsersRound size={16} /><span>Pacientes / Enfermera</span><strong>{calculations.ratio.toFixed(2)}</strong></article><article><BedDouble size={16} /><span>Prioridad #1</span><strong>{calculations.priorityOne}</strong></article></div><div className="lists"><div><h3>Riesgos principales</h3><ul>{calculations.risks.map((risk) => <li key={risk.name}><AlertTriangle size={14} /> {risk.name}</li>)}</ul></div><div><h3>Acciones inmediatas</h3><ul>{calculations.actions.map((action) => <li key={action}><Stethoscope size={14} /> {action}</li>)}</ul></div><div><h3>Indicadores a vigilar</h3><ul>{calculations.indicators.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="report-block"><h3>Reporte ejecutivo (copiar y enviar)</h3><textarea readOnly value={calculations.report} rows={12} /></div></section></main>}

      {activeTab === 'calidad' && <main className="single-layout"><section className="card"><h2><Hand size={18} /> Indicadores de Calidad · Higiene de Manos (OMS)</h2><div className="quality-grid">{qualityCalc.moments.map((moment)=> <article className="moment-card" key={moment.id}><h3>Momento {moment.id}</h3><p>{moment.title}</p><label><span>Oportunidades observadas</span><input type="number" min="0" name={`m${moment.id}Opp`} value={qualityData[`m${moment.id}Opp`]} onChange={onChange(setQualityData)} /></label><label><span>Acciones cumplidas</span><input type="number" min="0" name={`m${moment.id}Done`} value={qualityData[`m${moment.id}Done`]} onChange={onChange(setQualityData)} /></label><div className="tag">Apego: {moment.adherence.toFixed(1)}%</div></article>)}</div><div className={`semaforo ${riskConfig[qualityCalc.semaforo].className}`}><ShieldAlert size={24} /><div><strong>Semáforo de cumplimiento: {riskConfig[qualityCalc.semaforo].label}</strong><p>Apego global: {qualityCalc.globalAdherence.toFixed(1)}% · Menor cumplimiento: M{qualityCalc.lowest?.id}</p></div></div><p className="insight">Recomendación: {qualityCalc.recommendation}</p><div className="report-block"><h3>Reporte ejecutivo listo para copiar</h3><textarea readOnly value={qualityCalc.report} rows={12} /></div></section></main>}

      {activeTab === 'evento' && <main className="single-layout"><section className="card"><h2><Siren size={18} /> Evento Adverso / Cuasifalla</h2><div className="form-grid">{[['eventType','Tipo de evento'],['service','Servicio'],['shift','Turno']].map(([name,label])=> <label key={name}><span>{label}</span><input name={name} value={eventData[name]} onChange={onChange(setEventData)} /></label>)}<label><span>Clasificación</span><select name="classification" value={eventData.classification} onChange={onChange(setEventData)}><option value="cuasifalla">Cuasifalla</option><option value="evento adverso">Evento adverso</option><option value="evento centinela">Evento centinela</option></select></label><label><span>Daño al paciente</span><select name="patientDamage" value={eventData.patientDamage} onChange={onChange(setEventData)}><option value="no">No</option><option value="si">Sí</option></select></label></div><label><span>Descripción breve sin datos personales</span><textarea name="description" rows="3" value={eventData.description} onChange={onChange(setEventData)} /></label><label><span>Factores contribuyentes</span><textarea name="contributors" rows="2" value={eventData.contributors} onChange={onChange(setEventData)} /></label><label><span>Barreras que fallaron</span><textarea name="failedBarriers" rows="2" value={eventData.failedBarriers} onChange={onChange(setEventData)} /></label><label><span>Acción inmediata realizada</span><textarea name="immediateAction" rows="2" value={eventData.immediateAction} onChange={onChange(setEventData)} /></label><div className="lists"><div><h3>Causas probables</h3><ul>{eventCalc.causes.map((v)=> <li key={v}>{v}</li>)}</ul></div><div><h3>Acciones correctivas</h3><ul>{eventCalc.corrective.map((v)=> <li key={v}>{v}</li>)}</ul></div><div><h3>Acciones preventivas</h3><ul>{eventCalc.preventive.map((v)=> <li key={v}>{v}</li>)}</ul></div></div><div className="report-block"><h3>Reporte preliminar listo para copiar</h3><textarea readOnly value={eventCalc.report} rows={13} /></div></section></main>}

      {activeTab === 'iaas' && <main className="single-layout"><section className="card"><h2><Virus size={18} /> Indicadores IAAS</h2><div className="form-grid"><label><span>Tipo de IAAS</span><select name="iaasType" value={iaasData.iaasType} onChange={onChange(setIaasData)}><option>NAV</option><option>IVU asociada a catéter</option><option>ITS asociada a CVC</option><option>Infección de sitio quirúrgico</option><option>Otra</option></select></label>{[['cases','Número de casos'],['denominatorDays','Días dispositivo / denominador'],['bundleCompliance','Cumplimiento de bundle (%)'],['service','Servicio'],['month','Mes (YYYY-MM)']].map(([name,label])=> <label key={name}><span>{label}</span><input name={name} type={name==='service'||name==='month'?'text':'number'} min="0" value={iaasData[name]} onChange={onChange(setIaasData)} /></label>)}</div><div className={`semaforo ${riskConfig[iaasCalc.level].className}`}><ShieldAlert size={24} /><div><strong>Semáforo IAAS: {riskConfig[iaasCalc.level].label}</strong><p>Tasa: {iaasCalc.rate.toFixed(2)} por 1,000 días dispositivo</p></div></div><p className="insight">Interpretación gerencial: {iaasCalc.interpretation}</p><div><h3>Acciones prioritarias de enfermería</h3><ul>{iaasCalc.actions.map((a)=><li key={a}>{a}</li>)}</ul></div><div className="report-block"><h3>Reporte ejecutivo listo para copiar</h3><textarea readOnly value={iaasCalc.report} rows={12} /></div></section></main>}
    </div>
  );
}

export default App;
