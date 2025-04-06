export type HubSpotOutgoingChannelMessagePayload = {
  type: "OUTGOING_CHANNEL_MESSAGE_CREATED";
  portalId: string;
  channelId: string;
  eventTimestamp: string; // ISO8601 timestamp
  eventId: string;
  channelIntegrationThreadIds: string[];
  message: {
    id: string;
    type: "MESSAGE";
    channelId: string;
    channelAccountId: string;
    conversationsThreadId: string;
    createdAt: string; // ISO8601 timestamp
    createdBy: string; // HubSpot user ID
    senders: Array<{
      actorId: string;
      deliveryIdentifier: string;
      name: string;
    }>;
    recipients: Array<{
      actorId: string;
      deliveryIdentifier: string;
      name?: string;
    }>;
    text: string;
    richText?: string;
    direction: "OUTGOING";
    inReplyToId?: string;
    truncationStatus: "NOT_TRUNCATED";
    status: "SENT";
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      contentType: string;
      size: number;
    }>;
  };
};
