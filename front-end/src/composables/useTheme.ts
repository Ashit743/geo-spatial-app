import { ref, watch } from 'vue'

export function useTheme() {
  const isDark = ref(localStorage.getItem('vueuse-color-scheme') === 'dark')

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('vueuse-color-scheme', isDark.value ? 'dark' : 'light')
  }

  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    isDark,
    toggleDark
  }
}