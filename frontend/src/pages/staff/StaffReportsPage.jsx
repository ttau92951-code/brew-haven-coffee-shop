import { useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader from '../../components/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatCurrency } from '../../utils/format.js';

const PERIODS = [
  { id: 'daily', label: 'Daily', path: '/reports/daily?days=14', caption: 'Last 14 days' },
  { id: 'weekly', label: 'Weekly', path: '/reports/weekly?weeks=8', caption: 'Last 8 weeks' },
  { id: 'monthly', label: 'Monthly', path: '/reports/monthly?months=6', caption: 'Last 6 months' }
];

export default function StaffReportsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('daily');

  const active = PERIODS.find((entry) => entry.id === period);

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        api.get(active.path, token),
        api.get('/reports/overview', token)
      ]).then(([report, overview]) => ({ report: report.data, overview: overview.data })),
    [token, period]
  );

  const buckets = data?.report?.buckets || [];
  const totals = data?.report?.totals || { orders: 0, revenue: 0 };
  const overview = data?.overview;
  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
  const bestSellers = data?.report?.bestSellers || overview?.bestSellers || [];
  const maxSold = Math.max(...bestSellers.map((item) => item.quantity), 1);

  return (
    <>
      <section className="chart-card">
        <div className="data-toolbar">
          <div className="dash-tabs" style={{ margin: 0, border: 'none' }}>
            {PERIODS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`tab${period === entry.id ? ' is-active' : ''}`}
                onClick={() => setPeriod(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn--outline btn--sm" onClick={reload} disabled={loading}>
            <Icon name="refresh" size={16} /> Refresh
          </button>
        </div>

        <div className="kpi-grid">
          <article className="kpi-card">
            <span className="kpi-card__label">Revenue ({active.caption})</span>
            <span className="kpi-card__value">{formatCurrency(totals.revenue)}</span>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__label">Orders ({active.caption})</span>
            <span className="kpi-card__value">{totals.orders}</span>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__label">Total revenue (all time)</span>
            <span className="kpi-card__value">{formatCurrency(overview?.revenue.total || 0)}</span>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__label">Average order value</span>
            <span className="kpi-card__value">{formatCurrency(overview?.revenue.averageOrderValue || 0)}</span>
          </article>
        </div>
      </section>

      {loading && <Loader label="Crunching the numbers…" />}

      {error && (
        <div className="stack">
          <Alert variant="error">{error.message}</Alert>
          <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="chart-grid">
          <section className="chart-card">
            <h3>Revenue by period</h3>

            {buckets.length === 0 ? (
              <p className="text-muted">No data for this period yet.</p>
            ) : (
              <div className="bar-chart">
                {buckets.map((bucket) => (
                  <div className="bar-col" key={bucket.key}>
                    <span className="bar-col__value">
                      {bucket.revenue > 0 ? formatCurrency(bucket.revenue).replace('.00', '') : ''}
                    </span>
                    <div
                      className="bar-col__bar"
                      style={{ height: `${Math.max((bucket.revenue / maxRevenue) * 100, 2)}%` }}
                      title={`${bucket.label}: ${formatCurrency(bucket.revenue)} from ${bucket.orders} orders`}
                    />
                    <span className="bar-col__label">{bucket.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="chart-card">
            <h3>Best-selling products</h3>

            {bestSellers.length === 0 ? (
              <p className="text-muted">No sales recorded yet.</p>
            ) : (
              <div className="rank-list">
                {bestSellers.slice(0, 8).map((item, index) => (
                  <div className="rank-item" key={item.menuItemId || item.name}>
                    <span className="rank-item__index">{index + 1}</span>
                    <div className="rank-item__body">
                      <div className="row row--between">
                        <strong style={{ fontSize: '0.88rem' }}>{item.name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {item.quantity} · {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div className="rank-item__bar">
                        <span style={{ width: `${(item.quantity / maxSold) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {!loading && !error && buckets.length > 0 && (
        <section className="chart-card">
          <h3>Breakdown — {active.caption}</h3>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Average order value</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((bucket) => (
                  <tr key={bucket.key}>
                    <td>{bucket.label}</td>
                    <td>{bucket.orders}</td>
                    <td>
                      <strong>{formatCurrency(bucket.revenue)}</strong>
                    </td>
                    <td>
                      {formatCurrency(bucket.orders > 0 ? bucket.revenue / bucket.orders : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
