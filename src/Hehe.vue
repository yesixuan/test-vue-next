<script>
import { ref, h } from 'vue'
import { reactive } from './vic/reactive'

export default {
  setup() {
    const count = reactive({
      value: 9
    })
    const inc = () => {
      count.value--
    }

    return () => h('div', [h('h2', count.value), h('button', { onClick: inc }, '--')])
  }
}
</script>