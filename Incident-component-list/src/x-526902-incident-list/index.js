import {createCustomElement, actionTypes} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import '@servicenow/now-template-card';
import styles from './styles.scss';

const { COMPONENT_BOOTSTRAPPED } = actionTypes;
const USER_FETCH_SUCCEEDED = 'USER_FETCH_SUCCEEDED';
const USER_FETCH_REQUESTED = 'USER_FETCH_REQUESTED';
const fetchUsers = createHttpEffect('api/now/table/incident?sysparm_display_value=true', {
	method: 'GET',
    successActionType: USER_FETCH_SUCCEEDED
});

const view = (state, {updateState}) => {
	const { cardsItems = 'Data is loading...'} = state;

	return (
		<div>
			{cardsItems}
		</div>
	);
};

createCustomElement('x-526902-incident-list', {
	renderer: {type: snabbdom},
	view,
	styles,
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
		
			dispatch(USER_FETCH_REQUESTED);
		},
		[USER_FETCH_REQUESTED] : fetchUsers,
		[USER_FETCH_SUCCEEDED]: (coeffects) => {
			const { action, updateState } = coeffects;
			const { result } = action.payload;

			let dataArray = result.map((item) => {
				return {
					number: item.number,
					short_description: item.description,
					state: item.state,
					assignment_group: item.assignment_group.display_value,
					assigned_to: item.assigned_to.display_value,
					updated_on: item.sys_updated_on
				}
			});

			let cardsItems = dataArray.map(item => {
				return (<now-template-card-assist tagline={{"icon":"tree-view-long-outline","label":"Incident"}}  heading={{"label":item.short_description}} content={[{"label":"Number","value":{"type":"string","value":item.number}},{"label":"State","value":{"type":"string","value":item.state}},{"label":"Assigned Group","value":{"type":"string","value":item.assignment_group}},{"label":"Assigned To","value":{"type":"string","value":item.assigned_to}}]} footerContent={{"label":"Updated","value":item.updated_on}}></now-template-card-assist>)
			});

			console.log(cardsItems);

			updateState({ cardsItems });
		}
	}
});
