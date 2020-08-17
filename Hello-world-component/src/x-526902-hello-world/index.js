import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, {updateState}) => {
	return (
		<div className='page'>
			<h1 className='page__title'>Hello World!</h1>
			<h2>Test</h2>
			<p className='page__description'>Hello world page component</p>
		</div>
	);
};

createCustomElement('x-526902-hello-world', {
	renderer: {type: snabbdom},
	view,
	styles
});
