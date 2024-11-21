import {
  SendyClientInterface,
  SendySubscribeParams,
  SendyUnsubscribeParams,
  SendyResponse,
  SendySubscriptionStatusParams,
} from '../types/sendy';

class SendyClient implements SendyClientInterface {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async subscribe(params: SendySubscribeParams): Promise<SendyResponse> {
    const { name, email, listId } = params;

    // Check if already subscribed
    const subscriptionStatusParams: SendySubscriptionStatusParams = {
      email,
      listId,
    };
    const subscriptionStatus = await this.subscriptionStatus(
      subscriptionStatusParams
    );

    if (subscriptionStatus.success) {
      const responseF: SendyResponse = {
        success: true,
        message: 'Already subscribed',
      };

      return responseF;
    }

    if (
      !subscriptionStatus.success &&
      subscriptionStatus.message !== 'Email does not exist in list'
    ) {
      const responseF: SendyResponse = {
        success: false,
        message: 'Email bounced, try with another.',
      };

      return responseF;
    }

    // Create form data
    const formData = new URLSearchParams();

    formData.append('api_key', this.apiKey);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('list', listId);
    formData.append('boolean', 'true');

    try {
      // Send request
      const response = await fetch(this.apiUrl + '/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseText = await response.text();

      const responseF: SendyResponse = {
        success: responseText == '1' ? true : false,
        message: responseText,
      };

      return responseF;
    } catch (error: any) {
      const responseF: SendyResponse = {
        success: false,
        message: error.message,
      };

      return responseF;
    }
  }

  async unsubscribe(params: SendyUnsubscribeParams): Promise<SendyResponse> {
    const { email, listId } = params;

    // Create form data
    const formData = new URLSearchParams();

    formData.append('api_key', this.apiKey);
    formData.append('email', email);
    formData.append('list', listId);
    formData.append('boolean', 'true');

    try {
      // Send request
      const response = await fetch(this.apiUrl + '/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseText = await response.text();

      const responseF: SendyResponse = {
        success: responseText == '1' ? true : false,
        message: responseText,
      };

      return responseF;
    } catch (error: any) {
      const responseF: SendyResponse = {
        success: false,
        message: error.message,
      };

      return responseF;
    }
  }

  async subscriptionStatus(
    params: SendySubscriptionStatusParams
  ): Promise<SendyResponse> {
    const { email, listId } = params;

    // Create form data
    const formData = new URLSearchParams();

    formData.append('api_key', this.apiKey);
    formData.append('email', email);
    formData.append('list_id', listId);

    try {
      // Send request
      const response = await fetch(
        this.apiUrl + '/api/subscribers/subscription-status.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const responseText = await response.text();

      const responseF: SendyResponse = {
        success: responseText == 'Subscribed' ? true : false,
        message: responseText,
      };

      return responseF;
    } catch (error: any) {
      const responseF: SendyResponse = {
        success: false,
        message: error.message,
      };

      return responseF;
    }
  }
}

export const sendy: SendyClientInterface = new SendyClient(
  process.env.NEXT_SENDY_API_URL!,
  process.env.NEXT_SENDY_API_KEY!
);
