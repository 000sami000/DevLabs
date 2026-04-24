const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectToDatabase = async () => {
  // Configure connection pool settings
  const options = {
    // Pool settings
    maxPoolSize: env.dbPoolMaxSize || 10,        // Maximum number of connections in pool
    minPoolSize: env.dbPoolMinSize || 2,         // Minimum number of connections in pool
    maxIdleTimeMS: env.dbMaxIdleTimeMS || 30000, // How long a connection can stay idle before being closed
    
    // Connection settings
    connectTimeoutMS: env.dbConnectTimeout || 10000,  // Initial connection timeout
    socketTimeoutMS: env.dbSocketTimeout || 45000,    // Socket timeout
    heartbeatFrequencyMS: env.dbHeartbeatFrequency || 10000, // How often to check connection health
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Server selection
    serverSelectionTimeoutMS: env.dbServerSelectionTimeout || 30000,
    
    // Optional: Use for replica sets
    // replicaSet: env.dbReplicaSet,
    
    // Optional: Use for SSL/TLS
    // ssl: env.dbSSL || false,
    // sslValidate: env.dbSSLValidate || true,
    
    // Optional: Connection string options
    // appname: 'your-app-name',
  };

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info("Closed existing database connection");
    }

    await mongoose.connect(env.mongoUri, options);
    
    logger.info("MongoDB connected with connection pool", {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      maxPoolSize: options.maxPoolSize,
      minPoolSize: options.minPoolSize,
      activeConnections: mongoose.connection?.client?.topology?.connections?.size() || 'unknown'
    });

    // Monitor pool statistics
    monitorConnectionPool();

  } catch (error) {
    logger.error("Failed to connect to MongoDB", { 
      message: error.message,
      code: error.code
    });
    throw error;
  }
};

// Function to monitor connection pool statistics
const monitorConnectionPool = () => {
  if (!mongoose.connection || !mongoose.connection.client) return;

  setInterval(() => {
    const topology = mongoose.connection.client?.topology;
    if (topology && topology.connections) {
      const stats = {
        available: topology.connections.available(),
        inUse: topology.connections.inUse(),
        size: topology.connections.size(),
        pending: topology.s?.pool?.pending || 0
      };
      
      // Log only if there's significant change or periodically
      if (stats.inUse > stats.available * 0.8) {
        logger.warn("Connection pool nearing capacity", stats);
      } else {
        logger.debug("Connection pool stats", stats);
      }
    }
  }, 60000); // Log every minute
};

// Add connection event handlers for better pool management
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", { 
    error: error.message,
    code: error.code 
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected, attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

// Handle connection pool events if using native driver
if (mongoose.connection.client) {
  mongoose.connection.client.on("connectionPoolCreated", (event) => {
    logger.info("Connection pool created", event);
  });
  
  mongoose.connection.client.on("connectionPoolClosed", (event) => {
    logger.info("Connection pool closed", event);
  });
}

// Function to get current pool status
const getPoolStatus = () => {
  if (!mongoose.connection || !mongoose.connection.client) {
    return { status: "not connected" };
  }
  
  const topology = mongoose.connection.client?.topology;
  if (topology && topology.connections) {
    return {
      status: mongoose.connection.readyState,
      available: topology.connections.available(),
      inUse: topology.connections.inUse(),
      total: topology.connections.size(),
      database: mongoose.connection.name,
      host: mongoose.connection.host
    };
  }
  
  return { status: "unknown" };
};

module.exports = connectToDatabase;
module.exports.getPoolStatus = getPoolStatus;