export class ReturnMessage {
	private result: boolean;
	private message: string;

	constructor(result: boolean, message: string) {
		this.result = result;
		this.message = message;
	}

	public getResult() {
		return this.result;
	}

	public getMessage() {
		return this.message;
	}
}
