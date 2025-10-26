import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import {App} from "./components/App.tsx";

Deno.serve(
    {
        port: 8080,
    },
    async (req) => {
        const url = new URL(req.url);

        if (url.pathname === '/client.js') {
            await Deno.bundle({
                minify: true,
                outputPath: "client.js",
                entrypoints: ['./client.jsx'],
            });
            const clientCode = await Deno.readTextFile('client.js');
            return new Response(clientCode, {
                headers: {
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        const stream = await renderToReadableStream(React.createElement(App));
        const reader = stream.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const appHtml = new TextDecoder().decode(
            new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
        );

        const html = `
        <html>
<head>
    <meta charset="UTF-8">
    <title>SSR PoC</title>
</head>
<body>
    <div id="root">${appHtml}</div>
    <script type="module" src="/client.js"></script>
</body>
</html>`;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
);