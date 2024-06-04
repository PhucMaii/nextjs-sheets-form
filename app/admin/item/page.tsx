import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import NotificationPopup from '../components/Notification'
import { Notification } from '@/app/utils/type'

export default function ItemPage() {
    const [notification, setNotification] = useState<Notification>({
        on: false,
        type: 'info',
        message: ''
    })

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
    </Sidebar>
  );
}
