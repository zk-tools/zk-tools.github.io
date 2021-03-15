console.log("Hello World")

const NEW_ADDR    = "0x0000000000000000000000000000000000000001";
const EXIST_ADDR  = "0x0000000000000000000000000000000000000000";

const WEI_TO_ETH = new bigDecimal("1000000000000000000");

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
    add_html('<hr />');
    add_html(`1 ETH = ${price.getPrettyValue(3, ' ', 3)} EUR @ ${new Date().toISOString()}`)
    do_the_fee_thing('Transfer     ', 'Transfer', EXIST_ADDR, price);
    do_the_fee_thing('TransferNew  ', 'Transfer', NEW_ADDR, price);
    do_the_fee_thing('Withdraw     ', 'Withdraw', NEW_ADDR, price);
    do_the_fee_thing('CreateAccount', {"ChangePubKey": "ECDSA" }, EXIST_ADDR, price);
	});
}

function do_the_fee_thing(name, type, addr, price)
{
  get_zk_price(type, addr, p => {
    // console.log(`Transfer = ${p} wei ETH`);
    const fee_eth_wei = new bigDecimal(p)
    const fee_eth = fee_eth_wei.divide(WEI_TO_ETH);
    const fee_eur = fee_eth.multiply(price);
    const message =
      `${name} = ${fee_eur.round(3).getValue()} EUR = ${fee_eth.round(6).getValue()} ${ZK_TOKEN}`;
    console.log(message);
    add_html(message);
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
   var tag = document.createElement("pre");
	 tag.innerHTML = message;
   var element = document.getElementById("new");
   element.prepend(tag);
}
