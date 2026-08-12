"use client";

export default function ShopError({ reset }: { reset: () => void }) {
  return <main className="shop-error"><h1>The Panda Shop needs a moment.</h1><p>Our merchandise catalogue is temporarily unavailable. Please try again shortly.</p><button className="button button--secondary" type="button" onClick={reset}>Try again</button></main>;
}
