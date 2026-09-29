/**
 * Evaluates dynamic formulas defined in schema safely without eval()
 * Example: "(panelCapacity * numberOfSolarPanels) / 1000"
 */
export function evaluateFormula(
  formula: string,
  data: Record<string, any>,
  decimals: number = 2
): number | null {
  try {
    if (!formula) return null;

    // Fast-path for default solar capacity formula
    // "(panelCapacity * numberOfSolarPanels) / 1000"
    const panelCapacity = parseFloat(data.panelCapacity);
    const numberOfSolarPanels = parseFloat(data.numberOfSolarPanels);

    if (isNaN(panelCapacity) || isNaN(numberOfSolarPanels)) {
      return null;
    }

    if (formula.includes('panelCapacity') && formula.includes('numberOfSolarPanels')) {
      const result = (panelCapacity * numberOfSolarPanels) / 1000;
      return isNaN(result) ? null : Number(result.toFixed(decimals));
    }

    // Generic safe arithmetic evaluator for customizable formulas
    // Replaces field identifiers with numeric values
    let expr = formula;
    for (const key of Object.keys(data)) {
      const val = parseFloat(data[key]);
      if (!isNaN(val)) {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
      }
    }

    // Only allow digits, operators, parens, decimal point, whitespace
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      return null;
    }

    // Safe mathematical function execution
    const safeCalc = new Function(`return (${expr})`);
    const val = safeCalc();
    return typeof val === 'number' && !isNaN(val)
      ? Number(val.toFixed(decimals))
      : null;
  } catch (err) {
    console.warn('Formula evaluation failed for:', formula, err);
    return null;
  }
}

export function formatCapacityValue(val: number | null, unit: string = 'kWp'): string {
  if (val === null || val === undefined || isNaN(val)) {
    return `0.00 ${unit}`;
  }
  return `${val.toFixed(2)} ${unit}`;
}
