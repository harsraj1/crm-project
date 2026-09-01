import { consumer, TOPICS } from './client.js';
import { processAiSummary } from '../src/services/ai.service.js';
import { createNotification } from '../src/services/notification.service.js';

export const startConsumers = async () => {
  await consumer.subscribe({ topics: Object.values(TOPICS), fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const value = JSON.parse(message.value?.toString() || '{}');

      console.log(`📨 [${topic}] Received:`, { key, partition, ...value });

      try {
        switch (topic) {
          case TOPICS.AI_SUMMARY_REQUEST:
            await processAiSummary(value);
            break;
          case TOPICS.NOTIFICATION_SEND:
            await createNotification(value);
            break;
          case TOPICS.LEAD_CREATED:
          case TOPICS.CUSTOMER_CREATED:
            // Log activity
            console.log(`📝 Activity logged for ${topic}`);
            break;
          default:
            console.log(`⚠️ Unhandled topic: ${topic}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${topic}:`, error);
      }
    }
  });

  console.log('✅ Kafka consumers started');
};

export const stopConsumers = async () => {
  await consumer.disconnect();
  console.log('🛑 Kafka consumers stopped');
};
