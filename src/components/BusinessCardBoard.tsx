import { Mail, Phone, UserRound, Globe2 } from "lucide-react";
import type { CSSProperties } from "react";
import type { BusinessCard } from "../types/settings";

type BusinessCardBoardProps = {
  cards?: BusinessCard[] | null;
};

const getText = (value: unknown) => (value === null || value === undefined ? "" : String(value).trim());

export function BusinessCardBoard({ cards }: BusinessCardBoardProps) {
  const safeCards = Array.isArray(cards) ? cards : [];
  const visibleCards = safeCards.filter((card) => {
    if (!card || typeof card !== "object") {
      return false;
    }

    return !card.hidden && [card.name, card.role, card.phone, card.email].some((value) => getText(value));
  });

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <section className="business-card-board" aria-label="Showroom contacts">
      <div className="business-card-board-heading">
        <p>Need help?</p>
        <h2>Talk With The Showroom Team</h2>
      </div>

      <div className="business-card-grid">
        {visibleCards.map((card) => (
          <article
            key={card.id}
            className="business-card"
            style={{ "--card-accent": getText(card.accentColor) || "#55d6c2" } as CSSProperties}
          >
            <div className="business-card-photo">
              {getText(card.imageUrl) ? <img src={getText(card.imageUrl)} alt={getText(card.name) || "Showroom contact"} loading="lazy" /> : <UserRound aria-hidden="true" />}
            </div>

            <div className="business-card-copy">
              <h3>{getText(card.name) || "Showroom Contact"}</h3>
              {getText(card.role) ? <p>{getText(card.role)}</p> : null}

              <div className="business-card-links">
                {getText(card.phone) ? (
                  <span>
                    <Phone aria-hidden="true" />
                    {getText(card.phone)}
                  </span>
                ) : null}
                {getText(card.email) ? (
                  <span>
                    <Mail aria-hidden="true" />
                    {getText(card.email)}
                  </span>
                ) : null}
                {getText(card.website) ? (
                  <span>
                    <Globe2 aria-hidden="true" />
                    {getText(card.website)}
                  </span>
                ) : null}
              </div>

              {getText(card.note) ? <strong>{getText(card.note)}</strong> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
