<script setup lang="ts">
import { useAccountsStore } from '@/entities/account';
import AccountList from '@/features/account-management/ui/AccountList.vue';
import { AlertDescription, BaseAlert } from '@/shared/ui/alert';
import BaseButton from '@/shared/ui/button/BaseButton.vue';
import { Lightbulb, Plus } from 'lucide-vue-next';
import { computed } from 'vue';

const store = useAccountsStore();

const accounts = computed(() => store.accounts);

const addNewAccount = () => {
  store.addNewAccount();
};
</script>

<template>
  <div class="accounts-management">
    <div class="accounts-management__wrapper">
      <div class="accounts-management__header">
        <h1 class="text-2xl font-semibold">Управление учетными записями</h1>
        <BaseButton @click="addNewAccount" class="add-btn">
          <Plus />
        </BaseButton>
      </div>

      <BaseAlert>
        <AlertDescription class="flex">
          <Lightbulb /> Подсказка: для поля метка используйте разделитель ";"
        </AlertDescription>
      </BaseAlert>

      <div class="accounts-list">
        <AccountList :accounts="accounts" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.accounts-management {
  margin-top: 4rem;
  margin-bottom: 4rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__wrapper {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;

    & > *:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}
</style>
