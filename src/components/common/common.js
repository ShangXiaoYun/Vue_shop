/**
 * 函数防抖
 * 没用上，this和闭包的问题
 */
 export function debounce(fn, delay) {
    // 记录上一次的延时器
    var timer = null;
    return function(...args) {
        // 清除上一次延时器
        if(timer) clearTimeout(timer)
        timer = setTimeout(function() {
        fn.apply(this,args)
        }, delay);
    }
}