import { effect } from './reactive'

let uid = 0
let currentInstance = null
let currentRenderingInstance = null

export const createApp = (rootComponent, rootProps = null) => {
  const context = {
    config: {
      devtools: true,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: undefined,
      warnHandler: undefined
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null)
  }
  const app = {
    mount: (rootContainer) => {
      const vnode = createVNode(rootComponent, rootProps)
      vnode.appContext = context
      render(vnode, rootContainer)
    },
    components: {}
  }
  return app
}

function createVNode(type, props) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props,
    ref: props,
    scopeId: 1,
    children: null,
    component: null,
    suspense: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: 4, // 组件
    patchFlag: 0,
    appContext: null
  }
  return vnode
}

function render(vnode, container) {
  patch(null, vnode, container)
}

function patch(n1, n2, container,) {
  // debugger
  const { type, ref, shapeFlag } = n2
  // if (typeof n2.type === "symbol") {
  //   processText(n1, n2, container)
  //   // return
  // }
  if (shapeFlag === 17 || shapeFlag === 9) {
    processElement(
      n1,
      n2,
      container
    )
  } else if (shapeFlag === 4) {
    // 首次 mount 走的就是这个分支
    processComponent(
      n1,
      n2,
      container
    )
  }
}

function processComponent(n1, n2, container) {
  mountComponent(n2, container)
}

function mountComponent(initialVNode, container) {
  const instance = (initialVNode.component = createComponentInstance( initialVNode, null, null ))
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function createComponentInstance(vnode, parent, suspense) {
  // inherit parent app context - or - if root, adopt from root vnode
  const appContext =
    (parent ? parent.appContext : vnode.appContext) || {}
  const instance = {
    uid: uid++,
    vnode,
    parent,
    appContext,
    type: vnode.type,
    root: null, // to be immediately set
    next: null,
    subTree: null, // will be set synchronously right after creation
    update: null, // will be set synchronously right after creation
    render: null,
    proxy: null,
    withProxy: null,
    effects: null,
    provides: null,
    accessCache: null,
    renderCache: [],

    // state
    ctx: {},
    data: {},
    props: {},
    attrs: {},
    slots: {},
    refs: {},
    setupState: {},
    setupContext: null,

    // per-instance asset storage (mutable during options resolution)
    components: Object.create(appContext.components)
  }
  instance.ctx = { _: instance }
  instance.root = parent ? parent.root : instance
  return instance
}

function setupComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  currentInstance = instance
  const setupResult = setup(instance.props, {})
  currentInstance = null
  instance.render = setupResult
}

function setupRenderEffect(
  instance,
  initialVNode,
  container
) {
  // create reactive effect for rendering
  // Vic 创建更新函数
  instance.update = effect(function componentEffect() {
    // if (!instance.isMounted) {
      
    // }
    let vnodeHook
    const { el, props } = initialVNode
    const { bm, m, a, parent } = instance
    // Vic 在这里创建组件根 dom 的 vNode 树 （这棵树里面的 children 也创建出 vnode）
    const subTree =  (instance.subTree = renderComponentRoot(instance))
    container.innerHTML = ''
    // Vic 这个方法里面真正开始构建内存中的 dom 树
    patch(
      null,
      subTree,
      container
    )
    initialVNode.el = subTree.el
    // instance.isMounted = true
  })
}

function renderComponentRoot(instance) {
  const {
    type: Component,
    parent,
    vnode,
    proxy,
    withProxy,
    props,
    slots,
    attrs,
    emit,
    renderCache,
    render
  } = instance

  let result
  currentRenderingInstance = instance
  
  let fallthroughAttrs
  
  // 函数式组件
  result = render(props, { attrs, slots, emit })

  currentRenderingInstance = null

  return result
}

function processElement(n1, n2, container) {
  if (n1 == null) {
    mountElement(n2, container)
  }
}

function mountElement(vnode, container) {
  const { type, props } = vnode

  let el = vnode.el = document.createElement(type)
  container.appendChild(el)
  Object.entries(props || {}).forEach(([key, val]) => {
    if (key.startsWith('on')) {
      el.addEventListener(key.substr(2).toLocaleLowerCase(), val)
    } else {
      el[key] = val
    }
  })
  if (!Array.isArray(vnode.children)) { // 文本节点
    // debugger
    el.appendChild(document.createTextNode(vnode.children))
  } else {
    // debugger
    mountChildren(vnode.children, el, null)
  }
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    patch(
      null,
      child,
      container
    )
  }
}

function processText(n1, n2, container) {
  n2.el = document.createTextNode(n2.children)
  container.appendChild(n2.el)
}



