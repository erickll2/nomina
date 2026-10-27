export interface BCVResponse {
  rate: number;
  source: string;
  timestamp: string;
}

export const fetchBCVRate = async (): Promise<BCVResponse | null> => {
  const apis = [
    {
      url: 'https://ve.dolarapi.com/v1/dolares/oficial',
      parse: (data: any) => {
        if (data && data.promedio) return parseFloat(data.promedio);
        if (data && data.precio) return parseFloat(data.precio);
        return null;
      },
      name: 'DolarApi BCV Oficial',
    },
    {
      url: 'https://pydolarve.org/api/v1/dollar?page=bcv',
      parse: (data: any) => {
        if (data && data.monedas && data.monedas.usd) {
          const val = data.monedas.usd.promedio || data.monedas.usd.precio;
          if (val) return parseFloat(val);
        }
        if (data && data.price) return parseFloat(data.price);
        return null;
      },
      name: 'PyDolarVE BCV',
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const rate = api.parse(json);
        if (rate && !isNaN(rate) && rate > 0) {
          return {
            rate: parseFloat(rate.toFixed(2)),
            source: api.name,
            timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }
    } catch (err) {
      console.warn(`Error al consultar ${api.name}:`, err);
    }
  }

  return null;
};
