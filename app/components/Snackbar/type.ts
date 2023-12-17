export interface Fadein {
  delay: string;
  children: any;
}

export interface PropTypes {
  open: boolean;
  onClose: () => void;
  message: string;
  type: string;
}
