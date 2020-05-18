class Promise{
  constructor(executor){
    // 参数校验
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }
    this.initValue()
    this.initBind()
    try{
    executor(this.resolve, this.reject)
      
    }catch(e){
      this.reject(e)
    }
  }
  initValue(){
    // 初始化值
    this.value = null //终值
    this.reason = null //拒绝原因
    this.state = Promise.PENDING //状态
    this.onFulfilledcallbacks = [] //成功回调
    this.onRejectedcallbacks = []//失败回调
  }
  initBind(){
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)
  }
  resolve(value){
    // 状态的改变，成功回调的执行
    if(this.state == Promise.PENDING){
      this.state = Promise.FULFILLED
      this.value = value
      this.onFulfilledcallbacks.forEach(fn => fn(this.value))
    }
  }
  reject(reason){
    // 失败回调的执行 状态的改变
    if(this.state == Promise.PENDING){
      this.state = Promise.REJECTED
      this.reason = reason
      this.onRejectedcallbacks.forEach(fn => fn(this.reason))
    }
  }
  then(onFulfilled, onRejected) {
    // 参数校验
    if (typeof onFulfilled !=='function'){
      onFulfilled = function(value) {
        return value
      }
    }
    if (typeof onRejected !=='function'){
      onRejected = function(reason) {
        throw reason
      }
    }

    // 实现链式调用，且改变了后面then的值，必须通过新的实例
    let promise2 = new Promise((resolve, reject) => {
      if(this.state == Promise.FULFILLED) {
        setTimeout(() => {
          try{
            const x = onFulfilled(this.value)
            Promise.resolvePromise(promise2, x, resolve, reject)
            
          } catch(e){
            reject(e)
          }
        })
      }
      if(this.state == Promise.REJECTED) {
        setTimeout(() => {
          try{
            const x = onRejected(this.reason)
          resolve(x)
          } catch(e){
            reject(e)
          }
        })
      }
  
      if (this.state == Promise.PENDING) {
          this.onFulfilledcallbacks.push(value => {
            setTimeout(() => {
              try{
                const x =onFulfilled(value)
                Promise.resolvePromise(promise2, x, resolve, reject)
                
              } catch(e){
                reject(e)
              }
            })
          })
  
          this.onRejectedcallbacks.push(reason => {
            setTimeout(() => {
              try{
                const x =onRejected(reason)
                resolve(x)
              } catch(e){
                reject(e)
              }
            })
          })
      }
    })
    return promise2
    


  }
}
Promise.PENDING = 'pending'
Promise.FULFILLED = 'fulfilled'
Promise.REJECTED = 'rejected'
Promise.resolvePromise = function(promise2, x, resolve, reject) {
  if(promise2 == x) {
    // let p = new Promise(() =>{})
    // let p2 = p.then(() =>{return p2})
    reject(new Error('Chaining cycle detected for promise'))
  }

  let called = false
  if (x instanceof Promise) {
    x.then(value => {
      console.log(typeof value, 'then')
      Promise.resolvePromise(promise2, value, resolve, reject)
    },
    reason => {
      reject(reason)
    }
  )
  } else if(x !== null && (typeof x === 'object' ||typeof x === 'function')) {
    // x为对象或函数
    try{
      if (typeof x.then == 'function'){
        x.then(value => {
          if (called) return
          called = true
          console.log(typeof value, 'then')
          Promise.resolvePromise(promise2, value, resolve, reject)
        },
        reason => {
          if (called) return
          called = true
          reject(reason)
        })
      } else {
        if (called) return
          called = true
        resolve(x)
      }
    } catch (e) {
      if (called) return
          called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

module.exports = Promise