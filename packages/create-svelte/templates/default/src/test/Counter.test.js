import { strict as assert } from 'assert';
import Counter from '$lib/Counter/index.svelte';

describe('Counter', () => {
	it('should increment when plus button is clicked', async () => {
		const target = document.getElementById('svelte');
		new Counter({ target });
		const plusButton = target.getElementsByTagName('button')[1];
		const counter = target.querySelectorAll('.counter-digits strong')[1];
		assert.equal(counter.innerText, '0');
		plusButton.click();
		// you probably want to use fake timers in your real tests!
		await new Promise((resolve) => setTimeout(resolve, 500));
		assert.equal(counter.innerText, '1');
	});
});
