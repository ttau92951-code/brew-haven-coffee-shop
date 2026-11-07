import { Link } from 'react-router-dom';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { categoryIcon } from '../utils/image.js';

const CATEGORIES = ['Coffee', 'Tea', 'Pastries', 'Cold Drinks', 'Desserts'];

const FEATURES = [
  { icon: '☕', title: 'Freshly Roasted', text: 'Single-origin beans roasted in small batches every week for maximum flavour.' },
  { icon: '🥐', title: 'Baked Daily', text: 'Pastries, croissants and cakes prepared from scratch by our in-house bakers.' },
  { icon: '⚡', title: 'Ready When You Are', text: 'Order online, track your order and collect it hot from the counter.' }
];

// Shown only until real customer reviews exist.
const FALLBACK_TESTIMONIALS = [
  {
    id: 'fallback-1',
    name: 'Thabo Mokoena',
    role: 'Regular customer',
    rating: 5,
    text: 'The caramel latte is the best in Maseru. Ordering online saves me so much time in the morning.'
  },
  {
    id: 'fallback-2',
    name: 'Lerato Dlamini',
    role: 'Bakes for the office',
    rating: 5,
    text: 'We order pastries for the office every Friday. Always fresh, always on time and beautifully packed.'
  },
  {
    id: 'fallback-3',
    name: 'Sipho Nkosi',
    role: 'Remote worker',
    rating: 5,
    text: 'Great Wi-Fi, great coffee and the staff remember my order. My favourite spot to get work done.'
  }
];

const HERO_OVERLAY =
  'linear-gradient(115deg, rgba(43, 29, 24, 0.94) 0%, rgba(59, 39, 32, 0.82) 45%, rgba(43, 29, 24, 0.55) 100%)';

