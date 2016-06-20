/**
 * Created by yvan on 16/4/27.
 */

class Url {
	// 构造
	constructor(url) {
		//super(props);
		// 初始状态
		this.url = url;
	}

	// 获取url上各种数据
	parseURL() {

		let [url,a] = [this.url,document.createElement('a')];

		//创建一个链接
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':', ''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function () {
				let ret = {},
					seg = a.search.replace(/^\?/, '').split('&'),
					len = seg.length,
					i = 0,
					s;

				for (; i < len; i++) {
					if (!seg[i]) {
						continue;
					}
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/, '/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
			segments: a.pathname.replace(/^\//, '').split('/')
		};
	}

	// 删除url上某个参数
	delUrlParam(ref) {
		let url = this.url,
			str = "";

		if (url.indexOf('?') != -1) {
			str = url.substr(url.indexOf('?') + 1);
		}
		else {
			return url;
		}

		let [arr,returnurl,setparam] = ["","",""];

		if (str.indexOf('&') != -1) {
			arr = str.split('&');
			for (i in arr) {
				if (arr[i].split('=')[0] != ref) {
					returnurl = returnurl + arr[i].split('=')[0] + "=" + arr[i].split('=')[1] + "&";
				}
			}
			return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1);
		}
		else {
			arr = str.split('=');
			if (arr[0] == ref) {
				return url.substr(0, url.indexOf('?'));
			}
			else {
				return url;
			}
		}
	}

	// 获取url某个参数的值
	getUrlParam(name) {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
			r = this.parseURL().query.substr(1).match(reg);

		if (r != null) {
			return (r[2]);
		}
		return null;
	}

	//设置url参数值，ref参数名,value新的参数值
	changeURLParam(ref, value) {
		let str = "",
			url = this.url;

		if (url.indexOf('?') != -1) {
			str = url.substr(url.indexOf('?') + 1);
		}else {
			return url + "?" + ref + "=" + value;
		}

		let returnurl = "",
			setparam = "",
			arr,
			modify = "0";

		if (str.indexOf('&') != -1) {
			arr = str.split('&');

			for (i in arr) {
				if (arr[i].split('=')[0] == ref) {
					setparam = value;
					modify = "1";
				}
				else {
					setparam = arr[i].split('=')[1];
				}
				returnurl = returnurl + arr[i].split('=')[0] + "=" + setparam + "&";
			}

			returnurl = returnurl.substr(0, returnurl.length - 1);

			if (modify == "0")
				if (returnurl == str)
					returnurl = returnurl + "&" + ref + "=" + value;
		}
		else {
			if (str.indexOf('=') != -1) {
				arr = str.split('=');

				if (arr[0] == ref) {
					setparam = value;
					modify = "1";
				}
				else {
					setparam = arr[1];
				}
				returnurl = arr[0] + "=" + setparam;
				if (modify == "0")
					if (returnurl == str)
						returnurl = returnurl + "&" + ref + "=" + value;
			}
			else
				returnurl = ref + "=" + value;
		}
		return url.substr(0, url.indexOf('?')) + "?" + returnurl;
	}
}