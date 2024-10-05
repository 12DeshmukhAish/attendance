
import nodemailer from 'nodemailer';

import { Expo } from 'expo-server-sdk';
import { EventEmitter } from 'events';

class NotificationModule {
  constructor() {
    // Configure email transporter using environment variables for flexibility
    this.emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

    this.sseClients = new Map(); // Map to store SSE clients
    this.eventEmitter = new EventEmitter(); // Event emitter for real-time notifications
  }

  // Send an email notification
  async sendEmail(to, subject, body) {
    try {
      console.log(`Attempting to send email to: ${to}`);
      
      const mail = await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: body,
      });
      
      console.log(`Email sent successfully to ${to}. Message ID: ${mail.messageId}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
  // Send Server-Sent Event (SSE) notification
  sendSSE(userId, data) {
    const client = this.sseClients.get(userId);
    if (client) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } else {
      console.warn(`SSE client for user ${userId} not found`);
    }
  }

  // Send push notifications via Expo
  async sendExpoPushNotification(pushTokens, title, body, data = {}) {
    let messages = [];

    for (let pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    let chunks = this.expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    return tickets;
  }

  // Add a new SSE client
  addSSEClient(userId, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    this.sseClients.set(userId, res);

    res.on('close', () => {
      this.removeSSEClient(userId);
    });
  }

  // Remove an SSE client
  removeSSEClient(userId) {
    this.sseClients.delete(userId);
  }


  
  // Main notification handler based on user preferences
  async notify(userIds, notification, notificationTypes) {
    const results = [];
    for (const userId of userIds) {
      try {
        console.log(`Notifying user: ${userId}, Notification: ${notification.subject}`);
        await this.storeNotification(userId, notification);
        this.eventEmitter.emit('newNotification', { userId, notification });
  
        const user = await this.getUserPreferences(userId);
        console.log(`User Preferences for ${userId}:`, user);
  
        if (notificationTypes.includes('email') && user.emailNotifications) {
          console.log(`Attempting to send email to ${user.email}`);
          const emailSent = await this.sendEmail(user.email, notification.subject, notification.body);
          if (emailSent) {
            console.log(`Email sent successfully to ${user.email}`);
          }
        }
        if (notificationTypes.includes('sse')) {
          console.log(`Sending SSE Notification to ${userId}`);
          this.sendSSE(userId, notification);
        }
  
        if (notificationTypes.includes('push') && user.expoPushToken) {
          console.log(`Sending Push Notification to ${user.expoPushToken}`);
          await this.sendExpoPushNotification(
            [user.expoPushToken],
            notification.subject,
            notification.body,
            {
              notificationType: notification.type,
              redirectUrl: notification.redirectUrl,
            }
          );
        }
      } catch (error) {
        console.error(`Failed to notify user ${userId}:`, error);
      }
    }
  }
  
  // Store notification in the database
  async storeNotification(userId, notification) {
    // Placeholder for the actual database implementation
    console.log(`Storing notification for user ${userId}:`, notification);
  }

  // Fetch user preferences from the database
  async getUserPreferences(userId) {
    return {
      email: 'maneprathamesh019@gmail.com',
      phone: '+1234567890',
      emailNotifications: true,
      smsNotifications: true,
      expoPushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    };
  }
}

export const notificationModule = new NotificationModule();
