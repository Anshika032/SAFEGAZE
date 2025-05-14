// frontend.js - Client-side JavaScript for SAFEGAZE Content Moderation
document.addEventListener('DOMContentLoaded', function() {
  // Initialize WebSocket connection
  const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
  
  // DOM Elements
  const statusIndicators = document.querySelectorAll('.indicator-dot');
  const resourceValues = document.querySelectorAll('.resource-value');
  const metricValues = document.querySelectorAll('.metric-value');
  const metricFills = document.querySelectorAll('.metric-fill');
  const chartBars = document.querySelectorAll('.chart-bar');
  
  // WebSocket event handlers
  ws.onopen = () => {
      console.log('Connected to SAFEGAZE server');
      updateStatusIndicator('dot-green', true);
  };
  
  ws.onclose = () => {
      console.log('Disconnected from SAFEGAZE server');
      updateStatusIndicator('dot-green', false);
  };
  
  ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      updateStatusIndicator('dot-green', false);
  };
  
  ws.onmessage = (event) => {
      try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
      } catch (error) {
          console.error('Error processing message:', error);
      }
  };
  
  // Handle incoming WebSocket messages
  function handleWebSocketMessage(message) {
      switch(message.type) {
          case 'system_status':
              updateSystemStatus(message.data);
              break;
          case 'metrics_update':
              updateMetrics(message.data);
              break;
          case 'new_threat':
              addNewThreat(message.data);
              break;
          default:
              console.log('Unknown message type:', message.type);
      }
  }
  
  // Update system status indicators
  function updateSystemStatus(data) {
      if (data.apiStatus === 'online') updateStatusIndicator('dot-green', true);
      if (data.monitoringStatus === 'active') updateStatusIndicator('dot-blue', true);
      
      // Update status text if elements exist
      updateElementTextIfExists('#api-status', data.apiStatus);
      updateElementTextIfExists('#monitoring-status', data.monitoringStatus);
      updateElementTextIfExists('#database-status', data.databaseStatus);
      updateElementTextIfExists('#ai-engine-status', data.aiEngineStatus);
  }
  
  // Update metrics with new data
  function updateMetrics(data) {
      // Update resource monitors
      if (data.scanRate) updateElementTextIfExists('#scan-rate', `${data.scanRate}/s`);
      if (data.cpuUsage) {
          updateElementTextIfExists('#cpu-usage', `${data.cpuUsage}%`);
          updateResourceGraph('#cpu-graph', data.cpuUsage);
      }
      if (data.memoryUsage) {
          updateElementTextIfExists('#memory-usage', `${data.memoryUsage}%`);
          updateResourceGraph('#memory-graph', data.memoryUsage);
      }
      if (data.activeThreats) {
          updateElementTextIfExists('#active-threats', data.activeThreats);
          updateStatusIndicator('dot-red', data.activeThreats > 0);
      }
      
      // Update chart bars with random heights for visualization
      updateChartBars();
  }
  
  // Add a new threat to the threat list
  function addNewThreat(threat) {
      const threatList = document.querySelector('.threat-list');
      if (!threatList) return;
      
      const threatItem = document.createElement('div');
      threatItem.className = 'threat-item';
      threatItem.innerHTML = `
          <div class="threat-info">
              <div class="threat-type">${threat.type}</div>
          </div>
          <div class="threat-time">${formatTime(threat.timestamp)}</div>
      `;
      
      // Add to the top of the list
      threatList.insertBefore(threatItem, threatList.firstChild);
      
      // Remove the last item if there are too many
      if (threatList.children.length > 5) {
          threatList.removeChild(threatList.lastChild);
      }
      
      // Flash the threat indicator
      flashElement('.dot-red');
  }
  
  // Helper Functions
  
  // Update status indicator visibility
  function updateStatusIndicator(className, isActive) {
      const indicator = document.querySelector(`.${className}`);
      if (indicator) {
          indicator.style.opacity = isActive ? 1 : 0.3;
      }
  }
  
  // Update element text if the element exists
  function updateElementTextIfExists(selector, text) {
      const element = document.querySelector(selector);
      if (element) element.textContent = text;
  }
  
  // Update resource graph visualization
  function updateResourceGraph(selector, percentage) {
      const graph = document.querySelector(selector);
      if (graph) {
          graph.style.width = `${percentage}%`;
          
          // Change color based on percentage
          if (percentage > 80) {
              graph.style.backgroundColor = 'var(--danger-red)';
          } else if (percentage > 60) {
              graph.style.backgroundColor = 'var(--warning-yellow)';
          } else {
              graph.style.backgroundColor = 'var(--active-green)';
          }
      }
  }
  
  // Update chart bars with random values
  function updateChartBars() {
      chartBars.forEach(bar => {
          const height = Math.floor(Math.random() * 70) + 30;
          bar.style.height = `${height}px`;
      });
  }
  
  // Flash an element briefly
  function flashElement(selector) {
      const element = document.querySelector(selector);
      if (!element) return;
      
      element.style.boxShadow = '0 0 10px var(--danger-red)';
      setTimeout(() => {
          element.style.boxShadow = 'none';
      }, 1000);
  }
  
  // Format timestamp
  function formatTime(timestamp) {
      if (!timestamp) return 'Just now';
      
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Initialize dashboard elements
  function initializeDashboard() {
      // Set initial random heights for chart bars
      updateChartBars();
      
      // Add click handlers to menu items
      document.querySelectorAll('.menu-item').forEach(item => {
          item.addEventListener('click', function() {
              console.log('Menu item clicked:', this.textContent.trim());
          });
      });
      
      // Add click handlers to nav cards
      document.querySelectorAll('.nav-card').forEach(card => {
          card.addEventListener('click', function() {
              console.log('Navigation card clicked:', this.querySelector('.nav-title').textContent);
          });
      });
      
      // Fetch initial data from API
      fetchDashboardData();
  }
  
  // Fetch dashboard data from API
  async function fetchDashboardData() {
      try {
          // Fetch system status
          const statusResponse = await fetch('/api/system/status');
          const statusData = await statusResponse.json();
          updateSystemStatus(statusData);
          
          // Fetch dashboard metrics
          const metricsResponse = await fetch('/api/metrics/dashboard');
          const metricsData = await metricsResponse.json();
          updateDashboardMetrics(metricsData);
          
          // Fetch violations data
          const violationsResponse = await fetch('/api/metrics/violations');
          const violationsData = await violationsResponse.json();
          updateViolationsList(violationsData);
          
          // Fetch recent threats
          const threatsResponse = await fetch('/api/threats/recent');
          const threatsData = await threatsResponse.json();
          updateThreatsList(threatsData);
      } catch (error) {
          console.error('Error fetching dashboard data:', error);
      }
  }
  
  // Update dashboard metrics
  function updateDashboardMetrics(data) {
      if (data.contentScanned) updateElementTextIfExists('#content-scanned', formatNumber(data.contentScanned));
      if (data.violationsDetected) updateElementTextIfExists('#violations-detected', formatNumber(data.violationsDetected));
      if (data.contentBlocked) updateElementTextIfExists('#content-blocked', formatNumber(data.contentBlocked));
      if (data.accuracyRate) updateElementTextIfExists('#accuracy-rate', `${data.accuracyRate}%`);
      if (data.responseTime) updateElementTextIfExists('#response-time', `${data.responseTime}s`);
  }
  
  // Update violations list
  function updateViolationsList(violations) {
      const violationList = document.querySelector('.violation-list');
      if (!violationList) return;
      
      violationList.innerHTML = '';
      
      violations.forEach(violation => {
          const item = document.createElement('div');
          item.className = 'violation-item';
          item.innerHTML = `
              <div class="violation-name">${violation.category}</div>
              <div class="violation-count">${formatNumber(violation.count)}</div>
          `;
          violationList.appendChild(item);
      });
  }
  
  // Update threats list
  function updateThreatsList(threats) {
      const threatList = document.querySelector('.threat-list');
      if (!threatList) return;
      
      threatList.innerHTML = '';
      
      threats.forEach(threat => {
          const item = document.createElement('div');
          item.className = 'threat-item';
          item.innerHTML = `
              <div class="threat-info">
                  <div class="threat-type">${threat.type}</div>
              </div>
              <div class="threat-time">${formatTime(threat.timestamp)}</div>
          `;
          threatList.appendChild(item);
      });
  }
  
  // Format large numbers
  function formatNumber(num) {
      if (num >= 1000000) {
          return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
  }
  
  // Initialize dashboard
  initializeDashboard();
  
  // Set up content moderation form if it exists
  const moderationForm = document.querySelector('#moderation-form');
  if (moderationForm) {
      moderationForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const contentInput = this.querySelector('#content-input');
          if (!contentInput || !contentInput.value.trim()) return;
          
          try {
              const response = await fetch('/api/moderate/content', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      content: contentInput.value,
                      source: 'web-dashboard',
                      userId: 'admin'
                  })
              });
              
              const result = await response.json();
              displayModerationResult(result);
              
              // Clear input
              contentInput.value = '';
          } catch (error) {
              console.error('Error submitting content for moderation:', error);
          }
      });
  }
  
  // Display moderation result
  function displayModerationResult(result) {
      const resultContainer = document.querySelector('#moderation-result');
      if (!resultContainer) return;
      
      resultContainer.innerHTML = `
          <div class="moderation-result ${result.safe ? 'safe' : 'unsafe'}">
              <div class="result-header">
                  <span class="result-status">${result.safe ? 'Content Safe' : 'Violation Detected'}</span>
                  <span class="result-confidence">${result.confidence.toFixed(1)}% Confidence</span>
              </div>
              ${!result.safe ? `
              <div class="result-details">
                  <div class="result-category">Category: ${result.category.replace('_', ' ')}</div>
                  <div class="result-action">Action: ${result.action}</div>
                  <div class="detected-issues">
                      Detected issues: ${result.detectedIssues.map(issue => issue.replace('_', ' ')).join(', ')}
                  </div>
              </div>
              ` : ''}
              <div class="result-time">Processing time: ${result.processingTime.toFixed(3)}s</div>
          </div>
      `;
      
      // Scroll to result
      resultContainer.scrollIntoView({ behavior: 'smooth' });
  }
});