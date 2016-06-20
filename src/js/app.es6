/**
 * Created by yvan on 16/4/28.
 */

let	routeConfig = require('./module/routeConfig.es6'),
	Route = require('./module/router.es6');

(function(){
	// 初始化路由
	let router = Router(routeConfig);
	router.init();
})();


