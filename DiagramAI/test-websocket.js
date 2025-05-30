const WebSocket = require('ws');

// Test WebSocket connection to demonstrate real-time updates
const ws = new WebSocket('ws://localhost:3001/ws/diagrams');

ws.on('open', function open() {
  console.log('🔌 Connected to DiagramAI WebSocket');
  
  // Subscribe to a real diagram
  const subscribeMessage = {
    type: 'subscribe',
    diagram_uuid: 'f50ff3c6-f439-4952-9370-49d686372c22',
    agent_id: 'test_agent',
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(subscribeMessage));
  console.log('📡 Subscribed to diagram');
  
  // Simulate agent making changes every 3 seconds
  let changeCount = 0;
  const interval = setInterval(() => {
    changeCount++;
    
    const updateMessage = {
      type: 'agent_operation',
      diagram_uuid: 'f50ff3c6-f439-4952-9370-49d686372c22',
      operation: 'update_node',
      data: {
        nodeId: 'test-node',
        changes: {
          label: `Updated ${changeCount} times`,
          timestamp: new Date().toISOString()
        }
      },
      agent_id: 'test_agent',
      request_id: `req_${Date.now()}`
    };
    
    ws.send(JSON.stringify(updateMessage));
    console.log(`🔄 Sent update ${changeCount}`);
    
    if (changeCount >= 5) {
      clearInterval(interval);
      ws.close();
      console.log('✅ Test completed');
    }
  }, 3000);
});

ws.on('message', function message(data) {
  const msg = JSON.parse(data.toString());
  console.log('📨 Received:', msg.type, msg);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});
