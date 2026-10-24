import { services } from "../content";

export default function Services() {
  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="split-head">
          <h2 id="services-title" className="display-2">What I build</h2>
          <p className="lede">
            Three kinds of work, often in the same project. Each comes with tests, a README that explains the decisions, and a live deployment.
          </p>
        </div>
        <div className="service-grid">
          {services.map((s) => (
            <article key={s.title} className="service">
              <h3 className="service-title">{s.title}</h3>
              <p className="service-body">{s.body}</p>
              <ul className="service-list">
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
