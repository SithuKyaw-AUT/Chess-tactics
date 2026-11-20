/**
 * Derives the step name and puzzle-id slug for a workbook JSON "series" value.
 * Shared by the JSON importer (browser) and the save-solution dev plugin (Node),
 * so both always agree on which puzzle id belongs to which file.
 */
export function getSeriesInfo(series: string): { step: string; stepSlug: string } {
  const base = series.endsWith('Workbook') ? series.slice(0, -'Workbook'.length) : series;
  const stepName = base
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d)([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .trim();
  const step = series.endsWith('Workbook') ? `${stepName} Workbook` : stepName;
  const stepSlug = stepName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return { step, stepSlug };
}
