import { getClient } from '../client';
import { RuntimeError } from '@botpress/client';
import * as bp from '.botpress';
import { randomUUID } from 'crypto'


export const startHitl: bp.IntegrationProps['actions']['startHitl'] = async ({ ctx, client, logger, input }) => {
  const hubspotClient = getClient(ctx, client, ctx.configuration.refreshToken, ctx.configuration.clientId, ctx.configuration.clientSecret);

  logger.forBot().info("Starting HITL...");

  try {
    const { title, description = "No description available" } = input;

    const { state } = await client.getState({
      id: ctx.integrationId,
      name: "channelInfo",
      type: "integration",
    });

    if (!state?.payload?.channelId) {
      console.log("No channelId found in state");

      return {
        success: false,
        message: "errorMessage",
        data: null,
        conversationId: "error_conversation_id",
      };; 
    }

    const userInfoState = await client.getState({
      id: ctx.integrationId,
      name: "userInfo",
      type: "integration",
    });

    if (!userInfoState?.state.payload.phoneNumber) {
      console.log("No userInfo found in state");
      return {
        success: false,
        message: "errorMessage",
        data: null,
        conversationId: "error_conversation_id",
      };; 
    }
    const { name, phoneNumber } = userInfoState.state.payload;
    const { channelId, channelAccountId } = state.payload;

    const integrationThreadId = randomUUID();

    await client.setState({
      id: ctx.integrationId,
      type: "integration",
      name: 'channelInfo',
      payload: { 
        channelId: channelId, 
        channelAccountId: channelAccountId,
        integrationThreadId: integrationThreadId
      },
    });

    const result = await hubspotClient.createConversation(channelId, channelAccountId, integrationThreadId, name, phoneNumber, title, description);
    const conversationId = result.data.conversationsThreadId

    console.log("HubSpot Channel Response:", result);

    const { conversation } = await client.getOrCreateConversation({
      channel: 'hitl',
      tags: {
        id: conversationId,
      },
    });

    logger.forBot().debug(`HubSpot Channel ID: ${channelId}`);
    logger.forBot().debug(`Botpress Conversation ID: ${conversation.id}`);

    return {
      conversationId: conversation.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.forBot().error(`'Create Conversation' exception: ${errorMessage}`);

    return {
      success: false,
      message: errorMessage,
      data: null,
      conversationId: "error_conversation_id",
    };
  }
}

export const stopHitl: bp.IntegrationProps['actions']['stopHitl'] = async ({ ctx, input, client, logger }) => {
  const { conversation } = await client.getConversation({
    id: input.conversationId,
  });

  const hubspotConversationId: string | undefined = conversation.tags.id;

  if (!hubspotConversationId) {
    return {};
  }

  return {};
};

export const createUser: bp.IntegrationProps['actions']['createUser'] = async ({ client, input, ctx, logger }) => {
  try {
    // Phone number is being stored in email field
    // This is a workaround until we have a better solution to store phone numbers in the input.
    const { name = "None", email = "None", pictureUrl = "None" } = input;

    if (!email) {
      logger.forBot().error('Email necessary for HITL');
      throw new RuntimeError('Email necessary for HITL');
    }

    await client.setState({
      id: ctx.integrationId,
      type: "integration",
      name: 'userInfo',
      payload: {
        name: name,
        phoneNumber: email,
      },
    });

    const { user: botpressUser } = await client.getOrCreateUser({
      name,
      pictureUrl,
      tags: {
        id: email,
      },
    });

    logger.forBot().debug(`Created/Found user: ${botpressUser.id}`);

    return {
      userId: botpressUser.id,
    };
  } catch (error: any) {
    throw new RuntimeError(error.message);
  }
};
