const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const PORT = 4500;
const BASE_DIR = "./content"; // Change to your content directory

const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Parse the URL and remove query params
    let requestPath = req.url.split("?")[0];

    // Security: prevent directory traversal
    requestPath = path.normalize(requestPath).replace(/^(\.\.[\/\\])+/, "");

    // Remove leading slash for path.join
    if (requestPath.startsWith("/")) {
      requestPath = requestPath.slice(1);
    }

    const fullPath = path.join(BASE_DIR, requestPath);
    const contentJsonPath = path.join(fullPath, ".content.json");

    console.log(`Request: ${req.url} -> ${contentJsonPath}`);

    // Check if path is a directory first
    try {
      const stats = await fs.stat(fullPath);

      if (!stats.isDirectory()) {
        // Path exists but is a file, not a directory - 404
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }

      // It's a directory - get children
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const children = entries
        .filter((entry) => !entry.name.startsWith("."))
        .map((entry) => ({
          name: entry.name,
          path: path.join("/", requestPath, entry.name).replace(/\\/g, "/"),
          type: entry.isDirectory() ? "aemm:folder" : "aemm:file",
        }));

      // Try to read .content.json
      let contentData;
      try {
        const data = await fs.readFile(contentJsonPath, "utf8");
        contentData = JSON.parse(data);
      } catch (err) {
        // .content.json doesn't exist, use default
        contentData = {
          "scr:type": "aemm:folder",
          path: "/" + requestPath.replace(/\\/g, "/"),
        };
      }

      // Merge children into the content
      contentData.children = children;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(contentData, null, 2));
    } catch (err) {
      // Path doesn't exist - 404
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving from: ${path.resolve(BASE_DIR)}`);
});
