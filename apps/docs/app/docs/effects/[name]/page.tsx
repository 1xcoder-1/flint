import { notFound } from "next/navigation";
import { EffectVariant } from "@/components/fx/effect-variant";
import { EFFECTS, effectBySlug, nextEffect, prevEffect } from "@/lib/effect-examples";

type Props = { params: Promise<{ name: string }> };

export function generateStaticParams() {
  return EFFECTS.map((e) => ({ name: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const effect = effectBySlug((await params).name);
  return { title: effect ? `${effect.name} effect` : "Effect" };
}

export default async function EffectPage({ params }: Props) {
  const effect = effectBySlug((await params).name);
  if (!effect) notFound();
  const prev = prevEffect(effect.slug);
  const next = nextEffect(effect.slug);

  return (
    <EffectVariant
      effect={effect}
      prev={prev ? { slug: prev.slug, name: prev.name } : null}
      next={next ? { slug: next.slug, name: next.name } : null}
    />
  );
}
