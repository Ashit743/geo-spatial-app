import type { DirectiveBinding } from 'vue'

export const vResizable = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const direction = binding.arg || 'horizontal'
    const minWidth = 250 // minimum width in pixels
    
    const startResize = (e: MouseEvent) => {
      e.preventDefault()
      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResize)
    }

    const resize = (e: MouseEvent) => {
      if (direction === 'horizontal') {
        // Calculate max width as half of the viewport width
        const maxWidth = window.innerWidth / 2
        // Calculate new width
        const newWidth = document.body.clientWidth - e.clientX
        // Apply width within constraints
        el.style.width = `${Math.min(Math.max(newWidth, minWidth), maxWidth)}px`
      } else {
        const newHeight = document.body.clientHeight - e.clientY
        el.style.height = `${newHeight}px`
      }
    }

    const stopResize = () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    }

    const resizer = document.createElement('div')
    resizer.style.width = '5px'
    resizer.style.height = '100%'
    resizer.style.background = 'transparent'
    resizer.style.position = 'absolute'
    resizer.style.left = '0'
    resizer.style.top = '0'
    resizer.style.cursor = 'ew-resize'
    resizer.addEventListener('mousedown', startResize)

    el.style.position = 'relative'
    el.appendChild(resizer)
  }
}

