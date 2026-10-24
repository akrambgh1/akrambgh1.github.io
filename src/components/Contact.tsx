import { useState, type FormEvent } from "react";
import { profile } from "../content";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * With a form endpoint configured (e.g. Formspree), messages are sent from the page.
 * With only an email, the form opens the visitor's mail app. With neither, links are shown.
 */
export default function Contact() {
  const { email, formEndpoint, links } = profile.contact;
  const canSend = Boolean(formEndpoint || email);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email ?? "") || (data.message ?? "").trim().length < 10) {
      setStatus("error");
      setError("Add your name, a valid email and a message of at least 10 characters.");
      return;
    }
    if (!formEndpoint) {
      const body = encodeURIComponent(`${data.message}\n\n${data.name} (${data.email})`);
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Project inquiry from ${data.name}`)}&body=${body}`;
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("The message didn't send. Check your connection and try again.");
    }
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div>
          <h2 id="contact-title" className="display-1">Have something worth building?</h2>
          <p className="lede">
            I'm open to full-time roles and focused freelance projects. Tell me what you're making and where it's stuck.
          </p>
          <ul className="contact-links">
            {email && (
              <li><a className="link-lg" href={`mailto:${email}`}>{email}</a></li>
            )}
            {links.map((l) => (
              <li key={l.href}>
                <a className="link-lg" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {canSend && (
          <form className="contact-form" onSubmit={submit} noValidate>
            <label className="field">
              <span>Your name</span>
              <input name="name" autoComplete="name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              <span>What are you building?</span>
              <textarea name="message" rows={5} required />
            </label>
            {status === "error" && <p className="form-error" role="alert">{error}</p>}
            {status === "sent" ? (
              <p className="form-sent" role="status">Message sent. I'll reply within two working days.</p>
            ) : (
              <button className="btn dark" disabled={status === "sending"}>
                {status === "sending" ? "Sending" : formEndpoint ? "Send message" : "Write the email"}
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
