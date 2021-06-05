import { strict as assert } from 'assert';
import HomePage from '../routes/index.svelte';

describe('HomePage', () => {
	it('should render', () => {
		const target = document.getElementById('svelte');
		new HomePage({ target });
		assert(/try editing src\/routes\/index.svelte/.test(target.innerText));
	});
});
