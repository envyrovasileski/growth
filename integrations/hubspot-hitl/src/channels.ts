import * as bp from '../.botpress'
import { getClient } from './client'

export const channels = {
  hitl: {
    messages: {
      text: async ({ client, ctx, conversation, logger, ...props }: bp.AnyMessageProps) => {
        const hubSpotClient = getClient(ctx, client, ctx.configuration.refreshToken, ctx.configuration.clientId, ctx.configuration.clientSecret);
   
        const { text: userMessage, userId } = props.payload

        const hubspotConversationId = conversation.tags.id

        if (!hubspotConversationId?.length) {
          logger.forBot().error('No HubSpot Conversation Id')
          return
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
        
        return await hubSpotClient.sendMessage(
          userMessage, name, phoneNumber
        )
      },
    },
  },
} satisfies bp.IntegrationProps['channels']
