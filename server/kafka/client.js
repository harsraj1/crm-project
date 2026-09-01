import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'crm-server',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'crm-consumer-group' });

export const connectKafka = async () => {
  if (process.env.KAFKA_ENABLED === 'false') {
    console.log('ℹ️ Kafka disabled by configuration');
    return;
  }
  try {
    await producer.connect();
    await consumer.connect();
    console.log('✅ Kafka connected');
  } catch (error) {
    console.error('❌ Kafka connection error:', error.message);
    throw error;
  }
};

export const disconnectKafka = async () => {
  if (process.env.KAFKA_ENABLED === 'false') return;
  await producer.disconnect();
  await consumer.disconnect();
  console.log('🔌 Kafka disconnected');
};

// Topic names
export const TOPICS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  ACTIVITY_LOGGED: 'activity.logged',
  AI_SUMMARY_REQUEST: 'ai.summary.request',
  AI_SUMMARY_RESPONSE: 'ai.summary.response',
  NOTIFICATION_SEND: 'notification.send'
};

export const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();

  const existingTopics = await admin.listTopics();
  const topicsToCreate = Object.values(TOPICS).filter(topic => !existingTopics.includes(topic));

  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate.map(topic => ({
        topic,
        numPartitions: 3,
        replicationFactor: 1
      }))
    });
    console.log(`✅ Kafka topics created: ${topicsToCreate.join(', ')}`);
  }

  await admin.disconnect();
};
