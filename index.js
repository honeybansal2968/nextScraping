const express = require('express');
const puppeteer = require('puppeteer');

const path = require('path')

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8090;

// app.use(express.static(path.join(__dirname, 'public')))
//     .set('views', path.join(__dirname, 'views'))
//     .set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api', (req, res) => {
    res.json({ "msg": "Hello world" });
});


app.get('/scrape', async (req, res) => {
    const url = 'https://www.reddit.com/search/?q=skin+care+ai';  // Default URL if no URL is provided in query

    try {
        const args = puppeteer.defaultArgs();
        // IMPORTANT: you can't render shadow DOM without this flag
        // getInnerHTML will be undefined without it
        args.push('--enable-experimental-web-platform-features');
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: true, // Run in headless mode (no UI)
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable sandboxing (required for certain environments)
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.134 Safari/537.36');

        // Go to the provided URL
        await page.goto(url, {
            waitUntil: "networkidle0"
        });
        // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        const selector = 'a[data-testid="post-title"]';
        // var html = await page.title();
        // Remove scripts and html imports. They've already executed.
        // await page.evaluate(() => {
        //     const elements = document.querySelectorAll('script, link[rel="import"]');
        //     elements.forEach(e => e.remove());
        // });

        // const html = await page.$eval('html', (element) => {
        //     return element.innerHTML;
        // });
        // // print length of html
        // console.log(html.length);
        // // Close the page we opened here (not the browser).
        // await page.close();
        var data = []
        await page.waitForSelector(selector, { visible: true, hidden: true, timeout: 4000 });
        data = await page.evaluate(() => {
            const anchors = document.querySelectorAll("a[data-testid='post-title']");
            var hrefs = []
            anchors.forEach(anchor => {
                console.log("anchor", anchor.href);
                hrefs.push(anchor.href);
            })
            return hrefs
            // if (shreddit) {
            //     queries = shreddit.querySelectorAll("a[data-testid='post-title']");
            //     console.log("queries", queries);
            //     return queries

            // }
        })
        // for (let index = 0; index < data.length; index++) {
        //     const element = data[index].innerHTML;
        //     console.log("element", element);
        // }
        // await page.waitForSelector("shreddit-app", { visible: true });
        // const hrefs = await page.evaluate(() => {
        //     const walk = root => [
        //         ...[...root.querySelectorAll("shreddit-app")]
        //             .map(e => e.getAttribute("href")),
        //         ...[...root.querySelectorAll("*")]
        //             .filter(e => e.shadowRoot)
        //             .flatMap(e => walk(e.shadowRoot))
        //     ];


        //     return walk(document);
        // });
        // console.log(hrefs);
        // console.log(hrefs.length);
        // Scrape data from the page (including Shadow DOM handling)
        // const data = await page.evaluate(() => {
        //     // Function to extract links from Shadow DOMs
        //     const getLinksFromShadowDom = (hostElement) => {
        //         const shadowRoot = hostElement.shadowRoot;  // Access shadow root
        //         if (!shadowRoot) return [];

        //         const links = shadowRoot.querySelectorAll('a');  // Query all <a> tags in shadow root
        //         const hrefs = [];
        //         links.forEach(link => hrefs.push(link.href));  // Push each link's href to array
        //         return hrefs;
        //     };

        //     const allLinks = [];

        //     // Look for elements inside the main DOM (outside shadow DOMs)
        //     const mainLinks = document.querySelectorAll('a');  // Scraping links in the main DOM
        //     mainLinks.forEach(link => allLinks.push(link.href));

        //     // Look for shadow hosts on the page (i.e., elements that contain shadow roots)
        //     const shadowHostElements = document.querySelectorAll('*');  // Query all elements (you can refine this selector if needed)
        //     shadowHostElements.forEach(host => {
        //         if (host.shadowRoot) {
        //             const shadowLinks = getLinksFromShadowDom(host);  // Get links from the shadow DOM
        //             allLinks.push(...shadowLinks);  // Add those links to the final list
        //         }
        //     });

        //     return allLinks;  // Return the complete list of links
        // });

        // Close the browser
        await browser.close();

        // Send the scraped data as JSON response
        res.json({ links: data });
    } catch (error) {
        console.error('Error scraping the page:', error);
        res.status(500).json({ error: 'Failed to scrape the page' });
    }
});



app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})

