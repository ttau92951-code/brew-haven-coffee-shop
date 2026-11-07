import { Link } from 'react-router-dom';

import Icon from '../components/Icon.jsx';

const VALUES = [
  { icon: '🌱', title: 'Sustainably sourced', text: 'We partner with roasters who pay fair prices and support responsible farming.' },
  { icon: '👩‍🍳', title: 'Skilled baristas', text: 'Every barista is trained on espresso extraction, milk texturing and latte art.' },
  { icon: '🤝', title: 'Community first', text: 'We host local events, support neighbourhood businesses and give back where we can.' }
];

const MILESTONES = [
  { year: '2016', title: 'The first cup', text: 'Brew Haven opened its doors on Kingsway with three tables and one espresso machine.' },
  { year: '2019', title: 'The bakery', text: 'We built an in-house bakery and started baking everything fresh each morning.' },
  { year: '2023', title: 'Going digital', text: 'We introduced online ordering so customers could skip the queue entirely.' },
  { year: '2026', title: 'Brew Haven online', text: 'A brand-new web platform for browsing the menu, ordering and tracking every order.' }
];

export default function AboutPage() {
  return (
    <div className="page container">
      <div className="section-head">
        <span className="eyebrow">About us</span>
        <h1>More than just coffee</h1>
        <p>
          Brew Haven is a family-run coffee shop in the heart of Maseru, serving carefully crafted
          drinks and freshly baked treats since 2016.
        </p>
      </div>

      <div className="about-split" style={{ marginBottom: 'var(--space-8)' }}>
        <img
          src="/Images/Group.jpeg"
          alt="The Brew Haven team"
          loading="lazy"
        />
        <div>
          <h2>Our story</h2>
          <p style={{ marginTop: 'var(--space-4)' }}>
            What started as a small corner café has grown into one of the city&apos;s most loved
            coffee destinations. We believe great coffee is about more than caffeine — it is about
            the moment you take for yourself, the conversation with a friend or the quiet focus of
            a productive morning.
          </p>
          <p style={{ marginTop: 'var(--space-3)' }}>
            That is why we roast in small batches, bake before sunrise and greet every customer by
            name whenever we can. Whether you are dashing to work or settling in for the afternoon,
            there is always a seat — and a perfect cup — waiting for you.
          </p>
          <Link to="/menu" className="btn btn--primary" style={{ marginTop: 'var(--space-5)' }}>
            Browse our menu <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>

      <div className="section-head">
        <span className="eyebrow">What we stand for</span>
        <h2>Our values</h2>
      </div>

      <div className="feature-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {VALUES.map((value) => (
          <article className="feature-card" key={value.title}>
            <div className="feature-card__icon" aria-hidden="true">
              {value.icon}
            </div>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </div>

      <div className="section-head">
        <span className="eyebrow">Our journey</span>
        <h2>Milestones</h2>
      </div>

      <div className="feature-grid">
        {MILESTONES.map((milestone) => (
          <article className="feature-card" key={milestone.year}>
            <div className="feature-card__icon" aria-hidden="true">
              <strong>{milestone.year}</strong>
            </div>
            <h3>{milestone.title}</h3>
            <p>{milestone.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
