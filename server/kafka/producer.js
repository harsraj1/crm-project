import { producer, TOPICS } from '../kafka/client.js';

export const publishEvent = async (topic, key, value) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: String(key),
          value: JSON.stringify(value),
          timestamp: Date.now().toString()
        }
      ]
    });
    console.log(`✅ Published to ${topic}:`, key);
  } catch (error) {
    console.error(`❌ Failed to publish to ${topic}:`, error);
    throw error;
  }
};

// Specific event publishers
export const publishLeadCreated = (lead) =>
  publishEvent(TOPICS.LEAD_CREATED, lead.id, lead);

export const publishLeadUpdated = (lead) =>
  publishEvent(TOPICS.LEAD_UPDATED, lead.id, lead);

export const publishCustomerCreated = (customer) =>
  publishEvent(TOPICS.CUSTOMER_CREATED, customer.id, customer);

export const publishActivityLogged = (activity) =>
  publishEvent(TOPICS.ACTIVITY_LOGGED, activity.id, activity);

export const requestAiSummary = (data) =>
  publishEvent(TOPICS.AI_SUMMARY_REQUEST, data.leadId || data.customerId, data);

export const sendNotification = (notification) =>
  publishEvent(TOPICS.NOTIFICATION_SEND, notification.userId, notification);