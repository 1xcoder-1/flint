import Link from "next/link";
import { EFFECTS, EFFECT_GROUPS } from "@/lib/effect-examples";

export const metadata = { title: "Effects" };

export default function EffectsPage() {
  return (
    <>
      <h1>Effects</h1>
      <p className="lead">
        Twenty-three grain effects for any view — dust it away, gather it back, or
        tear it apart with a gesture. Each one is one call to the shared engine.
      </p>

      {EFFECT_GROUPS.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          <div className="cat-grid" aria-label={`${group} effects`}>
            {EFFECTS.filter((e) => e.group === group).map((e, i) => (
              <Link key={e.slug} href={`/docs/effects/${e.slug}`} className="cat-cell">
                <span className="cat-idx" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="cat-name">{e.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
