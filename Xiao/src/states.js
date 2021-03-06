/* @flow */
import Xiao from './main'
import { isPlainObject, log, warn, hasOwn, isReserved } from './util'
import { noop, extend, bind } from './shared/util'
import { observe, defineReactive } from './observer'
import Watcher from './observer/watcher'
import Dep from './observer/dep'

//D:\OutPut\VUE\vue\src\core\instance\state.js

export function initState(vm: Xiao) {
  vm._watchers = []
  const opts = vm.$options

  //if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)

  initData(vm)
  initComputed(vm)

  //initProps(vm)

  // 必须在data和computed之后
  // 因为子组件有props，所以子组件的watch需要在处理了props之后才能调用
  if (!vm.$parent) {
    initWatch(vm)
  }
}

/**
 * 监听data
 * @param {*} vm
 */
function initData(vm: Xiao) {
  let data = vm.$options.data

  if (!data) {
    //observe(vm._data = {}, true /* asRootData */)
  }

  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}

  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods

  let i = keys.length

  while (i--) {
    const key = keys[i]

    if (!isReserved(key)) {
      // 这里才是真正的代理数据
      proxy(vm, `_data`, key)
    }
  }

  // observe data
  observe(data, true /* asRootData */)
}

export function getData(data: Function, vm: Xiao): any {
  try {
    return data.call(vm, vm)
  } catch (e) {
    warn("get data error:", e);
    return {}
  }
}

/**
 * 监听计算属性
 *
 * @param {*} vm
 */
function initComputed(vm: Xiao) {
  let computed = vm.$options.computed

  //let watchers = vm._watcherCompued = Object.create(null)

  if (!computed) {
    return
  }

  for (const key in computed) {
    const getter = computed[key]

    const dep = new Dep()

    Object.defineProperty(vm, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        const value = getter.call(vm)

        if (Dep.target) {
          dep.depend()
        }

        return value
      }
    })
  }
}



export function initProps(vm: Xiao, propsData: Object) {
  const propsOptions = vm.$options.props

  if (!propsOptions) {
    return
  }

  log('initProps propsOptions', propsOptions)
  log('initProps propsData', propsData)

  const props = vm._props = {}

  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent

  // root instance props should be converted
  // fixme observerState.shouldConvert = isRoot

  for (let i = 0; i < propsOptions.length; i++) {
    const key = propsOptions[i]

    keys.push(key)

    // fixme
    //const value = validateProp(key, propsOptions, propsData, vm)

    const value = propsData[key]

    log(`注册props属性：${key}, 值：${value}`)

    defineReactive(props, key, value)

    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
}


/**
 * 更新子组件的props属性，就是直接赋值一次
 *
 * @param {*} vm
 * @param {*} propsData
 */
export function updateProps(vm: Xiao, propsData: Object) {
  log('updateProps propsData', propsData)
  extend(vm, propsData)
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function initMethods(vm: any, methods: Object) {
  for (const key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}

export function initWatch(vm: Xiao) {
  const watch = vm.$options.watch
  if (watch) {
    for (const key in watch) {
      vm.$watchField(key, watch[key])
    }
  }
}

export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }

  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }

  Object.defineProperty(target, key, sharedPropertyDefinition)
}

/**
 * 绑定事件
 *
 * @param {*} vm
 * @param {*} on
 */
export function initEvent(vm: any, on: Object) {
  log('initEvent', on)
  vm._events = on
}
