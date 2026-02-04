export type AccountType = 'LDAP' | 'Локальная';

export interface Account {
  id: string;
  labels: { text: string }[];
  type: AccountType;
  login: string;
  password: string | null;
}

export interface AccountFormData {
  labels: string;
  type: AccountType;
  login: string;
  password: string;
}

export * from './constants';
export { useAccountsStore } from './store';
