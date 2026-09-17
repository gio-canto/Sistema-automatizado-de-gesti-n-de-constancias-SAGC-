export async function fetchAdminConsoleSummary() {
  const response = await fetch('/api/admin/console/summary', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    const error = new Error(
      data?.error || 'No fue posible cargar la consola administrativa.'
    );
    error.status = response.status;
    throw error;
  }

  return data.summary;
}
