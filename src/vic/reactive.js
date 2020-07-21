const targetMap = new Map()
let activeEffect

const handlers = {
  get: function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, key)
    return typeof res === 'object'
      ? reactive(res)
      : res
  },
  set: function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
}

export function reactive(target) {
  return new Proxy(target, handlers)
}

export function effect(fn, options = {}) {
  // 包装原始函数，生成 Effect 对象（实际上就是在 fn 上面个添加一些静态属性）
  const effect = createReactiveEffect(fn, options)
  effect()
  return effect
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect(...args) {
    return run(effect, fn, args)
  }
  effect.active = true
  // effect函数中依赖的数据列表（响应数据中也会有一份 effects 的引用。它们是属于多对多的关系）
  return effect
}

function run(effect, fn, args) {
  if (!effect.active) {
    return fn(...args)
  }
  activeEffect = effect
  // 在这里触发了 getter，进而开始 track
  const res = fn(...args)
  effect.active = false
  activeEffect = null
  return res
}

function track(target, key) {
  if (activeEffect == null) {
    return
  }
  let depsMap = targetMap.get(target)
  if (depsMap == null) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (dep == null) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    // 将 activeEffect 添加进依赖列表
    dep.add(activeEffect)
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (depsMap == null) {
    return
  }
  depsMap.get(key).forEach(effect => effect())
}