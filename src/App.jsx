import React, { useState, useEffect } from 'react';
import {
  IonApp, IonHeader, IonContent, IonToolbar, IonTitle, IonButton,
  IonIcon, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet,
  IonModal, IonInput, IonItem, IonCheckbox, IonList, IonNote, setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { listOutline, barChartOutline, peopleOutline, addOutline, checkmarkOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { db, addWorker, deleteWorker, getWorkers, addCargue, getCargues, clearCargues } from './services/db';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './index.css';

setupIonicReact();

const Inicio = ({ cargues, workers, onSave, onReset }) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  useEffect(() => {
    setSelectedWorkers(workers.map(w => w.id));
  }, [workers, showModal]);

  const totalDay = cargues.reduce((acc, curr) => acc + curr.amount, 0);

  const toggleWorker = (id) => {
    if (selectedWorkers.includes(id)) {
      setSelectedWorkers(selectedWorkers.filter(tid => tid !== id));
    } else {
      setSelectedWorkers([...selectedWorkers, id]);
    }
  };

  const handleSave = () => {
    if (!amount || selectedWorkers.length === 0) {
      alert("Ingresa monto y selecciona personal");
      return;
    }
    const val = parseFloat(amount);
    onSave({
      amount: val,
      desc: desc || 'Cargue',
      participants: selectedWorkers,
      split: val / selectedWorkers.length,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setShowModal(false);
    setAmount('');
    setDesc('');
  };

  return (
    <IonContent>
      <div className="custom-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="app-logo">
              <IonIcon icon={listOutline} style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px', margin: 0 }}>CUADRILLAPAY</h2>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>GESTIÓN LOCAL</p>
            </div>
          </div>
          <div className="date-pill">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-label">TOTAL GANADO</div>
          <div className="stat-value">${totalDay.toLocaleString()}</div>
        </div>
      </div>

      <IonButton className="btn-action" expand="block" onClick={() => setShowModal(true)}>
        <IonIcon slot="start" icon={addOutline} />
        NUEVO REGISTRO
      </IonButton>

      <div className="section-title">Actividad de Hoy</div>
      <div className="list-container">
        {cargues.map(c => (
          <div className="card-item" key={c.id}>
            <div>
              <div style={{ fontWeight: 700, color: '#374151' }}>{c.desc}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.time} • {c.participants.length} pers.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--primary)' }}>+ ${c.amount.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>${c.split.toFixed(0)} c/u</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button onClick={onReset} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>
          Reiniciar Día (Borrar)
        </button>
      </div>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <IonButton fill="clear" onClick={() => setShowModal(false)} style={{ color: '#374151' }}>
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
            <h3 style={{ fontWeight: 800, color: '#374151', margin: 0 }}>Registrar Cargue</h3>
            <div style={{ width: '40px' }}></div>
          </div>

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', textAlign: 'center', display: 'block' }}>Valor Total</label>
          <input type="number" className="big-input" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} />
          <input type="text" className="desc-input" placeholder="Descripción (Ej. Cemento)" value={desc} onChange={e => setDesc(e.target.value)} />

          <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Asistencia (Toca para quitar)</div>
          <div id="attendanceList">
            {workers.map(w => {
              const isSelected = selectedWorkers.includes(w.id);
              return (
                <div key={w.id} className={`worker-select ${isSelected ? 'selected' : ''}`} onClick={() => toggleWorker(w.id)}>
                  <b>{w.name}</b>
                  <div className="check-circle">
                    {isSelected && <IonIcon icon={checkmarkOutline} style={{ color: 'white' }} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px' }}>
            <IonButton expand="block" className="btn-action" style={{ margin: 0 }} onClick={handleSave}>GUARDAR</IonButton>
          </div>
        </div>
      </IonModal>
    </IonContent>
  );
};

const Cuentas = ({ cargues, workers }) => {
  const earnings = {};
  workers.forEach(w => earnings[w.id] = 0);
  cargues.forEach(c => {
    c.participants.forEach(pid => {
      if (earnings[pid] !== undefined) earnings[pid] += c.split;
    });
  });

  return (
    <IonContent>
      <div className="custom-header">
        <div className="header-top">
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: 0 }}>RESUMEN</h2>
        </div>
      </div>
      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-label">Nº CARGUES</div>
          <div className="stat-sub">{cargues.length}</div>
        </div>
      </div>
      <div className="section-title">Pagos por Trabajador</div>
      <div className="list-container">
        {workers.map(w => (
          <div className="card-item" key={w.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '35px', height: '35px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', fontWeight: 'bold', marginRight: '10px' }}>
                {w.name.charAt(0)}
              </div>
              <b>{w.name}</b>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
              ${(earnings[w.id] || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
    </IonContent>
  );
};

const Equipo = ({ workers, onAdd, onDelete }) => {
  const handleAdd = () => {
    const name = prompt("Nombre del trabajador:");
    if (name) onAdd(name);
  };

  return (
    <IonContent>
      <div className="custom-header">
        <div className="header-top">
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: 0 }}>EQUIPO</h2>
          <IonButton fill="clear" style={{ background: 'white', color: 'var(--primary)', borderRadius: '15px', fontWeight: 'bold' }} onClick={handleAdd}>
            + AGREGAR
          </IonButton>
        </div>
      </div>
      <div className="list-container" style={{ marginTop: '20px' }}>
        {workers.map(w => (
          <div className="card-item" key={w.id}>
            <b>{w.name}</b>
            <IonButton fill="clear" color="danger" onClick={() => onDelete(w.id)}>
              <IonIcon icon={trashOutline} slot="icon-only" />
            </IonButton>
          </div>
        ))}
      </div>
    </IonContent>
  );
};

const App = () => {
  const [workers, setWorkers] = useState([]);
  const [cargues, setCargues] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const w = await getWorkers();
    const c = await getCargues();
    if (w.length === 0) {
      // Default workers if none exists
      const defaults = ['Alejandro', 'Diego', 'Juan', 'Miguel'];
      for (const name of defaults) {
        await addWorker(name);
      }
      setWorkers(await getWorkers());
    } else {
      setWorkers(w);
    }
    setCargues(c);
  };

  const handleAddWorker = async (name) => {
    await addWorker(name);
    setWorkers(await getWorkers());
  };

  const handleDeleteWorker = async (id) => {
    if (confirm("¿Eliminar trabajador?")) {
      await deleteWorker(id);
      setWorkers(await getWorkers());
    }
  };

  const handleSaveCargue = async (cargue) => {
    await addCargue(cargue);
    setCargues(await getCargues());
  };

  const handleReset = async () => {
    if (confirm("¿Iniciar nuevo día? Se borrará el historial de hoy.")) {
      await clearCargues();
      setCargues([]);
    }
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/inicio">
              <Inicio cargues={cargues} workers={workers} onSave={handleSaveCargue} onReset={handleReset} />
            </Route>
            <Route exact path="/cuentas">
              <Cuentas cargues={cargues} workers={workers} />
            </Route>
            <Route exact path="/equipo">
              <Equipo workers={workers} onAdd={handleAddWorker} onDelete={handleDeleteWorker} />
            </Route>
            <Route exact path="/">
              <Redirect to="/inicio" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="inicio" href="/inicio">
              <IonIcon icon={listOutline} />
              <IonLabel>INICIO</IonLabel>
            </IonTabButton>
            <IonTabButton tab="cuentas" href="/cuentas">
              <IonIcon icon={barChartOutline} />
              <IonLabel>CUENTAS</IonLabel>
            </IonTabButton>
            <IonTabButton tab="equipo" href="/equipo">
              <IonIcon icon={peopleOutline} />
              <IonLabel>EQUIPO</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
