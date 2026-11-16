import { useMemo, useState } from 'react'
import initialData from './data/dashboard.json'
import './index.css'

let idCounter = 100
const nextId = () => `w-custom-${Date.now()}-${idCounter++}`

const TYPE_LABELS = {
  score: 'Score',
  alert: 'Alert',
  stat: 'Metric',
}

function WidgetCard({ widget, onRemove }) {
  return (
    <article className={`widget widget-${widget.type}`}>
      <button
        className="widget-remove"
        onClick={() => onRemove(widget.id)}
        aria-label={`Remove ${widget.title}`}
        title="Remove widget"
      >
        ×
      </button>
      <span className="widget-type">{TYPE_LABELS[widget.type] || 'Widget'}</span>
      <h3>{widget.title}</h3>
      <div className="widget-value">
        {widget.value}
        <span className="widget-unit">{widget.unit}</span>
      </div>
      <p className="widget-text">{widget.text}</p>
      {widget.trend && <span className="widget-trend">{widget.trend}</span>}
    </article>
  )
}

export default function App() {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ categoryId: 'cspm', title: '', text: '', type: 'stat', value: '', unit: '' })
  const [formError, setFormError] = useState('')

  const query = search.trim().toLowerCase()

  const visibleCategories = useMemo(() => {
    if (!query) return data.categories
    return data.categories
      .map((cat) => ({
        ...cat,
        widgets: cat.widgets.filter(
          (w) =>
            w.title.toLowerCase().includes(query) ||
            w.text.toLowerCase().includes(query) ||
            String(w.value).toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.widgets.length > 0)
  }, [data, query])

  const totalWidgets = data.categories.reduce((n, c) => n + c.widgets.length, 0)
  const shownWidgets = visibleCategories.reduce((n, c) => n + c.widgets.length, 0)

  const removeWidget = (widgetId) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        widgets: cat.widgets.filter((w) => w.id !== widgetId),
      })),
    }))
  }

  const openDialog = () => {
    setForm({ categoryId: 'cspm', title: '', text: '', type: 'stat', value: '', unit: '' })
    setFormError('')
    setDialogOpen(true)
  }

  const submitWidget = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.text.trim()) {
      setFormError('Widget name and text are both required.')
      return
    }
    const widget = {
      id: nextId(),
      title: form.title.trim(),
      text: form.text.trim(),
      type: form.type,
      value: form.value.trim() || '—',
      unit: form.unit.trim(),
      trend: 'New',
    }
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === form.categoryId ? { ...cat, widgets: [...cat.widgets, widget] } : cat,
      ),
    }))
    setDialogOpen(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">🛡</span>
          <div>
            <strong>AccuKnox CNAPP</strong>
            <span className="brand-sub">{data.dashboard}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <input
            className="search"
            type="search"
            placeholder="Search widgets… (try “MFA”, “CVE”, “S3”)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search widgets"
          />
          <button className="btn-primary" onClick={openDialog}>
            + Add Widget
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h2>Categories</h2>
          <p className="sidebar-hint">Uncheck a widget to remove it from the dashboard.</p>
          {data.categories.map((cat) => (
            <section key={cat.id} className="sidebar-category">
              <h3>{cat.name}</h3>
              <p className="sidebar-desc">{cat.description}</p>
              <ul>
                {cat.widgets.map((w) => (
                  <li key={w.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked
                        onChange={() => removeWidget(w.id)}
                      />
                      <span>{w.title}</span>
                    </label>
                  </li>
                ))}
                {cat.widgets.length === 0 && (
                  <li className="sidebar-empty">No widgets in this category.</li>
                )}
              </ul>
            </section>
          ))}
          <p className="sidebar-count">
            {shownWidgets} of {totalWidgets} widgets shown
            {query && ` for “${search.trim()}”`}
          </p>
        </aside>

        <main className="content">
          {visibleCategories.length === 0 && (
            <div className="empty-state">
              <h2>No widgets match “{search.trim()}”</h2>
              <p>Try a different search, or add a new widget with the + Add Widget button.</p>
              <button className="btn-primary" onClick={() => setSearch('')}>
                Clear search
              </button>
            </div>
          )}
          {visibleCategories.map((cat) => (
            <section key={cat.id} className="category">
              <div className="category-head">
                <h2>{cat.name}</h2>
                <span className="category-count">{cat.widgets.length} widgets</span>
              </div>
              <p className="category-desc">{cat.description}</p>
              <div className="widget-grid">
                {cat.widgets.map((w) => (
                  <WidgetCard key={w.id} widget={w} onRemove={removeWidget} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {dialogOpen && (
        <div className="modal-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add widget">
            <h2>Add Widget</h2>
            <form onSubmit={submitWidget}>
              <label>
                Category
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {data.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Widget name *
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Secrets in Code"
                  autoFocus
                />
              </label>
              <label>
                Widget text *
                <textarea
                  rows="3"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Describe what this widget shows…"
                />
              </label>
              <div className="form-row">
                <label>
                  Type
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="stat">Metric</option>
                    <option value="score">Score</option>
                    <option value="alert">Alert</option>
                  </select>
                </label>
                <label>
                  Value
                  <input
                    type="text"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="e.g. 23"
                  />
                </label>
                <label>
                  Unit
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. open"
                  />
                </label>
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        AccuKnox Front-End Trainee Assignment — CNAPP dashboard, JSON-driven (src/data/dashboard.json) ·
        Built with React + Vite by K. Sasikumar Yadav
      </footer>
    </div>
  )
}
