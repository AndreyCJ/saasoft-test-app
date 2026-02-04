<script setup lang="ts">
import {
  BaseButton,
  BaseInput,
  BaseLabel,
  BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { Trash } from 'lucide-vue-next';
import { onMounted, ref, watch, type UnwrapRef } from 'vue';

import {
  ACCOUNT_TYPES,
  useAccountsStore,
  type Account,
  type AccountType,
} from '@/entities/account';

interface Props {
  account: Account;
}

const props = defineProps<Props>();

const accountStore = useAccountsStore();

const localAccount = ref({
  id: props.account.id,
  labelString: props.account.labels.map((item) => item.text).join(';'),
  type: props.account.type,
  login: props.account.login,
  password: props.account.password || '',
});

const errors = ref({
  label: false,
  type: false,
  login: '',
  password: '',
});

watch(
  () => localAccount.value.type,
  (type) => {
    handleTypeChange(type);
  },
);

const validateField = (field: keyof UnwrapRef<typeof errors>) => {
  switch (field) {
    case 'label':
      errors.value.label = localAccount.value.labelString.length > 50;
      break;
    case 'type':
      errors.value.type = !localAccount.value.type;
      break;
    case 'login':
      if (!localAccount.value.login.trim()) {
        errors.value.login = 'Логин обязателен';
      } else if (localAccount.value.login.length > 100) {
        errors.value.login = 'Максимум 100 символов';
      } else {
        errors.value.login = '';
      }
      break;
    case 'password':
      if (localAccount.value.type === 'Локальная') {
        if (!localAccount.value.password.trim()) {
          errors.value.password = 'Пароль обязателен';
        } else if (localAccount.value.password.length > 100) {
          errors.value.password = 'Максимум 100 символов';
        } else {
          errors.value.password = '';
        }
      }
      break;
  }
};

const validateForm = (): boolean => {
  validateField('type');
  validateField('login');
  if (localAccount.value.type === 'Локальная') {
    validateField('password');
  }
  validateField('label');

  return !errors.value.login && !errors.value.password && !errors.value.type && !errors.value.label;
};

const handleTypeChange = (value: string) => {
  localAccount.value.type = value as AccountType;

  if (value === ACCOUNT_TYPES.LDAP) {
    localAccount.value.password = '';
    errors.value.password = '';
  }
};

const saveToStore = () => {
  if (!validateForm()) return;

  const accountData: Account = {
    id: localAccount.value.id,
    labels: localAccount.value.labelString
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text) => ({ text })),
    type: localAccount.value.type,
    login: localAccount.value.login.trim(),
    password: localAccount.value.type === 'LDAP' ? null : localAccount.value.password.trim(),
  };

  accountStore.updateAccount(accountData);
};

const handleRemove = () => {
  accountStore.deleteAccount(localAccount.value.id);
};

onMounted(() => {
  localAccount.value = {
    id: props.account.id,
    labelString: props.account.labels.map((item) => item.text).join(';'),
    type: props.account.type,
    login: props.account.login,
    password: props.account.password || '',
  };
});
</script>

<template>
  <div class="account-item">
    <div class="account-item__wrapper border rounded-lg p-4 mb-3 bg-card">
      <!-- Метка -->
      <div class="account-item__col">
        <div class="flex items-center gap-2 mb-2">
          <BaseLabel for="label">Метка</BaseLabel>
        </div>
        <BaseInput
          id="label"
          v-model="localAccount.labelString"
          type="text"
          placeholder="Метки через ;"
          :maxlength="50"
          class="w-full"
          :class="{ 'border-red-500': errors.label }"
          @blur="validateField('label')"
        />
        <p v-if="errors.label" class="text-xs text-red-500 mt-1">Максимум 50 символов</p>
      </div>

      <!-- Тип записи -->
      <div class="account-item__col">
        <BaseLabel for="type" class="block mb-2">Тип записи</BaseLabel>
        <BaseSelect id="type" v-model="localAccount.type">
          <SelectTrigger :class="{ 'border-red-500': errors.type }">
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LDAP">LDAP</SelectItem>
            <SelectItem value="Локальная">Локальная</SelectItem>
          </SelectContent>
        </BaseSelect>
        <p v-if="errors.type" class="text-xs text-red-500 mt-1">Обязательное поле</p>
      </div>

      <!-- Логин -->
      <div class="account-item__col">
        <BaseLabel for="login" class="block mb-2">Логин *</BaseLabel>
        <BaseInput
          id="login"
          v-model="localAccount.login"
          type="text"
          placeholder="Введите логин"
          :maxlength="100"
          class="w-full"
          :class="{ 'border-red-500': errors.login }"
          @blur="saveToStore"
        />
        <p v-if="errors.login" class="text-xs text-red-500 mt-1">
          {{ errors.login }}
        </p>
      </div>

      <!-- Пароль (показывается только для "Локальная") -->
      <div v-if="localAccount.type === 'Локальная'" class="account-item__col">
        <BaseLabel for="password">Пароль *</BaseLabel>
        <BaseInput
          id="password"
          v-model="localAccount.password"
          type="password"
          placeholder="Введите пароль"
          :maxlength="100"
          class="w-full"
          :class="{ 'border-red-500': errors.password }"
          @blur="saveToStore"
        />
        <p v-if="errors.password" class="text-xs text-red-500 mt-1">
          {{ errors.password }}
        </p>
      </div>
    </div>
    <BaseButton
      class="account-item__remove-btn"
      size="lg"
      variant="destructive"
      @click="handleRemove"
    >
      <Trash class="h-4 w-4" />
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.account-item {
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;

  &__wrapper {
    display: flex;
    gap: 0.5rem;
    width: 100%;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__remove-btn {
    cursor: pointer;
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: scale(1.05);
    }
  }
}
</style>
