import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  FaEye, 
  FaChartLine, 
  FaShieldAlt, 
  FaLock, 
  FaFire, 
  FaExclamationTriangle 
} from 'react-icons/fa';

function App() {
  const [monitoringValue, setMonitoringValue] = useState(70);
  const [policyValue, setPolicyValue] = useState(34);
  const [cpuData, setCpuData] = useState<number[]>([]);
  
  // Generate sample data for the graph on component mount
  useEffect(() => {
    const newData: number[] = [];
    for (let i = 0; i <= 18; i++) {
      newData.push(Math.floor(Math.random() * 75) + 25);
    }
    setCpuData(newData);
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="branding">
            <h1>SAFEGAZE<span className="registered">®</span></h1>
            <h2>CONTENT MODERATION</h2>
          </div>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot green"></span>
              <span className="status-text">SYSTEM ONLINE</span>
            </div>
            <div className="status-item">
              <span className="status-dot blue"></span>
              <span className="status-text">MONITORING ACTIVE</span>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="sidebar">
            <div className="menu-items">
              <div className="menu-item">
                <div className="menu-item-header">
                  <div className="menu-icon blue"><FaEye /></div>
                  <span>Content Review</span>
                  <span className="chevron">▼</span>
                </div>
              </div>
              <div className="menu-item">
                <div className="menu-item-header">
                  <div className="menu-icon blue"><FaEye /></div>
                  <span>Content Review</span>
                  <span className="chevron">▼</span>
                </div>
              </div>
              <div className="menu-item">
                <div className="menu-item-header">
                  <div className="menu-icon blue"><FaChartLine /></div>
                  <span>Content Meter</span>
                  <span className="chevron">▼</span>
                </div>
              </div>
              <div className="menu-item">
                <div className="menu-item-header">
                  <div className="menu-icon blue"><FaShieldAlt /></div>
                  <span>Comprehensive Mode</span>
                  <span className="chevron">▼</span>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>DASHBOARD</h2>
              <div className="progress-bars">
                <div className="progress-item">
                  <div className="progress-label">Content</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: '78%' }}></div>
                  </div>
                  <div className="progress-value">78%</div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">System</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: '65%' }}></div>
                  </div>
                  <div className="progress-value">65%</div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">Output</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: '92%' }}></div>
                  </div>
                  <div className="progress-value">92%</div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">System</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: '45%' }}></div>
                  </div>
                  <div className="progress-value">45%</div>
                </div>
              </div>
            </div>

            <div className="dashboard-title">
              <h2>DASHBOARD</h2>
            </div>
          </div>

          <div className="main-content">
            <div className="monitoring-circle">
              <div className="outer-circle">
                <div className="circle-label top">MONITORING</div>
                <div className="circle-label bottom">POLICY ENFORCEMENT</div>
                <div className="circle-value left">{monitoringValue}%</div>
                <div className="circle-value right">{policyValue}%</div>
                <div className="middle-circle">
                  <div className="inner-circle">
                    <div className="core-circle"></div>
                  </div>
                </div>
                <div className="circle-dots">
                  <div className="dot dot1"></div>
                  <div className="dot dot2"></div>
                  <div className="dot dot3"></div>
                  <div className="dot dot4"></div>
                  <div className="dot dot5"></div>
                  <div className="dot dot6"></div>
                  <div className="dot dot7"></div>
                  <div className="dot dot8"></div>
                </div>
              </div>

              <div className="graph-container">
                <div className="graph">
                  {cpuData.map((value, index) => (
                    <div key={index} className="graph-bar" style={{ height: `${value}%` }}></div>
                  ))}
                </div>
                <div className="graph-labels">
                  {Array.from({ length: 19 }, (_, i) => (
                    <div key={i} className="graph-label">{i}</div>
                  ))}
                </div>
              </div>

              <div className="system-metrics">
                <div className="metric">CPU</div>
                <div className="metric">RAM</div>
                <div className="metric">NETWORK</div>
                <div className="metric">STORAGE</div>
              </div>
            </div>

            <div className="right-panel">
              <div className="panel ai-content">
                <h3>AI modeled content</h3>
                <p>
                  Content analysis and moderation metrics show improved
                  detection rates across all categories with 97.8% accuracy
                  in identifying policy violations.
                </p>
                <div className="status-indicators small">
                  <div className="status-item">
                    <span className="status-dot green"></span>
                    <span className="status-text">ACTIVE</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot blue"></span>
                    <span className="status-text">PROCESSING</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot purple"></span>
                    <span className="status-text">LEARNING</span>
                  </div>
                </div>
              </div>

              <div className="panel content-distribution">
                <div className="panel-header">
                  <h3>Content Distribution</h3>
                  <div className="real-time">REAL-TIME</div>
                </div>
                <div className="distribution-graph">
                  <div className="wave"></div>
                </div>
                <div className="pagination-dots">
                  <div className="pagination-dot active"></div>
                  <div className="pagination-dot"></div>
                  <div className="pagination-dot"></div>
                  <div className="pagination-dot"></div>
                  <div className="pagination-dot"></div>
                </div>
              </div>

              <div className="panel ai-model">
                <h3>AI Model Integrance</h3>
              </div>

              <div className="panel security-metrics">
                <div className="panel-header">
                  <h3>Security Metrics</h3>
                  <div className="protected">PROTECTED</div>
                </div>
                <div className="security-items">
                  <div className="security-row">
                    <div className="security-item">
                      <FaLock /> Encryption: <span className="active-text">Active</span>
                    </div>
                    <div className="security-item">
                      <FaShieldAlt /> Firewall: <span className="active-text">Active</span>
                    </div>
                  </div>
                  <div className="security-row">
                    <div className="security-item">
                      <FaFire /> Threats: <span className="orange-text">3 Blocked</span>
                    </div>
                    <div className="security-item">
                      <FaExclamationTriangle /> Alerts: <span className="yellow-text">2 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;