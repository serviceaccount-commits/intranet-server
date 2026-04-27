export function convertToCsv<T extends Record<string, any>>(
  data: T[],
  headers: Partial<Record<keyof T, string>>,
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const objectKeys = Object.keys(headers) as Array<keyof T>;
  const headerRow = objectKeys.map((key) => headers[key]);
  const csvRows = [headerRow.join(',')];

  for (const row of data) {
    const values = objectKeys.map((key) => {
      const value = row[key];
      const safeValue = value === null || value === undefined ? '' : value;
      const escaped = ('' + safeValue).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
