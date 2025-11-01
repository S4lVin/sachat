import { ref, nextTick } from 'vue'

export function useEditable(initialValue, onSave, options = {}) {
  const {
    validate = (value) => value.trim(), // Validazione di default: trim
    autoSelect = true, // Seleziona automaticamente il testo quando si entra in edit mode
  } = options

  const isEditing = ref(false)
  const editingValue = ref('')
  const inputRef = ref(null)

  const startEdit = () => {
    isEditing.value = true
    editingValue.value = initialValue()

    // Focus sull'input dopo che il DOM si è aggiornato
    nextTick(() => {
      inputRef.value.focus()
      if (autoSelect) inputRef.value.select()
    })
  }

  const save = async () => {
    if (!isEditing.value) return

    const validatedValue = validate(editingValue.value)
    const currentInitialValue = initialValue()
    if (validatedValue && validatedValue !== currentInitialValue) {
      isEditing.value = false
      await onSave(validatedValue)
    } else {
      isEditing.value = false
    }
  }

  const cancel = () => {
    isEditing.value = false
    editingValue.value = ''
  }

  return {
    isEditing,
    editingValue,
    inputRef,
    startEdit,
    save,
    cancel,
  }
}
