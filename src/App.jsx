import { useMemo, useState } from 'react';
import data from './data/whitehall_sandbox_strategic_data.json';

function getOutcomeArchetype(metrics, archetypes) {
  const { political, economic, social, technical, sovereign } = metrics;

  if (sovereign >= 65 && technical >= 65 && economic >= 50) {
    return archetypes.find((item) => item.id === 'FORTRESS');
  }
  if (sovereign >= 60 && political >= 60 && technical >= 45) {
    return archetypes.find((item) => item.id === 'BROKER');
  }
  if (sovereign < 35 && technical >= 60 && economic >= 60) {
    return archetypes.find((item) => item.id === 'VASSAL');
  }
  if (social < 35 && economic >= 55) {
    return archetypes.find((item) => item.id === 'GILDED');
  }
  if (economic < 40 && technical < 40) {
    return archetypes.find((item) => item.id === 'HERMIT');
  }
  return archetypes.find((item) => item.id === 'PRAGMATIC');
}

function App() {
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [metrics, setMetrics] = useState(data.initialMetrics);
  const [history, setHistory] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing');
  const [panelMode, setPanelMode] = useState('simulator');

  const currentYear = data.timeline[currentYearIndex];
  const selectedOption = currentYear.options.find((item) => item.id === selectedOptionId) ?? null;
  const outcome = useMemo(() => {
    if (!gameCompleted) return null;
    return getOutcomeArchetype(metrics, data.outcomeArchetypes);
  }, [gameCompleted, metrics]);

  const handleSelectOption = (id) => setSelectedOptionId(id);

  const handleConfirmDecision = () => {
    if (!selectedOptionId) return;

    const option = currentYear.options.find((item) => item.id === selectedOptionId);
    const nextMetrics = { ...metrics };
    Object.entries(option.metrics).forEach(([key, value]) => {
      nextMetrics[key] = Math.max(0, Math.min(100, nextMetrics[key] + value));
    });

    setMetrics(nextMetrics);
    setHistory([
      ...history,
      {
        year: currentYear.year,
        decisionTitle: option.label,
        log: option.log,
        metricsApplied: option.metrics
      }
    ]);

    if (currentYearIndex < data.timeline.length - 1) {
      setCurrentYearIndex(currentYearIndex + 1);
      setSelectedOptionId(null);
    } else {
      setGameCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentYearIndex(0);
    setMetrics(data.initialMetrics);
    setHistory([]);
    setSelectedOptionId(null);
    setGameCompleted(false);
    setPanelMode('simulator');
    setActiveTab('briefing');
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WHITEHALL SANDBOX</p>
          <h1>{data.title}</h1>
          <p className="subtitle">{data.subtitle} • Strategic foresight simulation</p>
        </div>
        <div className="hero-actions">
          <div className="status-pill">{gameCompleted ? 'Outcome ready' : `Year ${currentYear.year}`}</div>
          <button className="secondary" onClick={handleReset}>Reset simulation</button>
        </div>
      </header>

      <nav className="panel-switcher">
        <button className={panelMode === 'simulator' ? 'active' : ''} onClick={() => setPanelMode('simulator')}>Simulator</button>
        <button className={panelMode === 'outcomes' ? 'active' : ''} onClick={() => setPanelMode('outcomes')}>Outcomes</button>
      </nav>

      <main className="dashboard-grid">
        <section className="main-panel">
          {panelMode === 'simulator' ? (
            <>
              <div className="timeline-card glass-card">
                <div className="card-header">
                  <div>
                    <p className="section-kicker">Decision horizon</p>
                    <h2>Timeline</h2>
                  </div>
                  <div className="year-badge">{currentYear.year}</div>
                </div>
                <div className="timeline-track">
                  {data.timeline.map((item, index) => {
                    const state = index < currentYearIndex ? 'done' : index === currentYearIndex ? 'current' : 'pending';
                    return (
                      <div key={item.year} className={`timeline-step ${state}`}>
                        <span>{item.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="briefing-card glass-card">
                <div className="tabs">
                  {['briefing', 'comparison', 'insights', 'library'].map((tab) => (
                    <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'briefing' && (
                  <div className="briefing-body">
                    <h3>{currentYear.eraTitle}</h3>
                    <p>{currentYear.briefing}</p>
                    <div className="callout">{currentYear.defaultPath}</div>
                  </div>
                )}

                {activeTab === 'comparison' && (
                  <div className="briefing-body">
                    <h3>Europe 2031 contrast</h3>
                    <p>{data.insights[0].fact}</p>
                    <p className="muted">{data.insights[0].detail}</p>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="insight-grid">
                    {data.insights.map((item) => (
                      <div key={item.title} className="insight-card">
                        <h4>{item.title}</h4>
                        <p>{item.fact}</p>
                        <span>{item.detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'library' && (
                  <div className="library-list">
                    {data.researchSources.map((source) => (
                      <div key={source.source} className="library-card">
                        <strong>{source.source}</strong>
                        <p>{source.authority}</p>
                        <ul>
                          {source.insights.map((item) => <li key={item.point}>{item.point}: {item.detail}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="options-card glass-card">
                <div className="card-header">
                  <div>
                    <p className="section-kicker">Choose a response</p>
                    <h2>Strategic options</h2>
                  </div>
                  <div className={`status-pill compact ${selectedOption ? 'ready' : ''}`}>
                    {selectedOption ? 'Ready to commit' : 'Select one'}
                  </div>
                </div>
                {currentYear.options.map((option) => (
                  <button
                    key={option.id}
                    className={`option ${selectedOptionId === option.id ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <div className="option-top">
                      <strong>{option.label}</strong>
                      <span className="option-tag">Option</span>
                    </div>
                    <p>{option.summary}</p>
                    <small>{option.consequences}</small>
                  </button>
                ))}
                <button className="confirm" onClick={handleConfirmDecision} disabled={!selectedOptionId}>
                  {selectedOption ? `Confirm ${selectedOption.label}` : 'Confirm decision'}
                </button>
              </div>
            </>
          ) : (
            <div className="outcomes-card glass-card">
              <div className="card-header">
                <div>
                  <p className="section-kicker">Scenario map</p>
                  <h2>Possible futures</h2>
                </div>
              </div>
              {data.outcomeArchetypes.map((item) => (
                <div key={item.id} className={`outcome-item ${outcome && outcome.id === item.id ? 'current' : ''}`}>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                  <span>{item.grade}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="side-panel">
          <div className="panel-card glass-card">
            <div className="card-header compact">
              <div>
                <p className="section-kicker">Signals</p>
                <h3>Live telemetry</h3>
              </div>
            </div>
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="metric-row">
                <div className="metric-label">{key}</div>
                <div className="bar"><div style={{ width: `${value}%` }} /></div>
                <div className="metric-value">{value}</div>
              </div>
            ))}
          </div>

          <div className="panel-card glass-card">
            <div className="card-header compact">
              <div>
                <p className="section-kicker">Record</p>
                <h3>Decision ledger</h3>
              </div>
            </div>
            {history.length === 0 ? (
              <p className="muted">No decisions recorded yet.</p>
            ) : (
              history.map((item, index) => (
                <div key={`${item.year}-${index}`} className="history-item">
                  <strong>{item.year}: {item.decisionTitle}</strong>
                  <p>{item.log}</p>
                </div>
              ))
            )}
          </div>

          {gameCompleted && outcome && (
            <div className="panel-card glass-card outcome-summary">
              <div className="card-header compact">
                <div>
                  <p className="section-kicker">Assessment</p>
                  <h3>Outcome</h3>
                </div>
              </div>
              <strong>{outcome.title}</strong>
              <p>{outcome.desc}</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
