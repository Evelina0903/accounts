import {defineStore} from "pinia";
import {ref, watch} from "vue";

export interface LabelItem {
    text: string
}

export interface Account {
    id: string
    labels: LabelItem[]
    type: 'LDAP' | 'Локальная'
    login: string
    password: string | null
    labelsString: string
}

export const useAccountsStore = defineStore('accounts', () => {
    const accounts = ref<Account[]>([])

    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('accounts')
        if (saved) {
            accounts.value = JSON.parse(saved)
        }
    }

    const saveToLocalStorage = () => {
        localStorage.setItem('accounts', JSON.stringify(accounts.value))
    }

    loadFromLocalStorage()

    const addAccount = () => {
        accounts.value.push({
            id: Date.now().toString(),
            // label: '',
            labels: [],
            type: 'Локальная',
            login: '',
            password: '',
            labelsString: '',
        })
        saveToLocalStorage()
    }

    const removeAccount = (id: string) => {
        accounts.value = accounts.value.filter(account => account.id !== id)
        saveToLocalStorage()
    }

    const updateAccount = (id: string, updates: Partial<Account>) => {
        const index = accounts.value.findIndex(acc => acc.id === id)
        if (index !== -1) {
            accounts.value[index] = { ...accounts.value[index], ...updates }
            saveToLocalStorage()
        }
    }

    const parseLabels = (labelsString: string): LabelItem[] => {
        if (!labelsString.trim()) return []
        return labelsString.split(';')
            .map(label => label.trim())
            .filter(label => label.length > 0)
            .map(text => ({ text }))
    }

    const validateAccount = (account: Account): boolean => {
        if (!account.login.trim()) return false
        if (account.type === 'Локальная' && !account.password) return false
        return true
    }

    watch(accounts, saveToLocalStorage, { deep: true })

    return {
        accounts,
        addAccount,
        removeAccount,
        updateAccount,
        parseLabels,
        validateAccount
    }
})