function starsFor(rating) {
  const filled = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

const HOURS = [
  { day: 'Monday – Friday', time: '07:00 – 19:00' },
  { day: 'Saturday', time: '08:00 – 18:00' },
  { day: 'Sunday', time: '09:00 – 15:00' }
];

export default function HomePage() {
  const { data, loading, error } = useAsync(() => api.get('/menu'), []);
  const { data: settingsData } = useAsync(() => api.get('/settings'), []);
  const { data: reviewsData, loading: reviewsLoading } = useAsync(
    () => api.get('/feedback/public'),
    []
  );

  const menu = data?.data || [];
  const featured = menu.filter((item) => item.available !== false).slice(0, 6);

  const heroImage = settingsData?.data?.heroImage || '';
  const heroStyle = heroImage
    ? { backgroundImage: `${HERO_OVERLAY}, url("${heroImage}")` }
    : undefined;

  const reviews = (reviewsData?.data || []).map((review) => ({
    id: review.id,
    name: review.customerName || 'Brew Haven customer',
    role: review.subject || 'Customer review',
    rating: review.rating,
    text: review.message
  }));

  const testimonials = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;
  const showingLiveReviews = reviews.length > 0;

  return (
    <>
      <section className="hero" style={heroStyle}>
        <div className="container hero__inner">
          <div>
            <span className="eyebrow hero__eyebrow">Maseru&apos;s favourite coffee house</span>
            <h1 className="hero__title">
              Great coffee,
              <br />
              made just for you.
            </h1>
            <p className="hero__text">
              From slow-roasted espresso to freshly baked pastries, Brew Haven brings the warmth
              of a neighbourhood café to your fingertips. Browse our menu and order in seconds.
            </p>

            <div className="hero__actions">
              <Link to="/menu" className="btn btn--accent btn--lg">
                Explore Our Menu <Icon name="arrowRight" size={17} />
              </Link>
              <Link to="/menu" className="btn btn--outline btn--lg" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.45)' }}>
                Order Now
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <strong>{menu.length || 14}+</strong>
                <span>Menu items</span>
              </div>
              <div className="hero__stat">
                <strong>5</strong>
                <span>Categories</span>
              </div>
              <div className="hero__stat">
                <strong>7 days</strong>
                <span>Open weekly</span>
              </div>
            </div>
          </div>

          <div className="hero__card">
            <h3>Today at Brew Haven</h3>
            <ul>
              <li>
                <span>Freshly brewed filter coffee</span>
                <strong>M28.00</strong>
              </li>
              <li>
                <span>Butter croissant</span>
                <strong>M32.00</strong>
              </li>
              <li>
                <span>Iced caramel latte</span>
                <strong>M45.00</strong>
              </li>
              <li>
                <span>Order ahead &amp; collect</span>
                <strong>Free</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Brew Haven</span>
            <h2>Crafted with care, served with warmth</h2>
            <p>Everything we serve is prepared fresh, using quality ingredients and a whole lot of love.</p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-card__icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Featured</span>
              <h2>Popular right now</h2>
            </div>
            <Link to="/menu" className="btn btn--outline btn--sm">
              View full menu <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {loading && <Loader label="Brewing the menu…" />}
          {error && <Alert variant="error">{error.message}</Alert>}

          {!loading && !error && featured.length === 0 && (
            <EmptyState
              title="The menu is being updated"
              description="Please check back shortly — our team is adding new items."
              action={
                <Link to="/menu" className="btn btn--primary btn--sm">
                  Go to menu
                </Link>
              }
            />
          )}

          {!loading && featured.length > 0 && (
            <div className="grid-auto">
              {featured.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Browse</span>
            <h2>Popular categories</h2>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`} className="category-card">
                <span className="category-card__icon" aria-hidden="true">
                  {categoryIcon(category)}
                </span>
                <span>{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container about-split">
          <div>
            <span className="eyebrow">Our story</span>
            <h2>A café built around community</h2>
            <p style={{ marginTop: 'var(--space-4)' }}>
              Brew Haven began with a simple idea: a warm place where great coffee brings people
              together. From our first espresso machine to today&apos;s fully digital ordering
              system, we have stayed true to that vision.
            </p>
            <p style={{ marginTop: 'var(--space-3)' }}>
              We source our beans from local roasters, bake every morning and train every barista to
              pour the perfect cup. Order online and skip the queue — your coffee will be waiting.
            </p>
            <Link to="/about" className="btn btn--primary" style={{ marginTop: 'var(--space-5)' }}>
              More about us
            </Link>
          </div>

          <img
            src="/Images/BREW HAVEN INSIDE.jpg"
            alt="Inside the Brew Haven coffee shop"
            loading="lazy"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Loved by locals</span>
            <h2>What our customers say</h2>
            {showingLiveReviews && (
              <p>Real reviews shared by Brew Haven customers.</p>
            )}
          </div>

          {reviewsLoading ? (
            <Loader label="Loading customer reviews…" />
          ) : (
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.id}>
                  <span
                    className="testimonial-card__stars"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {starsFor(testimonial.rating)}
                  </span>
                  <p>{testimonial.text}</p>
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__avatar" aria-hidden="true">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>
                <Icon name="clock" size={18} /> Opening hours
              </h3>
              {HOURS.map((entry) => (
                <div className="row row--between" key={entry.day}>
                  <span className="text-muted">{entry.day}</span>
                  <strong>{entry.time}</strong>
                </div>
              ))}
            </div>

            <div className="info-card">
              <h3>
                <Icon name="pin" size={18} /> Find us
              </h3>
              <p>12 Kingsway Avenue, Maseru, Lesotho</p>
              <p className="text-muted">Free parking available behind the shop.</p>
              <Link to="/contact" className="btn btn--outline btn--sm">
                Get directions
              </Link>
            </div>

            <div className="info-card">
              <h3>
                <Icon name="phone" size={18} /> Get in touch
              </h3>
              <p>+266 5800 0000</p>
              <p>hello@brewhaven.co.ls</p>
              <Link to="/contact" className="btn btn--outline btn--sm">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to skip the queue?</h2>
              <p>Place your order online and collect it fresh from the counter — no waiting required.</p>
            </div>
            <Link to="/menu" className="btn btn--accent btn--lg">
              Order Now <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
