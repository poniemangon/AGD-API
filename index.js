const yahooFinance = require('yahoo-finance2').default;
const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Configuración de la aplicación Express
const app = express();
const PORT = 3000;

// Ruta para obtener las cotizaciones desde el archivo JSON
app.get('/quotes', (req, res) => {
    fs.readFile(path.join(__dirname, 'quotes.json'), 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send({ message: 'Error al leer el archivo JSON' });
        }
        res.json(JSON.parse(data));
    });
});

// Función que consulta la API de Yahoo Finance
const fetchYahooFinanceData = async (symbol) => {
    try {
        const quote = await yahooFinance.quote(symbol);
        
        return {
            symbol,
            price: quote.regularMarketPrice,
            changesPercent: quote.regularMarketChangePercent
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
};

// Función que guarda las cotizaciones en un archivo JSON
const saveQuotesToJson = (quotes) => {
    fs.writeFile(path.join(__dirname, 'quotes.json'), JSON.stringify(quotes, null, 2), (err) => {
        if (err) {
            console.error('Error saving quotes:', err);
        } else {
            console.log('Cotizaciones guardadas exitosamente');
        }
    });
};

// Función que actualiza las cotizaciones dos veces al día (cada 12 horas)
const updateQuotes = async () => {
    const symbols = ['AGD.AX', 'AGLD.V']; // Los símbolos de Austral Gold en Yahoo Finance
    
    let quotes = [];
    
    for (let symbol of symbols) {
        const quote = await fetchYahooFinanceData(symbol);
        if (quote) {
            quotes.push(quote);
        }
    }

    saveQuotesToJson(quotes);
};

// Programar el scraping para que se ejecute dos veces al día (a las 9:00 AM y 9:00 PM)
cron.schedule('0 9,21 * * *', updateQuotes); // 9:00 AM y 9:00 PM

// Iniciar la API en el puerto 3000
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
    // Realizar el primer scraping al iniciar la aplicación
    updateQuotes();
});
