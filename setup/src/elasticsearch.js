#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Configuration
const CONFIG = {
  elasticsearch: {
    url: process.env.ES_URL || 'http://elasticsearch:9200',
    username: process.env.ELASTIC_USERNAME || 'elastic',
    password: process.env.ELASTIC_PASSWORD
  },
  credentials: {
    kibana: process.env.KIBANA_SYSTEM_PASSWORD,
  },
  retryInterval: 5000, // 5 seconds
};

/**
 * Create an axios instance for Elasticsearch API
 * @returns {Object} Axios instance
 */
const createApiClient = () => {
  return axios.create({
    baseURL: CONFIG.elasticsearch.url,
    auth: {
      username: CONFIG.elasticsearch.username,
      password: CONFIG.elasticsearch.password
    },
    validateStatus: () => true // Don't throw on non-2xx responses
  });
};

/**
 * Wait for Elasticsearch to be ready
 */
const waitForElasticsearch = async () => {
  console.log('Waiting for Elasticsearch to be ready...');
  const apiClient = createApiClient();
  
  let isReady = false;
  while (!isReady) {
    try {
      const res = await apiClient.get('/');
      
      if (res.status === 200) {
        console.log('✅ Elasticsearch is ready!');
        isReady = true;
      } else {
        console.log(`Elasticsearch returned status ${res.status}, waiting...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
      }
    } catch (error) {
      console.log('Elasticsearch not ready yet:', error.message);
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
    }
  }
  
  if (!isReady) {
    throw new Error('Elasticsearch did not become ready in time');
  }
};

/**
 * Create Nginx index template with proper field mappings
 */
const createNginxTemplate = async () => {
  const apiClient = createApiClient();
  const nginxTemplate = {
    index_patterns: ["nginx-*"],
    template: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0
      },
      mappings: {
        properties: {
          "@timestamp": { "type": "date" },
          "@version": { "type": "keyword" },
          "msec": { "type": "float" },
          "remote_ip": { 
            "type": "ip",
            "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } }
          },
          "remote_port": { "type": "integer" },
          "remote_user": { "type": "keyword" },
          "request": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 1024 } } },
          "request_method": { "type": "keyword" },
          "uri": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } },
          "args": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } },
          "status": { "type": "integer" },
          "body_bytes_sent": { "type": "integer" },
          "bytes_sent": { "type": "integer" },
          "request_time": { "type": "float" },
          "upstream_response_time": { "type": "float" },
          "upstream_connect_time": { "type": "float" },
          "upstream_header_time": { "type": "float" },
          "upstream_addr": { "type": "keyword" },
          "http_referer": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 1024 } } },
          "user_agent": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 1024 } } },
          "x_forwarded_for": { "type": "text", "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } },
          "host": { "type": "keyword" },
          "server_name": { "type": "keyword" },
          "server_addr": { "type": "ip" },
          "server_port": { "type": "integer" },
          "server_protocol": { "type": "keyword" },
          "scheme": { "type": "keyword" },
          "connection": { "type": "integer" },
          "pipe": { "type": "keyword" },
          "service": { "type": "keyword" },
          "container_id": { "type": "keyword" },
          "container_name": { "type": "keyword" },
          "environment": { "type": "keyword" },
          "hostname": { "type": "keyword" },
          "source": { "type": "keyword" },
          "referer_service": { "type": "keyword" }
        }
      }
    }
  };

  try {
    const res = await apiClient.post('/_security/user/kibana_system/_password', {
      password: CONFIG.credentials.kibana
    });
    if (res.status !== 200) {
      throw new Error('Failed to update password for kibana_system');
    }
    const response = await apiClient.put('/_index_template/nginx_logs', nginxTemplate);
    if (response.status === 200) {
      console.log('✅ Nginx index template created successfully');
    } else {
      console.error('Failed to create Nginx index template:', response.data);
    }
  } catch (error) {
    console.error('Error creating Nginx index template:', error.message);
  }
};

/**
 * Main function to set up Elasticsearch
 */
async function setupElasticsearch() {
  try {
    await waitForElasticsearch();
    await createNginxTemplate();
    console.log('Elasticsearch setup completed successfully.');
  } catch (err) {
    console.error('Elasticsearch setup failed:', err.message);
    process.exit(1);
  }
}

module.exports = { setupElasticsearch };

// Run if called directly
if (require.main === module) {
  setupElasticsearch();
}
