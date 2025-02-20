const yahooFinance = require('yahoo-finance2').default;
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors({ origin: '*' }));

// Función que consulta la API de Yahoo Finance para obtener datos históricos
const fetchYahooFinanceData = async (symbol) => {
    const now = new Date();
    const to = new Date(now.setHours(0, 0, 0, 0));

    const from = new Date(to);
    from.setMonth(to.getMonth() - 120);  // 120 meses atrás

    try {
        const chartData = await yahooFinance.historical(symbol, {
            period1: from.toISOString(),
            period2: to.toISOString(),
            interval: '1d',
        });

        const output = chartData.map(data => ({
            date: data.date.getTime() / 1000, // Convertir a timestamp Unix
            close: data.close,
            low: data.low,
            open: data.open,
            high: data.high,
            volume: data.volume
        }));

        return output;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
};

// Función que consulta la API de Yahoo Finance para obtener cotizaciones en tiempo real
const fetchYahooFinanceQuote = async (symbol) => {
    try {
        const quote = await yahooFinance.quote(symbol);
        return {
            symbol,
            price: quote.regularMarketPrice,
            percent: quote.regularMarketChangePercent,
            bid: quote.bid,
            ask: quote.ask,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            prevClose: quote.regularMarketPreviousClose,
            volume: quote.regularMarketVolume,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
};

// Ruta para obtener los datos históricos de cotizaciones de AGD y AGLD
app.get('/get-quotes-for-agd', async (req, res) => {
    const symbol = 'AGD.AX';  // Ticker para AGD

    const data = await fetchYahooFinanceData(symbol);

    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Request failed');
    }
});

// Ruta para obtener los datos históricos de cotizaciones de AGLD
app.get('/get-quotes-for-agld', async (req, res) => {
    const symbol = 'AGLD.V';  // Ticker para AGLD

    const data = await fetchYahooFinanceData(symbol);

    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Request failed');
    }
});

// Ruta para obtener cotizaciones en tiempo real
app.get('/quotes', async (req, res) => {
    const symbols = ['AGD.AX', 'AGLD.V', 'AGLDF', 'GOLD', 'SILVER'];

    let quotes = [];

    for (let symbol of symbols) {
        const quote = await fetchYahooFinanceQuote(symbol);
        if (quote) {
            quotes.push(quote);
        }
    }

    res.json(quotes);
});

// Ruta para obtener cotizaciones en tiempo real para AGD y AGLD
app.get('/share-price-information', async (req, res) => {
    const symbols = ['AGD.AX', 'AGLD.V'];

    let quotes = [];

    for (let symbol of symbols) {
        const quote = await fetchYahooFinanceQuote(symbol);
        if (quote) {
            quotes.push(quote);
        }
    }

    res.json(quotes);
});

// Iniciar la API
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
