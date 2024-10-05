// File: /pages/api/notifications/send.js

import { notificationModule } from '@/lib/NotificatioModule';
import { NextResponse } from 'next/server';

export  async function POST(req, res) {
    const { userIds, notification, notificationTypes } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing userIds' ,status:400});
    }

    if (!notification || !notificationTypes || notificationTypes.length === 0) {
      return NextResponse.json({ error: 'Missing required fields',status:400 });
    }

    try {
      await notificationModule.notify(userIds, notification, notificationTypes);
      return NextResponse.json({ message: 'Notifications sent successfully' ,status:400 });
    } catch (error) {
      console.error('Error sending notifications:', error);
      return NextResponse.json({ error: 'Failed to send notifications',status:500  });
    }
}