import { ReactNode } from 'react';

export interface Fadein {
  delay: string;
  children: ReactNode;
}

export interface PropTypes {
  open: boolean;
  onClose: () => void;
  message: string;
  type: string;
}
