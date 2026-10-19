export {};

declare global {
  interface Window {
    m_Completepayment?: (formOrJson: unknown, closeEvent: () => void) => void;
    GetField?: (form: HTMLFormElement, formOrJson: unknown) => void;
    KCP_Pay_Execute_Web?: (form: HTMLFormElement) => void;
  }
}
