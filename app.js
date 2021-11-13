const OUTPUT = document.getElementById("output");
const MEMSIGN = document.getElementById("mSign");
const NEGSIGN = document.getElementById("negSign");

const DECIMAL = ".";
const PERCENT = "%";
const NEGATIVE = "-";
const OPERATORS = "+-*/";
const NUMBERS = "0123456789";

const ENTER = "Enter";
const ESCAPE = "Escape";
const BACKSPACE = "Backspace";

const mem = {
	memming: false,
};

const output = {
	buffer: "",
	ghoster: "",
	negative: false,
	back: function () {
		if (this.length > 0) this.buffer = this.buffer.substr(0, this.length - 1);
		this.paint();
	},
	clear: function () {
		this.buffer = "";
		this.ghoster = "";
		this.negative = false;
		this.paint();
	},
	from: function (str) {
		this.clear();
		str = str.split("");
		str.forEach((char) => {
			this.push(char);
		});

		this.paint();
	},
	paint: function () {
		if (this.ghoster) OUTPUT.innerText = this.ghoster;
		else OUTPUT.innerText = this.string;
		if (this.negative) NEGSIGN.innerText = "-";
		else NEGSIGN.innerText = "";
		if (mem.memming) MEMSIGN.innerText = "M";
		else MEMSIGN.innerText = "";
	},
	pop: function () {
		let ret = this.number;
		this.clear();
		this.ghoster = ret.toString();
		this.paint();
		return ret;
	},
	push: function (num) {
		if (this.ghoster) this.ghoster = "";
		if (this.length === 12) return;
		if (num === NEGATIVE && !this.negative) this.toNegative();
		else if (num.toLowerCase() === "abs") this.toAbsolute();
		else if (num === DECIMAL) this.toFloat();
		else if (NUMBERS.indexOf(num) >= 0) {
			this.buffer += num;
			this.paint();
		} else return;
	},
	sign: function () {
		if (this.negative) this.toAbsolute();
		else this.toNegative();
		this.paint();
	},
	square: function () {
		if (this.empty) return;
		this.from(Math.sqrt(this.number).toString());
	},
	toAbsolute: function () {
		if (this.negative) {
			this.negative = false;
			this.paint();
		}
	},
	toNegative: function () {
		if (this.negative) return;
		this.negative = true;
		this.paint();
	},
	toFloat: function () {
		if (!this.floating) this.buffer += ".";
		this.paint();
	},
	get empty() {
		return this.buffer === "" || this.string === "0" || this.string === "0.0";
	},
	get floating() {
		return this.buffer.indexOf(DECIMAL) >= 0;
	},
	get length() {
		return this.buffer.length;
	},
	get number() {
		let str = !this.empty && this.negative ? "-" + this.string : this.string;
		if (this.floating) return Number.parseFloat(str);
		else return Number.parseInt(str);
	},
	get string() {
		return this.length > 0
			? this.buffer.charAt(this.length - 1) === DECIMAL
				? this.buffer + "0"
				: this.buffer
			: "0";
	},
};

const calc = {
	operand: 0,
	operator: null,
	operate: function () {
		if (OPERATORS.indexOf(this.operator) < 0) return;
		switch (this.operator) {
			case "+":
				output.from((this.operand + output.number).toString());
				break;
			case "-":
				output.from((this.operand - output.number).toString());
				break;
			case "*":
				output.from((this.operand * output.number).toString());
				break;
			case "/":
				if (this.operand === 0 || output.number === 0) {
					output.clear();
					alert("Nice try!");
				} else output.from((this.operand / output.number).toString());
				break;
		}

		this.operand = 0;
		this.operator = null;
	},
	percent: function () {
		output.from((this.operand * (output.number * 0.01)).toString());
	},
	pushOperand: function () {
		this.operand = output.pop();
	},
	pushOperator: function (op) {
		if (op && OPERATORS.indexOf(this.operator) < 0) {
			this.pushOperand();
			if (op && OPERATORS.indexOf(op) >= 0) this.operator = op;
		} else {
			this.operate();
			this.pushOperator(op);
		}
	},
};

const input = {
	btnpress: function (btn) {
		if (btn.charAt(0) === "n") {
			output.push(btn.charAt(1));
		} else if (btn.charAt(0) === "o") {
			btn = btn.substr(1).toLowerCase();
			if (btn === "sgn") output.sign();
			else if (btn === "sqr") output.square();
			else if (btn === "prc") calc.percent();
			else if (btn === "dot") output.push(DECIMAL);
			else if (btn === "cls") output.clear();
			else if (btn === "add") calc.pushOperator("+");
			else if (btn === "sub") calc.pushOperator("-");
			else if (btn === "mul") calc.pushOperator("*");
			else if (btn === "div") calc.pushOperator("/");
			else if (btn === "eql") calc.operate();
		} else if (btn.charAt(0) === "m") {
			btn = btn.substr(1).toLowerCase();
		}
	},
	keypress: function (key) {
		if (NUMBERS.indexOf(key) >= 0) {
			output.push(key);
		} else if (OPERATORS.indexOf(key) >= 0) {
			if (key === "+") this.btnpress("oAdd");
			else if (key === "-") this.btnpress("oSub");
			else if (key === "*") this.btnpress("oMul");
			else if (key === "/") this.btnpress("oDiv");
		} else if (key === DECIMAL) output.push(DECIMAL);
		else if (key === ENTER) this.btnpress("oEql");
		else if (key === ESCAPE) output.clear();
		else if (key === PERCENT) this.btnpress("oPrc");
		else if (key === BACKSPACE) output.back();
	},
};

(() => {
	document.onkeydown = (eventArgs) => {
		input.keypress(eventArgs.key);
	};
	let buttons = document.querySelectorAll("button");
	buttons.forEach((button) => {
		button.addEventListener("click", (eventArgs) => {
			input.btnpress(button.id);
		});
	});

	output.paint();
})();
