const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8001;
const baseDir = path.join(__dirname, 'projects/agent-pm-system/web');

const server = http.createServer((req, res) => {
    let filePath = path.join(baseDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        
        let ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.json') contentType = 'application/json';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
