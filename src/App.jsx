import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  ClipboardList,
  Gauge,
  Hospital,
  RefreshCcw,
  ShieldAlert,
  Stethoscope,
  UserRoundX,
  UsersRound
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const riskConfig = {
  verde: { label: 'Verde', className: 'verde', range: '0 - 24' },
  amarillo: { label: 'Amarillo', className: 'amarillo', range: '25 - 49' },
  rojo: { label: 'Rojo', className: 'rojo', range: '50 - 74' },
  critico: { label: 'Crítico', className: 'critico', range: '75 - 100' }
};

function App() {
  const [formData, setFormData] = useState(demoData);

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
        absenteeismScore +
          ratioScore +
          criticalScore +
          eventsScore +
          transfersScore +
          suppliesScore,
        0,
        100
      )
    );

    const riskLevel =
      riskScore >= 75 ? 'critico' : riskScore >= 50 ? 'rojo' : riskScore >= 25 ? 'amarillo' : 'verde';

    const risks = [
      { name: 'Ausentismo de enfermería', value: absenteeism, weight: absenteeismScore },
      { name: 'Relación pacientes/enfermera', value: ratio, weight: ratioScore },
      { name: 'Pacientes críticos', value: criticalPatients, weight: criticalScore },
      { name: 'Eventos adversos del turno', value: adverseEvents, weight: eventsScore },
      { name: 'Traslados pendientes', value: transfersPending, weight: transfersScore },
      { name: 'Riesgo de insumos', value: formData.suppliesRisk, weight: suppliesScore }
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

    const report = `REMEINIA Gestión IA - Alerta Gerencial de Enfermería
Hospital: ${formData.hospital}
Servicio: ${formData.service}
Turno: ${formData.shift}
Fecha: ${formData.date}

Semáforo de riesgo: ${riskConfig[riskLevel].label} (${riskScore}/100)
Ausentismo: ${absenteeism.toFixed(1)}%
Relación pacientes/enfermera: ${ratio.toFixed(2)}

Riesgos principales:
1. ${risks[0]?.name ?? '-'}
2. ${risks[1]?.name ?? '-'}
3. ${risks[2]?.name ?? '-'}

Prioridad número uno:
- ${priorityOne}

Acciones inmediatas:
- ${actions.join('\n- ')}

Indicadores a vigilar:
- ${indicators.join('\n- ')}`;

    return {
      absenteeism,
      ratio,
      riskScore,
      riskLevel,
      risks,
      priorityOne,
      actions,
      indicators,
      report
    };
  }, [formData]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const restoreDemo = () => setFormData(demoData);

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
        <button type="button" className="demo-btn" onClick={restoreDemo}>
          <RefreshCcw size={16} /> Restaurar datos demo
        </button>
      </header>

      <main className="grid-layout">
        <section className="card form-card">
          <h2><ClipboardList size={18} /> Datos mínimos del turno</h2>
          <div className="form-grid">
            {[
              ['hospital', 'Hospital'],
              ['service', 'Servicio'],
              ['shift', 'Turno'],
              ['date', 'Fecha']
            ].map(([name, label]) => (
              <label key={name}>
                <span>{label}</span>
                <input name={name} type={name === 'date' ? 'date' : 'text'} value={formData[name]} onChange={onChange} />
              </label>
            ))}

            {[
              ['plannedNurses', 'Enfermeras planificadas'],
              ['presentNurses', 'Enfermeras presentes'],
              ['patients', 'Pacientes totales'],
              ['criticalPatients', 'Pacientes críticos'],
              ['adverseEvents', 'Eventos adversos'],
              ['transfersPending', 'Traslados pendientes']
            ].map(([name, label]) => (
              <label key={name}>
                <span>{label}</span>
                <input name={name} type="number" min="0" value={formData[name]} onChange={onChange} />
              </label>
            ))}

            <label>
              <span>Riesgo de insumos</span>
              <select name="suppliesRisk" value={formData.suppliesRisk} onChange={onChange}>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card dashboard-card">
          <h2><Gauge size={18} /> Alerta gerencial</h2>

          <div className={`semaforo ${riskConfig[calculations.riskLevel].className}`}>
            <ShieldAlert size={24} />
            <div>
              <strong>{riskConfig[calculations.riskLevel].label}</strong>
              <p>Score: {calculations.riskScore}/100 · Rango {riskConfig[calculations.riskLevel].range}</p>
            </div>
          </div>

          <div className="kpis">
            <article>
              <UserRoundX size={16} />
              <span>Ausentismo</span>
              <strong>{calculations.absenteeism.toFixed(1)}%</strong>
            </article>
            <article>
              <UsersRound size={16} />
              <span>Pacientes / Enfermera</span>
              <strong>{calculations.ratio.toFixed(2)}</strong>
            </article>
            <article>
              <BedDouble size={16} />
              <span>Prioridad #1</span>
              <strong>{calculations.priorityOne}</strong>
            </article>
          </div>

          <div className="lists">
            <div>
              <h3>Riesgos principales</h3>
              <ul>{calculations.risks.map((risk) => <li key={risk.name}><AlertTriangle size={14} /> {risk.name}</li>)}</ul>
            </div>
            <div>
              <h3>Acciones inmediatas</h3>
              <ul>{calculations.actions.map((action) => <li key={action}><Stethoscope size={14} /> {action}</li>)}</ul>
            </div>
            <div>
              <h3>Indicadores a vigilar</h3>
              <ul>{calculations.indicators.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>

          <div className="report-block">
            <h3>Reporte ejecutivo (copiar y enviar)</h3>
            <textarea readOnly value={calculations.report} rows={12} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
