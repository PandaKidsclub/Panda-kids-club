export interface DemoCartState {
  lines: Array<{ quantity: number; variantId: string }>;
}

export function parseDemoCart(value: string | undefined): DemoCartState {
  if (!value) return { lines: [] };
  try {
    const parsed = JSON.parse(value) as DemoCartState;
    return Array.isArray(parsed.lines)
      ? { lines: parsed.lines.filter((line) => typeof line.variantId === "string" && Number.isInteger(line.quantity) && line.quantity > 0) }
      : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export function addDemoCartLine(state: DemoCartState, variantId: string, quantity: number): DemoCartState {
  const current = state.lines.find((line) => line.variantId === variantId);
  return {
    lines: current
      ? state.lines.map((line) => line.variantId === variantId ? { ...line, quantity: line.quantity + quantity } : line)
      : [...state.lines, { variantId, quantity }],
  };
}

export function updateDemoCartLine(state: DemoCartState, variantId: string, quantity: number): DemoCartState {
  return { lines: state.lines.flatMap((line) => line.variantId !== variantId ? [line] : quantity > 0 ? [{ ...line, quantity }] : []) };
}

export function removeDemoCartLine(state: DemoCartState, variantId: string): DemoCartState {
  return updateDemoCartLine(state, variantId, 0);
}
