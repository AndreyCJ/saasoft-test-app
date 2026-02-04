import type { Account } from '.';

export enum ACCOUNT_TYPES {
  LOCAL = 'Локальная',
  LDAP = 'LDAP',
}

export const EMPTY_ACCOUNT_STATE: Account = {
  id: '',
  labels: [],
  type: ACCOUNT_TYPES.LOCAL,
  login: '',
  password: '',
};
