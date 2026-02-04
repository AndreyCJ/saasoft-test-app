import { EMPTY_ACCOUNT_STATE, type Account } from '@/entities/account';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAccountsStore = defineStore(
  'accounts',
  () => {
    const accounts = ref<Account[]>([]);

    const addNewAccount = () => {
      accounts.value.push({
        ...EMPTY_ACCOUNT_STATE,
        id: generateId(accounts.value.length),
      });
    };

    const updateAccount = (account: Account) => {
      const index = accounts.value.findIndex((a) => a.id === account.id);
      if (index !== -1) {
        accounts.value[index] = account;
      }
    };

    const deleteAccount = (id: string) => {
      accounts.value = accounts.value.filter((account) => account.id !== id);
    };

    const generateId = (index: number) => {
      return Date.now().toString(36) + index + Math.random().toString(36).slice(2);
    };

    const parseLabels = (labelString: string): { text: string }[] => {
      if (!labelString.trim()) return [];
      return labelString
        .split(';')
        .map((label) => label.trim())
        .filter((label) => label)
        .map((label) => ({ text: label }));
    };

    return {
      accounts,
      addNewAccount,
      updateAccount,
      deleteAccount,
      parseLabels,
    };
  },
  { persist: true },
);
