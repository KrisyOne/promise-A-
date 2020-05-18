const Promise = require('./promise.js')

new Promise((resolve, reject) => {
  // setTimeout(() => {
    resolve(1)
  // })
}).then(
  value => {
    return {a: 444}
  },
  reject =>{
    console.log(reject, 'reject')
  }
).then(
  value => {
    console.log(value, 'then value')
  },
  reject =>{
    console.log(reject, 'reject')
  }
)