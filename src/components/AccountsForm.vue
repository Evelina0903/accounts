<script setup lang="ts">
import {LabelItem, useAccountsStore} from "@/stores/accounts";
import {ref} from "vue";
import {Delete, Plus} from "@element-plus/icons-vue";

const store = useAccountsStore()

const activeValidations = ref<Record<string, boolean>>({})

const validateField = (accountId: string, field: string, value: any) => {
  const account = store.accounts.find(acc => acc.id === accountId)
  if (!account) return

  let isValid = true

  switch (field) {
    case 'login':
      isValid = !!value.trim() && value.length <= 100
      break
    case 'password':
      isValid = account.type === 'LDAP' || (!!value && value.length <= 100)
      break
    case 'labels':
      isValid = true
      break
  }

  activeValidations.value[`${accountId}-${field}`] = !isValid
  return isValid
}

const handleBlur = (accountId: string, field: string, value: any) => {
  validateField(accountId, field, value)
}

const handleTypeChange = (accountId: string, newType: 'LDAP' | 'Локальная') => {
  const account = store.accounts.find(acc => acc.id === accountId)
  if (!account) return

  store.updateAccount(accountId, {
    type: newType,
    password: newType === 'LDAP' ? null : ''
  })

  if (newType === 'Локальная') {
    validateField(accountId, 'password', account.password)
  }
}

const handleLabelsChange = (accountId: string, labelsString: string) => {
  const labels = store.parseLabels(labelsString)
  store.updateAccount(accountId, { labels })
}

const getLabelString = (labels: LabelItem[]) => {
  return labels.map(item => item.text).join('; ')
}
</script>

<template>
  <div class="accounts-form">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="primary" circle @click="store.addAccount()">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <el-alert type="primary" show-icon :closable="false">
      Введите метки через точку с запятой (;). Например: "рабочий;основной"
    </el-alert>

    <el-table :data="store.accounts" style="width: 100%" class="accounts-table">
      <el-table-column prop="labels" label="Метки" width="250">
        <template #default="{ row }">
          <el-input
              v-model="row.labelsString"
              @blur="handleLabelsChange(row.id, row.labelsString)"
              @change="handleLabelsChange(row.id, row.labelsString)"
              :class="{ 'is-error': activeValidations[`${row.id}-labels`] }"
              placeholder="метка1; метка2"
              clearable
              maxlength="50"
          />
        </template>
      </el-table-column>

      <el-table-column prop="type" label="Тип записи" width="150">
        <template #default="{ row }">
          <el-select
              v-model="row.type"
              @change="handleTypeChange(row.id, row.type)"
              :class="{ 'is-error': activeValidations[`${row.id}-type`] }"
          >
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="Локальная" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="login" label="Логин">
        <template #default="{ row }">
          <el-input
              v-model="row.login"
              @blur="handleBlur(row.id, 'login', row.login)"
              :class="{ 'is-error': activeValidations[`${row.id}-login`] }"
              placeholder="Введите логин"
              clearable
              maxlength="100"
          />
        </template>
      </el-table-column>

      <el-table-column prop="password" label="Пароль">
        <template #default="{ row }">
          <el-input
              v-if="row.type === 'Локальная'"
              v-model="row.password"
              type="password"
              show-password
              @blur="handleBlur(row.id, 'password', row.password)"
              :class="{ 'is-error': activeValidations[`${row.id}-password`] }"
              placeholder="Введите пароль"
              clearable
              maxlength="100"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="80">
        <template #default="{ row }">
          <el-button
              type="danger"
              circle
              @click="store.removeAccount(row.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.accounts-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.accounts-table {
  margin-top: 20px;
}


:deep(.el-table .cell) {
  padding: 0 8px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

.is-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.is-error :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}
</style>