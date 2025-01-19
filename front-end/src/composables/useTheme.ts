import { ref, watch } from 'vue'

export function useTheme() {
  const storedTheme = localStorage.getItem('vueuse-color-scheme')
  const isDark = ref(storedTheme === 'dark' || storedTheme === null)

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('vueuse-color-scheme', isDark.value ? 'dark' : 'light')
  }

  watch(
    isDark,
    (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )

  return {
    isDark,
    toggleDark,
  }
}