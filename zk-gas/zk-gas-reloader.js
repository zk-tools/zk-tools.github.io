console.log("Hello World")

const new_addr    = "0x0000000000000000000000000000000000000001";
const exist_addr  = "0x0000000000000000000000000000000000000000";

const CG_TOKEN = "ethereum"
const CG_URL = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=eur&ids=" + CG_TOKEN;

const ZK_TOKEN = "ETH"
const ZK_URL = "https://api.zksync.io/jsrpc";

do_the_thing();
setInterval(function() {
    do_the_thing();
}, 60 * 1000);


function do_the_thing()
{
	get_eth_price(p => {
		// console.log(`1 ETH = ${p} EUR`);
		const price = new bigDecimal(p);
		get_zk_price("Transfer", exist_addr, p => {
			// console.log(`Transfer = ${p} wei ETH`);
			const fee_eth_wei = new bigDecimal(p)
			const fee_eth = fee_eth_wei.divide(new bigDecimal("1000000000000000000"));
			const fee_eur = fee_eth.multiply(price);
			const message =
				`Transfer @ ${new Date().toISOString()} \n` +
				`${fee_eur.getPrettyValue(3, ' ', 3)} EUR\n` +
				`${fee_eth.getPrettyValue(3, ' ', 5)} ${ZK_TOKEN}\n` +
				`1 ETH = ${price.getPrettyValue(3, ' ', 3)} EUR`;
			console.log(message);
			add_html(message.replace(/\n/g, '<br />'));
		});
	});
}

function get_eth_price(cb) {
	function _cb(text)
	{
		// console.log(text);
		const obj = JSON.parse(text);
		// console.log(obj);
		cb(obj[CG_TOKEN].eur);
	}
	http_get_async(CG_URL, _cb)
}

function get_zk_price(tx_type, addr, cb) {
	function _cb(text)
	{
		// console.log(text);
		var obj = JSON.parse(text);
		// console.log(obj);
		cb(obj.result.totalFee);
	}
	http_post_async(ZK_URL, {"id":1,"jsonrpc":"2.0","method":"get_tx_fee","params":[tx_type,addr,ZK_TOKEN]}, _cb)
}

function http_get_async(url, cb)
{
    var xml_http = new XMLHttpRequest();
    xml_http.onreadystatechange = function() {
        if (xml_http.readyState == 4 && xml_http.status == 200)
            cb(xml_http.responseText);
    }
    xml_http.open("GET", url, true); // true for asynchronous
    xml_http.send(null);
}

function http_post_async(url, data, cb)
{
    var xml_http = new XMLHttpRequest();
    xml_http.onreadystatechange = function() {
        if (xml_http.readyState == 4 && xml_http.status == 200)
            cb(xml_http.responseText);
    }
    xml_http.open("POST", url, true); // true for asynchronous
		xml_http.setRequestHeader("Content-Type", "application/json");

    xml_http.send(JSON.stringify(data));
}

function add_html(message) {
   var tag = document.createElement("div");
	 tag.innerHTML = message;
   var element = document.getElementById("new");
   element.appendChild(tag);
}
