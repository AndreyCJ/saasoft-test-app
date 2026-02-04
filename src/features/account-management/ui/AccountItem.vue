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

const submitForm = () => {
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
        <BaseLabel class="account-item__label" for="label">Метка</BaseLabel>
        <BaseInput
          id="label"
          v-model="localAccount.labelString"
          :class="[
            'account-item__input',
            {
              'account-item__input--error': errors.label,
            },
          ]"
          type="text"
          placeholder="Метки через ;"
          :maxlength="50"
          @blur="submitForm"
        />
        <p v-if="errors.label" class="account-item__error-msg">Максимум 50 символов</p>
      </div>

      <!-- Тип записи -->
      <div class="account-item__col">
        <BaseLabel for="type" class="account-item__label">Тип записи</BaseLabel>
        <BaseSelect
          id="type"
          v-model="localAccount.type"
          :class="[
            'account-item__input',
            {
              'account-item__input--error': errors.type,
            },
          ]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LDAP">LDAP</SelectItem>
            <SelectItem value="Локальная">Локальная</SelectItem>
          </SelectContent>
        </BaseSelect>
        <p v-if="errors.type" class="account-item__error-msg">Обязательное поле</p>
      </div>

      <!-- Логин -->
      <div class="account-item__col">
        <BaseLabel for="login" class="account-item__label">Логин *</BaseLabel>
        <BaseInput
          v-model="localAccount.login"
          id="login"
          :class="[
            'account-item__input',
            {
              'account-item__input--error': errors.login,
            },
          ]"
          type="text"
          placeholder="Введите логин"
          :maxlength="100"
          @blur="submitForm"
        />
        <p v-if="errors.login" class="account-item__error-msg">
          {{ errors.login }}
        </p>
      </div>

      <!-- Пароль (показывается только для "Локальная") -->
      <div v-if="localAccount.type === 'Локальная'" class="account-item__col">
        <BaseLabel for="password" class="account-item__label">Пароль *</BaseLabel>
        <BaseInput
          v-model="localAccount.password"
          :class="[
            'account-item__input',
            {
              'account-item__input--error': errors.password,
            },
          ]"
          id="password"
          variant="password"
          type="password"
          placeholder="Введите пароль"
          :maxlength="100"
          @blur="submitForm"
        />
        <p v-if="errors.password" class="account-item__error-msg">
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
    gap: 0.4rem;
  }

  &__error-msg {
    color: var(--color-red-500);
    font-size: 0.7rem;
  }

  &__input {
    &--error {
      border-color: var(--color-red-500);
    }
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
