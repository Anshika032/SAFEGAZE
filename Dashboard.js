// server.js - Main backend file for SAFEGAZE Content Moderation
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

// Configuration
const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/safegaze',
    wsPort: process.env.WS_PORT || 8080
};

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
let db;
async function connectToDatabase() {
    try {
        const client = new MongoClient(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db();
        return db;
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

// API Routes

// Get system status
app.get('/api/system/status', (req, res) => {
    res.json({
        api: { status: 'online', uptime: process.uptime() },
        monitoring: { status: 'active', threatsDetected: 7 },
        database: { status: 'connected', lastSync: new Date() },
        aiEngine: { status: 'processing', load: 68 }
    });
});

// Get dashboard metrics
app.get('/api/metrics/dashboard', async (req, res) => {
    try {
        const metrics = await db.collection('metrics').findOne({ type: 'dashboard' });
        res.json(metrics || {
            contentScanned: 1523876,
            violationsDetected: 5789,
            contentBlocked: 3241,
            accuracyRate: 99.7,
            responseTime: 0.43
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// Get content violations by category
app.get('/api/metrics/violations', async (req, res) => {
    try {
        const violations = await db.collection('violations').find().toArray();
        res.json(violations || [
            { category: 'Hate Speech', count: 1245, severity: 'high' },
            { category: 'Violence', count: 876, severity: 'high' },
            { category: 'Harassment', count: 1023, severity: 'medium' },
            { category: 'Inappropriate Content', count: 1589, severity: 'medium' },
            { category: 'Spam', count: 1056, severity: 'low' }
        ]);
    } catch (error) {
        console.error('Error fetching violations:', error);
        res.status(500).json({ error: 'Failed to fetch violations' });
    }
});

// Get recent threats
app.get('/api/threats/recent', async (req, res) => {
    try {
        const threats = await db.collection('threats')
            .find()
            .sort({ timestamp: -1 })
            .limit(5)
            .toArray();
        
        res.json(threats || [
            { id: 'T1001', type: 'Hate Speech', timestamp: new Date(), status: 'blocked' },
            { id: 'T1002', type: 'Phishing Attempt', timestamp: new Date(Date.now() - 300000), status: 'blocked' },
            { id: 'T1003', type: 'Malicious Link', timestamp: new Date(Date.now() - 600000), status: 'blocked' },
            { id: 'T1004', type: 'Explicit Content', timestamp: new Date(Date.now() - 1200000), status: 'reviewing' }
        ]);
    } catch (error) {
        console.error('Error fetching recent threats:', error);
        res.status(500).json({ error: 'Failed to fetch threats' });
    }
});

// Content moderation endpoint
app.post('/api/moderate/content', async (req, res) => {
    try {
        const { content, source, userId } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        // Simulate AI processing
        const result = await analyzeContent(content);
        
        // Save moderation result
        await db.collection('moderationResults').insertOne({
            content: content.substring(0, 100), // Save partial content for reference
            source,
            userId,
            result,
            timestamp: new Date()
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error moderating content:', error);
        res.status(500).json({ error: 'Failed to moderate content' });
    }
});

// Mock content analysis function (would be replaced with actual AI models)
async function analyzeContent(content) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple keyword analysis (would be replaced with ML models)
    const isSafe = !content.match(/violence|hate|explicit|phishing|malware/i);
    
    let detectedIssues = [];
    let category = 'safe';
    let action = 'allow';
    
    if (!isSafe) {
        // Detected potentially harmful content
        if (content.match(/violence/i)) detectedIssues.push('violence');
        if (content.match(/hate/i)) detectedIssues.push('hate_speech');
        if (content.match(/explicit/i)) detectedIssues.push('explicit_content');
        if (content.match(/phishing/i)) detectedIssues.push('phishing');
        if (content.match(/malware/i)) detectedIssues.push('malware');
        
        category = detectedIssues.length > 1 ? 'multiple_violations' : detectedIssues[0];
        action = 'block';
    }
    
    return {
        safe: isSafe,
        confidence: Math.random() * 20 + 80, // 80-100% confidence
        category,
        action,
        detectedIssues,
        processingTime: Math.random() * 0.5,
        timestamp: new Date()
    };
}

// WebSocket server for real-time updates
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial data
    ws.send(JSON.stringify({
        type: 'system_status',
        data: {
            apiStatus: 'online',
            monitoringStatus: 'active',
            databaseStatus: 'connected',
            aiEngineStatus: 'processing'
        }
    }));
    
    // Set up interval to send periodic updates
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            // Send random metrics for demo purposes
            ws.send(JSON.stringify({
                type: 'metrics_update',
                data: {
                    scanRate: Math.floor(Math.random() * 100) + 400,
                    cpuUsage: Math.floor(Math.random() * 30) + 40,
                    memoryUsage: Math.floor(Math.random() * 20) + 60,
                    activeThreats: Math.floor(Math.random() * 5)
                }
            }));
        }
    }, 5000);
    
    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected from WebSocket');
    });
});

// Start the server
async function startServer() {
    await connectToDatabase();
    
    server.listen(config.port, () => {
        console.log(`SAFEGAZE server running on port ${config.port}`);
        console.log(`WebSocket server running on port ${config.wsPort}`);
    });
}

startServer().catch(console.error);

// Export for testing
module.exports = { app, analyzeContent };