// ============================================================================
// Server Entry Point
// ============================================================================
// This file initializes the HTTP server, applies environmental configuration,
// and forces custom DNS resolvers to avoid flaky local DNS lookups for Atlas.

// Set DNS servers to Google DNS and Cloudflare DNS to bypass flaky local ISP DNS (only locally).
// Overriding DNS globally on Render breaks their internal DNS configuration for Atlas queries.
if (!process.env.RENDER) {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const http = require('http');
require('dotenv').config(); // Load environment variables from .env

const port = process.env.PORT || 5001; // Port fallback to 5001
const app = require('./app'); // Core Express Application

// Create and start the HTTP server
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`[INFO] Server is running on port ${port}`);
});