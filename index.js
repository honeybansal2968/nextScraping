const express = require('express');
const puppeteer = require('puppeteer');

const path = require('path')

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api', (req, res) => {
    res.json({ "msg": "Hello world" });
});


// Define an endpoint to handle scraping
app.get('/scrape', async (req, res) => {
    const url = req.query.url || 'https://www.apple.com';  // Default URL if no URL is provided in query

    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: true, // Run in headless mode (no UI)
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable sandboxing (required for certain environments)
        });
        const page = await browser.newPage();

        // Go to the provided URL
        await page.goto(url);

        // Scrape data from the page
        const data = await page.evaluate(() => {
            // Extract data from the page using JavaScript
            const heading = document.querySelector('h1') ? document.querySelector('h1').innerText : 'No heading found';
            return { heading };
        });

        // Close the browser
        await browser.close();

        // Send the scraped data as JSON response
        res.json(data);
    } catch (error) {
        console.error('Error scraping the page:', error);
        res.status(500).json({ error: 'Failed to scrape the page' });
    }
});



app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})