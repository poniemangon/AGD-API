const yahooFinance = require('yahoo-finance2').default;
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors({ origin: '*' }));

// Función que consulta la API de Yahoo Finance
const fetchYahooFinanceData = async (symbol) => {
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

// Ruta para obtener las cotizaciones en tiempo real
app.get('/quotes', async (req, res) => {
    const symbols = ['AGD.AX', 'AGLD.V', 'AGLDF', 'GOLD', 'SILVER'];
    
    let quotes = [];
    
    for (let symbol of symbols) {
        const quote = await fetchYahooFinanceData(symbol);
        if (quote) {
            quotes.push(quote);
        }
    }
    
    res.json(quotes);
});

app.get('/share-price-information', async (req, res) => {
    const symbols = ['AGD.AX', 'AGLD.V'];
    
    let quotes = [];
    
    for (let symbol of symbols) {
        const quote = await fetchYahooFinanceData(symbol);
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
