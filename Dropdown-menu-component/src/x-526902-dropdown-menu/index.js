import {createCustomElement, actionTypes} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import '@servicenow/now-template-card';
import '@servicenow/now-modal';
import styles from './styles.scss';
import '@servicenow/now-label-value';

const { COMPONENT_BOOTSTRAPPED } = actionTypes;
const USER_FETCH_SUCCEEDED = 'USER_FETCH_SUCCEEDED';
const USER_FETCH_REQUESTED = 'USER_FETCH_REQUESTED';
const USER_DELETE_FAILED = 'USER_DELETE_FAILED';
const USER_DELETE_SUCCEEDED = 'USER_DELETE_SUCCEEDED';
const USER_DELETE_REQUESTED = 'USER_DELETE_REQUESTED';
const SHOW_MODAL = 'SHOW_MODAL';

const fetchUsers = createHttpEffect('api/now/table/incident?sysparm_display_value=true', {
	method: 'GET',
    successActionType: USER_FETCH_SUCCEEDED
});

const deleteUser = createHttpEffect('api/now/table/incident/:sys_id', {
    method: 'DELETE',
    pathParams: ['sys_id'],
    successActionType: USER_DELETE_SUCCEEDED,
    errorActionType: USER_DELETE_FAILED
});

const view = (state, {updateState}) => {
	const { dataArray = ['Loading'], cardsItems = 'Data is loading...', modalState, id, modalCardContent = 'content' } = state;

	return (
		<div>
			<now-modal content={id} footerActions={[{"id":{id},"label":"Delete","variant":"primary-negative"}]} size="lg" opened={modalState}>
				{modalCardContent}
			</now-modal>
			{cardsItems}
		</div>
	);
};

createCustomElement('x-526902-dropdown-menu', {
	renderer: {type: snabbdom},
	view,
	styles,
	actionHandlers: {
		['NOW_DROPDOWN_PANEL#ITEM_CLICKED']: (coeffects) => {
			const { dispatch, action, updateState, state } = coeffects;
			const { dataArray } = state;
			const id = action.payload.item.dataId;
			if (action.payload.item.id === 'open') {
				const targetDataCard = dataArray.filter(item => item.sys_id === id);

				updateState({ id, targetDataCard });
				dispatch(SHOW_MODAL);
			} else if (action.payload.item.id === 'delete') {

				dispatch(USER_DELETE_REQUESTED, {sys_id : id});
			}
		},
		[SHOW_MODAL]: (coeffects) => {
			const { updateState, state} = coeffects;
			const { id, targetDataCard } = state;
			const modalState = true;
			const modalCardContent = <now-label-value-stacked items={[
				{"label":"Number","value":{"type":"string","value":targetDataCard[0].number}},{"label":"State","value":{"type":"string","value":targetDataCard[0].state}},
				{"label":"Opened At","value":{"type":"string","value":targetDataCard[0].updated_on}},
				{"label":"Short description","value":{"type":"string","value":targetDataCard[0].short_description}},
				{"label":"Assignment Group","value":{"type":"string","value":targetDataCard[0].assignment_group}},
				{"label":"Assigned To","value":{"type":"string","value":targetDataCard[0].assigned_to}}
				]} itemMinWidth="130px" delimiter="," size="lg" align="vertical"></now-label-value-stacked>

			updateState({ modalState, id, modalCardContent });
		},
		['NOW_MODAL#OPENED_SET']: (coeffects) => {
			const { updateState } = coeffects;
			const modalState = false;

			updateState({ modalState });
		},
		['NOW_MODAL#FOOTER_ACTION_CLICKED']: (coeffects) => {
			const { dispatch, action, updateState, state } = coeffects;
			const modalState = false;
			dispatch(USER_DELETE_REQUESTED, {sys_id : action.payload.action.id.id});
			updateState({ modalState });

		},
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
		
			dispatch(USER_FETCH_REQUESTED);
		},
		[USER_FETCH_REQUESTED]: fetchUsers,
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
					updated_on: item.sys_updated_on,
					sys_id: item.sys_id
				}
			});

			let cardsItems = dataArray.map((item) => {
				return (<now-template-card-assist tagline={{"icon":"tree-view-long-outline","label":"Incident"}} actions={[{"id":"open", "label":"Open record","dataId":item.sys_id},{"id":"delete", "label":"Delete","dataId":item.sys_id}]} heading={{"label":item.short_description}} content={[{"label":"Number","value":{"type":"string","value":item.number}},{"label":"State","value":{"type":"string","value":item.state}},{"label":"Assigned Group","value":{"type":"string","value":item.assignment_group}},{"label":"Assigned To","value":{"type":"string","value":item.assigned_to}}]} footerContent={{"label":"Updated","value":item.updated_on}}></now-template-card-assist>)
			});

			updateState({ dataArray, cardsItems });
		},
		[USER_DELETE_REQUESTED]: deleteUser,
		[USER_DELETE_SUCCEEDED]: (coeffects) => {
			const { updateState, state, dispatch } = coeffects;
			console.log('User deleted!');

			updateState({state});
			dispatch(USER_FETCH_REQUESTED)
		},
		[USER_DELETE_FAILED]: () => {
			console.log('Deleted fail!');
		}
	}
});
