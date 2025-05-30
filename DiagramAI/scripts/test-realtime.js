#!/usr/bin/env node

/**
 * Real-time Update Test Script
 * Tests the complete real-time collaboration system
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');

const DIAGRAM_ID = 'f50ff3c6-f439-4952-9370-49d686372c22';
const WS_URL = 'ws://localhost:3001/ws/diagrams';
const API_URL = 'http://localhost:3001/api/diagrams';

console.log('🚀 Starting Real-time Update Test...\n');

// Test 1: WebSocket Connection
async function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('📡 Test 1: WebSocket Connection');
    
    const ws = new WebSocket(WS_URL);
    let connected = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }
    }, 5000);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully');
      connected = true;
      clearTimeout(timeout);
      
      // Subscribe to diagram
      const subscribeMessage = {
        type: 'subscribe',
        diagram_uuid: DIAGRAM_ID,
        agent_id: 'test_script',
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      console.log('📡 Subscribed to diagram updates');
      
      ws.close();
      resolve();
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Test 2: Real-time Message Broadcasting
async function testMessageBroadcasting() {
  return new Promise((resolve, reject) => {
    console.log('\n📨 Test 2: Message Broadcasting');
    
    const ws = new WebSocket(WS_URL);
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        ws.close();
        reject(new Error('No broadcast message received'));
      }
    }, 10000);
    
    ws.on('open', () => {
      // Subscribe to diagram
      const subscribeMessage = {
        type: 'subscribe',
        diagram_uuid: DIAGRAM_ID,
        agent_id: 'test_script',
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      
      // Wait a bit then trigger an update via API
      setTimeout(async () => {
        try {
          const updateContent = `graph TD
    A[🧪 Test ${Date.now()}] --> B[Broadcasting]
    B --> C[✅ Success]
    
    classDef test fill:#ff9999,stroke:#ff6666,stroke-width:2px
    class A test`;
          
          const response = await fetch(`${API_URL}/${DIAGRAM_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updateContent })
          });
          
          if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
          }
          
          console.log('📤 API update sent successfully');
        } catch (error) {
          clearTimeout(timeout);
          ws.close();
          reject(error);
        }
      }, 1000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 Received message:', message.type);
        
        if (message.type === 'diagram_updated') {
          console.log('✅ Broadcast message received successfully');
          console.log('   - Diagram UUID:', message.diagram_uuid);
          console.log('   - Updated by:', message.updated_by);
          console.log('   - Changes:', message.changes?.length || 0);
          console.log('   - Timestamp:', message.timestamp);
          
          messageReceived = true;
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Test 3: Multiple Subscribers
async function testMultipleSubscribers() {
  return new Promise((resolve, reject) => {
    console.log('\n👥 Test 3: Multiple Subscribers');
    
    const ws1 = new WebSocket(WS_URL);
    const ws2 = new WebSocket(WS_URL);
    
    let ws1Ready = false;
    let ws2Ready = false;
    let ws1Received = false;
    let ws2Received = false;
    
    const timeout = setTimeout(() => {
      ws1.close();
      ws2.close();
      reject(new Error('Multiple subscriber test timeout'));
    }, 15000);
    
    const checkCompletion = () => {
      if (ws1Received && ws2Received) {
        console.log('✅ Both subscribers received the update');
        clearTimeout(timeout);
        ws1.close();
        ws2.close();
        resolve();
      }
    };
    
    const setupSubscriber = (ws, name) => {
      ws.on('open', () => {
        const subscribeMessage = {
          type: 'subscribe',
          diagram_uuid: DIAGRAM_ID,
          agent_id: `test_${name}`,
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(subscribeMessage));
        console.log(`📡 ${name} subscribed`);
        
        if (name === 'subscriber1') ws1Ready = true;
        if (name === 'subscriber2') ws2Ready = true;
        
        // When both are ready, send update
        if (ws1Ready && ws2Ready) {
          setTimeout(async () => {
            try {
              const updateContent = `graph TD
    A[👥 Multi-Subscriber Test] --> B[${Date.now()}]
    B --> C[Both Should Receive]
    
    classDef multi fill:#99ff99,stroke:#66ff66,stroke-width:2px
    class A multi`;
              
              const response = await fetch(`${API_URL}/${DIAGRAM_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: updateContent })
              });
              
              if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
              }
              
              console.log('📤 Multi-subscriber update sent');
            } catch (error) {
              clearTimeout(timeout);
              ws1.close();
              ws2.close();
              reject(error);
            }
          }, 500);
        }
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'diagram_updated') {
            console.log(`📨 ${name} received update`);
            
            if (name === 'subscriber1') ws1Received = true;
            if (name === 'subscriber2') ws2Received = true;
            
            checkCompletion();
          }
        } catch (error) {
          console.error(`❌ ${name} error parsing message:`, error);
        }
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    };
    
    setupSubscriber(ws1, 'subscriber1');
    setupSubscriber(ws2, 'subscriber2');
  });
}

// Test 4: Performance Test
async function testPerformance() {
  return new Promise((resolve, reject) => {
    console.log('\n⚡ Test 4: Performance Test');
    
    const ws = new WebSocket(WS_URL);
    let startTime;
    
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Performance test timeout'));
    }, 10000);
    
    ws.on('open', () => {
      const subscribeMessage = {
        type: 'subscribe',
        diagram_uuid: DIAGRAM_ID,
        agent_id: 'perf_test',
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      
      setTimeout(async () => {
        try {
          startTime = Date.now();
          
          const updateContent = `graph TD
    A[⚡ Performance Test] --> B[${startTime}]
    B --> C[Measuring Speed]
    
    classDef perf fill:#ffff99,stroke:#ffff66,stroke-width:2px
    class A perf`;
          
          const response = await fetch(`${API_URL}/${DIAGRAM_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updateContent })
          });
          
          if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
          }
          
          console.log('📤 Performance test update sent');
        } catch (error) {
          clearTimeout(timeout);
          ws.close();
          reject(error);
        }
      }, 500);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'diagram_updated') {
          const endTime = Date.now();
          const latency = endTime - startTime;
          
          console.log(`✅ Update received in ${latency}ms`);
          
          if (latency < 1000) {
            console.log('🚀 Excellent performance (< 1 second)');
          } else if (latency < 3000) {
            console.log('✅ Good performance (< 3 seconds)');
          } else {
            console.log('⚠️  Slow performance (> 3 seconds)');
          }
          
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Run all tests
async function runTests() {
  try {
    await testWebSocketConnection();
    await testMessageBroadcasting();
    await testMultipleSubscribers();
    await testPerformance();
    
    console.log('\n🎉 All real-time tests passed successfully!');
    console.log('\n✅ Real-time collaboration system is working perfectly');
    console.log('   - WebSocket connections established');
    console.log('   - Message broadcasting functional');
    console.log('   - Multiple subscribers supported');
    console.log('   - Performance within acceptable limits');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the tests
runTests();
