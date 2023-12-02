export interface User {
    firstName: string,
    email: string,
    password: string,
  }
  
export interface Notification {
    on: boolean,
    type: string,
    message: string
  }