<script lang="ts" setup>
import type { Account } from '@/entities/account';
import AccountItem from './AccountItem.vue';

defineProps<{
  accounts: Account[];
}>();
</script>

<template>
  <div class="account-list">
    <div v-for="account in accounts" :key="account.id" class="account-list__item">
      <AccountItem :account="account" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
