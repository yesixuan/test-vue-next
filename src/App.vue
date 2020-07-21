<script>
import { ref, h } from 'vue'
import { reactive } from './vic/reactive'
import Hehe from './Hehe.vue'

export default {
  components: { Hehe },
  setup() {
    const count = reactive({
      value: 0
    })
    const inc = () => {
      count.value++
    }

    return () => h('div', [h('h1', count.value), h('button', { onClick: inc }, '++'), h(Hehe)])
  }
}
</script>

<style>
body {
  background-color: #333;
}
img {
  width: 200px;
}
h1 {
  color: rgb(17, 113, 98);
  font-family: Arial, Helvetica, sans-serif;
}
</style>
