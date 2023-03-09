import cssVars from 'css-vars-ponyfill';
import React from 'react';
import {findDOMNode} from 'react-dom';

import SelectArea from '../SelectArea';
import '../Styles.css';

import axios from 'axios';
import Dropdown from "react-dropdown";
import FlexView from 'react-flexview';

import '../../node_modules/flatpickr/dist/themes/light.css'
import Flatpickr from 'react-flatpickr'
import { Korean } from "flatpickr/dist/l10n/ko"
flatpickr.localize(Korean); // default locale is now Korean

import * as Constants from '../Constants';
import { BoxHistory, HistoryLog, deleteCookie } from '../Utils';

import { Button } from '@trendmicro/react-buttons';
import '@trendmicro/react-buttons/dist/react-buttons.css';
import Modal from '@trendmicro/react-modal';
import '@trendmicro/react-modal/dist/react-modal.css';
import { CircularProgress } from '@material-ui/core';

var modalTitle = '';
var modalMsg = '';
var modalFunc = null;

var sprintf = require('sprintf-js').sprintf;

import Packet from '../Packet';
import PacketAgentOpenBox from '../PacketAgentOpenBox';
import PacketOpenBox from '../PacketOpenBox';

const moment = require('moment');

var scaleX = 1;
var scaleY = 1;

var scaleXX = 1;
var scaleYY = 1;

const RATE = 0.8;
const BIG_CONTROL_BOX_WEIGHT = 50;

var m_strPrevAreaCode = '';

const box_select = 'url(' + require('../img/R_box.png') + ')';
const box_empty = 'url(' + require('../img/B_box.png') + ')';
const box_used = 'url(' + require('../img/G_box.png') + ')';
const box_control_big = 'url(' + require('../img/kiosk.png') + ')';
const control_box = 'url(' + require('../img/control_box.png') + ')';
const image_title = 'url(' + require('../img/imageTitle.png') + ')';

const arrowClosed = (
  	<span className="arrow-closed" />
)
const arrowOpen = (
  	<span className="arrow-open" />
)

var m_listUsedVal = ['사용중', '미사용'];
var m_strCurrUsedVal = '사용여부';

var m_listSearchType = ['사원아이디', '수령자정보'];
var m_strCurrSearchType = '사원아이디';
var m_nLastSearchTypeIdx = 0;

var BoxInfo = {};
var boxBlockWidth = 0;

import SearchInput from '../SearchInput';

var searchText = '';

var m_listDeliveryType = ['사용자 입고/반납', '관리자 입고/반납'];
var m_strCurrDeliveryType = '사용타입';

import { AgGridReact } from 'ag-grid-react';
import '../ag-grid.css';
import '../ag-theme-balham.css';

var reasonSelectedRow = {};
var reasonNodeId = -1;
var reasonRowData = [];

import ReactExport from "react-data-export";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export default class Control extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataLoaded: false,
			userCode: '',
			userName: '',
			boxPassword: '',
			transCode: '',
			userPhone: '',
			payAmount: '',
			newMgrPw:'',
			newMgrPwCheck: '',
			shopPwd: '',
			id: 0,
			reasonCode: '',
			reasonName: '',
			reasonEng: '',
			startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
			endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
			rowData: null,
			// reasonRowData: null,
			showModal: false,
			showModalSelect: false,
			showModalPass: false,
			showModalPassCheck: false,
			showModalpassLogout: false,
			showModalReason: false,
			showModalProgress: false,
			selectList: ['관리자', '사용자'],
		};
		this.onUsedValChange = this.onUsedValChange.bind(this);
		this.onSearchTypeChange = this.onSearchTypeChange.bind(this);
		this.updateDimensions = this.updateDimensions.bind(this);
		this.onDeliveryTypeChange = this.onDeliveryTypeChange.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	changeState() {
	    this.setState({
	        dataLoaded: !this.state.dataLoaded
	    });
	}

	updateDimensions() {
		scaleXX = document.getElementsByTagName('body')[0].clientWidth / 1920;
		scaleYY = document.getElementsByTagName('body')[0].clientHeight / 1003;
		cssVars({
			variables: {
				'--scaleX': scaleX,
				'--scaleY': scaleY
			}
		});
		var declaration = document.styleSheets[0].rules[0].style;
		declaration.setProperty( '--scaleX', scaleX );
		declaration.setProperty( '--scaleY', scaleY );
		boxBlockWidth = global.m_nCol * 50 * scaleXX * RATE * 1.5;

		this.changeState();
	}
	
	componentWillMount() {
		global.m_nLastBoxNo = 0;
		m_strCurrUsedVal = '사용여부';
		this.updateDimensions();
	}
  
	componentWillUnmount() {
		// document.removeEventListener("keydown", this.keyFunction, false);
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentDidMount() {
		// document.addEventListener("keydown", this.keyFunction, false);
		window.addEventListener("resize", this.updateDimensions);
		this.getSite();
	}

	getSite() {
		global.m_nLastBoxNo = 0;
		global.m_listSearchResult = ['조회 결과 없음'];
		global.m_strCurrSearchResult = '조회 결과 없음';
		global.m_nLastResultIdx = 0;

		while (global.m_listSiteCode.length) {
			global.m_listSiteCode.pop();
			global.m_listSiteName.pop();
		}

		global.m_nLastFieldIdx = 0;
		global.m_strCurrFieldName = global.m_listFieldName[global.m_nLastFieldIdx];
		
		axios.get('/api/getSiteInfoList', {
		    params: {
				info: 'getSiteList',
				fieldCode: global.m_nLastFieldIdx,
		    }
		})
	    .then((response) => {
	        response.data.map( (item) => {
	        	global.m_listSiteCode.push( item.SiteCode );
	        	global.m_listSiteName.push( item.SiteName );
			});

			global.m_nLastSiteIdx = 0;
			global.m_strCurrSiteCode = global.m_listSiteCode[global.m_nLastSiteIdx];
			global.m_strCurrSiteName = global.m_listSiteName[global.m_nLastSiteIdx];

			while (global.m_listGroupCode.length) {
				global.m_listGroupCode.pop();
				global.m_listGroupName.pop();
			}

			axios.get('/api/getSiteInfoList', {
				params: {
					info: 'getGroupList',
					fieldCode: global.m_nLastFieldIdx,
					siteCode: global.m_strCurrSiteCode
				}
			})
			.then((response) => {
				response.data.map( (item) => {
					global.m_listGroupCode.push( item.GroupCode );
					global.m_listGroupName.push( item.GroupName );
				});

				global.m_nLastGroupIdx = 0;
				global.m_strCurrGroupCode = global.m_listGroupCode[global.m_nLastGroupIdx];
				global.m_strCurrGroupName = global.m_listGroupName[global.m_nLastGroupIdx];

				while (global.m_listAreaCode.length) {
					global.m_listAreaCode.pop();
					global.m_listAreaName.pop();
					global.m_listDBName.pop();
					global.m_listBuMode.pop();
					global.m_listPayMethod.pop();
					global.m_listTimeUseBoxStart.pop();
					global.m_listTimeUseBoxEnd.pop();
				}

				axios.get('/api/getSiteInfoList', {
					params: {
						info: 'getAreaList',
						fieldCode: global.m_nLastFieldIdx,
						siteCode: global.m_strCurrSiteCode,
						groupCode: global.m_strCurrGroupCode,
						BU_ServerIP: Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerIP
					}
				})
				.then((response) => {
					response.data.map( (item) => {
						global.m_listAreaCode.push( item.AreaCode );
						global.m_listAreaName.push( item.AreaName );
						global.m_listDBName.push( item.DBName );
						global.m_listPayMethod.push( item.PayMethod );

						global.m_listTimeUseBoxStart.push( item.TimeUseBoxStart );
						global.m_listTimeUseBoxEnd.push( item.TimeUseBoxEnd );

						if ( Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerIP == '' )
							global.m_listBuMode.push( 'Server' );
						else
							global.m_listBuMode.push( item.BuMode );
					});

					global.m_nLastAreaIdx = 0;
					global.m_strCurrAreaCode = global.m_listAreaCode[global.m_nLastAreaIdx];
					global.m_strCurrAreaName = global.m_listAreaName[global.m_nLastAreaIdx];
					global.m_strCurrDBName = global.m_listDBName[global.m_nLastAreaIdx];

					global.m_nLastNewAreaIdx = 0;
					global.m_strCurrNewAreaCode = global.m_listAreaCode[m_nLastNewAreaIdx];
					global.m_strCurrNewAreaName = global.m_listAreaName[m_nLastNewAreaIdx];
					global.m_strCurrNewDBName = global.m_listDBName[m_nLastNewAreaIdx];

					axios.get('/api/getSiteInfoList', {
						params: {
							info: 'getBoxSetInfo',
							fieldCode: global.m_nLastFieldIdx,
							areaCode: global.m_strCurrAreaCode
						}
					})
					.then((response) => {
						global.m_nBoxMin = response.data[0].boxmin;
						global.m_nBoxSum = response.data[0].boxsum;
						global.m_nCol = response.data[0].BoxCol;
						if ( response.data[0].LastCntOnMasterBoxCol == 0 )
							global.m_nCol++;
						global.m_nMasterBoxUpNo = response.data[0].MasterBoxUpNo;
						global.m_nMasterBoxHeight = response.data[0].MasterBoxHeight;
						global.m_nLastCntMasterBoxCol = response.data[0].LastCntOnMasterBoxCol;
						if ( global.m_nLastFieldIdx == 0 ) {
							global.m_nMasterBoxCol = response.data[0].MasterBoxCol;
						}
						
						while (global.m_listBoxUseState.length) {
							global.m_listBoxUseState.pop();
							global.m_listBoxHeight.pop();
							global.m_listBoxWidth.pop();
							global.m_listshowBoxNo.pop();
						}
						
						axios.get('/api/getSiteInfoList', {
							params: {
								info: 'getBoxHeightUseState',
								fieldCode: global.m_nLastFieldIdx,
								areaCode: global.m_strCurrAreaCode,
								dbName: global.m_strCurrDBName
							}
						})
						.then((response) => {
							global.m_nUsedSum = 0;
		
							response.data.map( (item) => {
								global.m_listBoxUseState.push( item.useState );
								
								if ( ( item.useState == 1 ) || ( item.useState == 3 ) || ( item.useState == 4 ) || ( item.useState == 5 ) )
									global.m_nUsedSum++;

								global.m_listBoxHeight.push( item.BoxHeight );
								global.m_listBoxWidth.push( item.BoxWidth );
								global.m_listshowBoxNo.push( item.showBoxNo );
							});
							this.getShopPwd();
						})
						.catch((err) => { console.log(err); });
					})
					.catch((err) => { console.log(err); });
				})
				.catch((err) => { console.log(err); });
			})
			.catch((err) => { console.log(err); });
	    })
	    .catch((err) => { console.log(err); });
	}

	getShopPwd() {
		axios.get('/api/getSiteInfoList', {
			params: {
				info: 'getShopPwd',
				fieldCode: global.m_nLastFieldIdx,
				areaCode: global.m_strCurrAreaCode,
			}
		})
		.then((response) => {
			var showPwd = response.data[0].ShopPwd;
			this.setState({ shopPwd: showPwd });
			this.changeState();
		})
		.catch((err) => { console.log(err); });
	}
	
	onUsedValChange( option ) {
		m_strCurrUsedVal = option.value;
		for ( var i = 0, cnt = m_listUsedVal.length; i < cnt; i++ ) {
			if ( m_listUsedVal[i] === m_strCurrUsedVal ) {
				BoxInfo.useState = i + 1;
				break;
			}
		}
	}
	
	onSearchTypeChange( option ) {
		m_strCurrSearchType = option.value;
		for ( var i = 0, cnt = m_listSearchType.length; i < cnt; i++ ) {
			if ( m_listSearchType[i] === m_strCurrSearchType ) {
				m_nLastSearchTypeIdx = i;
				break;
			}
		}
	}
	
	onDeliveryTypeChange( option ) {
		m_strCurrDeliveryType = option.value;
		for ( var i = 0, cnt = m_listDeliveryType.length; i < cnt; i++ ) {
			if ( m_listDeliveryType[i] === m_strCurrDeliveryType ) {
				BoxInfo.deliveryType = 8 + i;
				break;
			}
		}
	}
	
	onRowSelected(event) {
		if ( event.node.isSelected() ) {
			global.ctlNodeId = event.node.id;
		}
	}

	onGridReady(params) {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
		this.gridApi.setRowData( global.ctlSearchData );
		if ( this.gridApi.getRowNode(global.ctlNodeId) == undefined )
			return;
		this.gridApi.getRowNode(global.ctlNodeId).setSelected(true);
		this.gridApi.ensureIndexVisible(global.ctlNodeId-1, 'top')
	}
	
	onGridSizeChanged() {
		this.gridApi.sizeColumnsToFit();
	}

	onReasonRowSelected(event) {
		if ( event.node.isSelected() ) {
			reasonSelectedRow = event.node.data;
			reasonNodeId = event.node.id;

			global.selectValue = event.node.data.reasonType;
			this.setState({
				id: event.node.data.id,
				reasonType: event.node.data.reasonType,
				reasonCode: event.node.data.reasonCode,
				reasonName: event.node.data.reasonName,
				reasonEng: event.node.data.reasonEng,
			});
			this.changeState();
		}
	}

	onReasonGridReady(params) {
		this.reasonGridApi = params.api;
		this.reasonGridApi.sizeColumnsToFit();
		this.reasonGridApi.setRowData( reasonRowData );
		// this.reasonGridApi.setRowData( this.state.reasonRowData );
	}
  
	onReasonGridSizeChanged() {
		this.reasonGridApi.sizeColumnsToFit();
	}

	handleChange(e) {
		global.selectValue = e.target.value;
		this.changeState();
	}

  	render() {
		let that = this;

		function appLogout(sValue) {
			if( sValue == 'sessionOut' ) {
				that.props.logout();
			} else {
				  return;
			}
		}
		
		function selectedArea() {
			global.m_nLastBoxNo = 0;
			m_strCurrUsedVal = '사용여부';

	    	that.setState({
				userCode: '',
				userName: '',
				boxPassword: '',
				transCode: '',
				userPhone: '',
				payAmount: '',
				startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
				endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
			});
			that.getShopPwd();
		}
	
		function getInput( inputValue ) {
			searchText = inputValue;
			searchBtnClicked();
		}
	
		function keyNavigation(params) {
			var previousCell = params.previousCellDef;
			var suggestedNextCell = params.nextCellDef;

			var KEY_UP = 38;
			var KEY_DOWN = 40;
			var KEY_LEFT = 37;
			var KEY_RIGHT = 39;

			switch (params.key) {
				case KEY_DOWN:
					previousCell = params.previousCellDef;
					// set selected cell on current cell + 1
					that.gridApi.forEachNode( (node) => {
						if (previousCell.rowIndex + 1 === node.rowIndex) {
							node.setSelected(true);
						}
					});
					return suggestedNextCell;
				case KEY_UP:
					previousCell = params.previousCellDef;
					// set selected cell on current cell - 1
					that.gridApi.forEachNode( (node) => {
						if (previousCell.rowIndex - 1 === node.rowIndex) {
							node.setSelected(true);
						}
					});
					return suggestedNextCell;
				case KEY_LEFT:
				case KEY_RIGHT:
					return suggestedNextCell;
				default:
					throw "this will never happen, navigation is always on of the 4 keys above";
		   	}
		}

		const overlayLoadingTemplate = '<span style=\'color: red;\'>로딩중...</span>';
		const overlayNoRowsTemplate = '<span>데이터 없음</span>';

		const columnDefs = [
			{headerName: '구역', field: 'areaCode', width: 230*scaleX},
			{headerName: '함번호', field: 'boxNo', width: 125*scaleX},
			{headerName: '사원 아이디', field: 'userCode', width: 150*scaleX},
			{headerName: '수령자 정보', field: 'userName', width: 135*scaleX},
			{headerName: '자산정보', field: 'userPhone', width: 135*scaleX},
			{headerName: '대리수령자', field: 'transCode', width: 135*scaleX},
			{headerName: '비밀번호', field: 'boxPassword', width: 150*scaleX},
			{headerName: '타입', field: 'deliveryType', width: 125*scaleX},
			{headerName: '시작시간', field: 'startTime', width: 200*scaleX},
			{headerName: '종료시간', field: 'endTime', width: 200*scaleX},
		];

		const reasonColumnDefs = [
			{headerName: '타입', field: 'reasonType', width: 200*scaleX},
			{headerName: '보관사유 코드', field: 'reasonCode', width: 200*scaleX},
			{headerName: '보관사유(국문)', field: 'reasonName', width: 200*scaleX},
			{headerName: '보관사유(영문)', field: 'reasonEng', width: 200*scaleX},
		]

		const defaultColDef = {
			sortable: true,
			resizable: true,
			cellStyle: {textAlign: 'center'}
		};

		function boxBtnClicked() {
			axios.get('/api/getSiteInfoList', {
			    params: {
					info: 'getBoxInfo',
					fieldCode: global.m_nLastFieldIdx,
					areaCode: global.m_strCurrAreaCode,
					dbName: global.m_strCurrDBName,
					boxNo: global.m_nLastBoxNo
			    }
			})
		    .then((response) => {
				appLogout(response.data.result);
				BoxInfo = response.data[0];

				if( BoxInfo.useState == 2 ) {
					m_strCurrUsedVal = m_listUsedVal[1];
				} else {
					m_strCurrUsedVal = m_listUsedVal[0];
				}
				
				m_strCurrDeliveryType = '사용타입';

				if (BoxInfo.deliveryType == 8) {
					m_strCurrDeliveryType = '사용자 입고/반납';
				} else if (BoxInfo.deliveryType == 9) {
					m_strCurrDeliveryType = '관리자 입고/반납';
				}

				that.setState({
					userCode: BoxInfo.userCode,
					userName: BoxInfo.userName,
					boxPassword: BoxInfo.boxPassword,
					payAmount: BoxInfo.payAmount,
					startTime: BoxInfo.startTime,
					endTime: BoxInfo.endTime,
					transCode: BoxInfo.transCode,
					userPhone: BoxInfo.userPhone,
	          	});
		    })
		    .catch((err) => { console.log(err); });

			that.changeState();
		};

		function searchBtnClicked() {
			that.gridApi.showLoadingOverlay();
			global.ctlNodeId = -1;

			axios.get('/searchControl', {
			    params: {
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					sText: searchText,
					areaCodeList: global.m_listAreaCode,
					searchType: m_nLastSearchTypeIdx,
			    }
			})
		    .then((response) => {
				appLogout(response.data.result);
				var ctlSearchData = [];
				var areaCode = '';
				var deliveryType = '';
							    	
	        	response.data.map( (item) => {
					for ( var i = 0, cnt = global.m_listAreaCode.length; i < cnt; i++ ) {
						if ( global.m_listAreaCode[i] === item.areaCode )
							areaCode = global.m_listAreaName[i];
					}

					if (item.deliveryType == 8) {
						deliveryType = '사용자 입고/반납';
					} else if (item.deliveryType == 9) {
						deliveryType = '관리자 입고/반납';
					}

					ctlSearchData.push({
						areaCode: areaCode,
						boxNo: item.boxNo,
						userCode: item.userCode,
						userName: item.userName,
						boxPassword: item.boxPassword,
						startTime: item.startTime,
						endTime: item.endTime,
						deliveryType: deliveryType,
						transCode: item.transCode,
						userPhone: item.userPhone,
					});
				});

			    global.ctlSearchData = ctlSearchData;

				if ( ctlSearchData.length == 0 )
					that.gridApi.showNoRowsOverlay();
				else
					that.gridApi.hideOverlay();

		      	that.setState({rowData: ctlSearchData});
				HistoryLog( Constants.LOG_BOX_SEARCH, '보관함 정보 검색 성공', global.m_strCurrAreaCode, 0, '', 'queryStm' );
		    })
		    .catch((err) => {
				HistoryLog( Constants.LOG_BOX_SEARCH, '[ERROR] DB 오류!', global.m_strCurrAreaCode, 0, '', 'queryStm' );
		        console.log(err);
		    });
		};

		function changeImage( item ) {
			if ( global.m_nLastBoxNo == item )
				return box_select;
			else {
				if ( ( global.m_listBoxUseState[ item - global.m_nBoxMin ] == 1 ) || ( global.m_listBoxUseState[ item - global.m_nBoxMin ] == 3 ) )
					return box_used;
				else
					return box_empty;
			}
		}

		function renderBoxes() {
			var currCol = 0;
			var totHeight = 0;
			var totWidth = 0;
	
			var list = [];
	
			for ( var index = 0; index < global.m_nBoxSum; index++ ) {
				let item = index + 1;   // Do not use 'var'
		
				if ( totHeight + global.m_listBoxHeight[index] > 100 ) {
					currCol++;
					totHeight = 0;
				}
				
				if ( totWidth + global.m_listBoxWidth[index] > 100 ) {
					totWidth = 0;
				}
		
				if ( item == ( global.m_nMasterBoxUpNo + 1 ) ) {
					list.push (
						<div key={0}>
							<button disabled 
								style={{ 
									backgroundImage: control_box, 
									backgroundSize: '100% 100%', 
									position: 'absolute', 
									top: 340 * scaleY * RATE * totHeight / 100, 
									left: 50 * (totWidth/100 + currCol) * scaleX * RATE * 1.8, 
									height: 340 * scaleY * RATE * global.m_nMasterBoxHeight / 100, 
									width: 50 * scaleX * RATE * 1.8
								}}
							></button>
						</div>
					);
					totHeight += global.m_nMasterBoxHeight;
			
					if ( totWidth + global.m_listBoxWidth[index] > 99 ) {
						totWidth = 0;
					}
				}
	
				list.push (
					<div key={item}>
						<button onClick={() => { global.m_nLastBoxNo = global.m_listshowBoxNo[item-1]; boxBtnClicked(); }} 
							style={{ 
								backgroundImage: changeImage( global.m_listshowBoxNo[item-1] ), 
								backgroundSize: '100% 100%', 
								position: 'absolute', 
								top: 340 * scaleY * RATE * totHeight / 100, 
								left: 50 * (totWidth/100 + currCol) * scaleX * RATE * 1.8, 
								height: 340 * scaleY * RATE * global.m_listBoxHeight[index] / 100, 
								width: 50 * scaleX * RATE * global.m_listBoxWidth[index] / 100 * 1.8, 
								padding: 0, 
								margin: 0 
							}}
						>
							<span style={{fontSize: 18*scaleX, fontWeight: 'bold'}}>
								{global.m_listshowBoxNo[index]}
							</span>
						</button>
					</div>
				);
				totHeight += global.m_listBoxHeight[index];
				totWidth += global.m_listBoxWidth[index];
				
				if(totWidth < 99) {
					totHeight -=global.m_listBoxHeight[index];
				}
			}
	
			return list;
		}

		function openLocker() {
			BoxHistory( Constants.LOCKER_MANAGER_OPEN, global.m_nLastFieldIdx, global.m_strCurrDBName, global.m_strCurrAreaCode, global.m_nLastBoxNo, openBox );
		}
		
		function openBox() {
			if ( global.m_listBuMode[global.m_nLastAreaIdx] == 'Client' ) {
				var ServerIP = Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerIP;
				var ServerPort = Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerPort;
				var SendMsg = PacketAgentOpenBox.AgentOpenBox( 3, global.m_strCurrAreaCode, global.m_nLastBoxNo ).toString();

			} else {
				var ServerIP = Constants.m_listServerInfo[global.m_nLastFieldIdx].AGENT_ServerIP;
				var ServerPort = Constants.m_listServerInfo[global.m_nLastFieldIdx].AGENT_ServerPort;
				var SendMsg = PacketOpenBox.OpenBox( '', false, global.m_strCurrAreaCode, global.m_nLastBoxNo, 'M', global.userPhone, Constants.OPEN_TYPE_INPUT, '', false ).toString();
			}
			
			axios.get('/openBox', {
			    params: {
				    ip : ServerIP,
				    port: ServerPort,
				    msg: SendMsg
			    }
			})
	  		.then(response => {
			    if ( response.data.data[1] !== Constants.CODE_ACK ) {
			    	var tmpMsg = sprintf( '[%s] 번함이 열리지 않았습니다.', global.m_nLastBoxNo );
				    openModal( '열기안내', tmpMsg, null );
					HistoryLog( Constants.LOG_OPEN_BOX, '열기 실패', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, '' );

			    } else {
			    	var tmpMsg = sprintf( '[%d] 번함이 열렸습니다.', global.m_nLastBoxNo );
		    		openModal( '열기안내', tmpMsg, null );
					HistoryLog( Constants.LOG_OPEN_BOX, '열기 성공', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, '' );

			    }
    		})
    		.catch(err => {
			    openModal( '열기안내', '열기 실패', null );
				HistoryLog( Constants.LOG_OPEN_BOX, '열기 실패', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, '' );
				console.log(err)
    		});
		}

		function boxOpen() {
			if ( global.m_nLastBoxNo == 0 ) {
		    	openModal( '열기안내', '먼저 사물함을 선택하세요.', null );
				return;
			}
			
			var tmpMsg = sprintf( '[%s] 에 위치한\n\n사물함 [%d] 번이 열립니다.\n\n다시한번 확인해 주십시요.\n\n계속진행 하시겠습니까?', global.m_strCurrAreaName, global.m_nLastBoxNo );
			openModal( '열기안내', tmpMsg, openLocker );
		}
		
		function openModal( title, msg, func ) {
			modalTitle = title;
			modalMsg = msg;
			if ( func == null )
				that.setState({showModal: true});
			else {
				modalFunc = func;
				that.setState({showModalSelect: true});
			}
		}			

		function returnLocker() {
			BoxHistory( Constants.LOCKER_MANAGER_RETURN, global.m_nLastFieldIdx, global.m_strCurrDBName, global.m_strCurrAreaCode, global.m_nLastBoxNo, returnBox );
		}

	  	function returnBox() {
			axios.get('/changeInfo', {
			    params: {
					info: 'returnBox',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					boxNo: global.m_nLastBoxNo,
					areaCode: global.m_strCurrAreaCode,
			    }
			})
		    .then((response) => {
				appLogout(response.data.result);
			    if ( response.data.result == 'success' ) {
				    openModal( '반납안내', '반납 성공.', null );
					HistoryLog( Constants.LOG_BOX_RETURN, '반납 성공 (서버 Only)', global.m_strCurrAreaCode, global.m_nLastBoxNo, '', 'queryStm' );
						
					while (global.m_listBoxUseState.length) {
						global.m_listBoxUseState.pop();
						global.m_listBoxHeight.pop();
						global.m_listBoxWidth.pop();
						global.m_listshowBoxNo.pop();
					}
					
					axios.get('/api/getSiteInfoList', {
						params: {
							info: 'getBoxHeightUseState',
							fieldCode: global.m_nLastFieldIdx,
							areaCode: global.m_strCurrAreaCode,
							dbName: global.m_strCurrDBName
						}
					})
					.then((response) => {
						global.m_nUsedSum = 0;
						
						response.data.map( (item) => {
							global.m_listBoxUseState.push( item.useState );
							
							if ( ( item.useState == 1 ) || ( item.useState == 3 ) || ( item.useState == 4 ) || ( item.useState == 5 ) )
								global.m_nUsedSum++;

							global.m_listBoxHeight.push( item.BoxHeight );
							global.m_listBoxWidth.push( item.BoxWidth );
							global.m_listshowBoxNo.push( item.showBoxNo );
						});

						boxBtnClicked();
					})
					.catch((err) => { console.log(err); });

				} else {
				    openModal( '반납안내', '반납 실패.', null );
					HistoryLog( Constants.LOG_BOX_RETURN, '[ERROR] 반납 실퍠! (DB Write Error)', global.m_strCurrAreaCode, global.m_nLastBoxNo, '', 'queryStm' );
				}
		    })
		    .catch((err) => {
				openModal( '반납안내', '반납 실패.', null );
				HistoryLog( Constants.LOG_BOX_RETURN, '[ERROR] 반납 실퍠! (DB Open Error)', global.m_strCurrAreaCode, global.m_nLastBoxNo, '', 'queryStm' );
		        console.log(err);
		    });
	  	};

		function returnBtnClicked() {
			if ( global.m_nLastBoxNo == 0 ) {
		    	openModal( '반납안내', '먼저 사물함을 선택하세요.', null );
				return;
			}

			var tmpMsg = sprintf( '[%s] 에 위치한 사물함 [%s] 번이 반납처리 됩니다. 다시한번 확인해 주십시요. 계속진행 하시겠습니까?', global.m_strCurrAreaName, global.m_nLastBoxNo );
	    	openModal( '반납안내', tmpMsg, returnLocker );
		}
		
		function updateLocker() {
			BoxHistory( Constants.LOCKER_MANAGER_DBUPDATE, global.m_nLastFieldIdx, global.m_strCurrDBName, global.m_strCurrAreaCode, global.m_nLastBoxNo, updateBox );
		}

	  	function updateBox() {
			BoxInfo.userCode = that.state.userCode;
			BoxInfo.userName = that.state.userName;
			BoxInfo.transCode = that.state.transCode;
			BoxInfo.boxPassword = that.state.boxPassword;
			BoxInfo.startTime = that.state.startTime;
			BoxInfo.endTime = that.state.endTime;
			BoxInfo.userPhone = that.state.userPhone;

			axios.get('/changeInfo', {
			    params: {
					info: 'updateBox',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					BoxInfo: BoxInfo,
					boxNo: global.m_nLastBoxNo,
					areaCode: global.m_strCurrAreaCode,
			    }
			})
		    .then((response) => {
				appLogout(response.data.result);
			    if ( response.data.result == 'success' ) {
				    openModal( '업데이트안내', '업데이트 성공.', null );
					HistoryLog( Constants.LOG_DB_UPDATE, '업데이트 성공 (서버 Only)', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, 'queryStm' );
						
					while (global.m_listBoxUseState.length) {
						global.m_listBoxUseState.pop();
						global.m_listBoxHeight.pop();
						global.m_listBoxWidth.pop();
						global.m_listshowBoxNo.pop();
					}
					
					axios.get('/api/getSiteInfoList', {
						params: {
							info: 'getBoxHeightUseState',
							fieldCode: global.m_nLastFieldIdx,
							areaCode: global.m_strCurrAreaCode,
							dbName: global.m_strCurrDBName
						}
					})
					.then((response) => {
						global.m_nUsedSum = 0;
						
						response.data.map( (item) => {
							global.m_listBoxUseState.push( item.useState );
							
							if ( ( item.useState == 1 ) || ( item.useState == 3 ) || ( item.useState == 4 ) || ( item.useState == 5 ) )
								global.m_nUsedSum++;

							global.m_listBoxHeight.push( item.BoxHeight );
							global.m_listBoxWidth.push( item.BoxWidth );
							global.m_listshowBoxNo.push( item.showBoxNo );
						});

						boxBtnClicked();
					})
					.catch((err) => { console.log(err); });

				} else {
				    openModal( '업데이트안내', '업데이트 실패.', null );
					HistoryLog( Constants.LOG_DB_UPDATE, '[ERROR] 업데이트 실퍠! (DB Update Error)', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, 'queryStm' );
				}
		    })
		    .catch((err) => {
				openModal( '업데이트안내', '업데이트 실패.', null );
				HistoryLog( Constants.LOG_DB_UPDATE, '[ERROR] 업데이트 실퍠! (DB Open Error)', global.m_strCurrAreaCode, global.m_nLastBoxNo, BoxInfo.userPhone, 'queryStm' );
		        console.log(err);
		    });
	  	};

		function updateBtnClicked() {
			if ( global.m_nLastBoxNo == 0 ) {
		    	openModal( '업데이트안내', '먼저 사물함을 선택하세요.', null );
				return;
			}
			var tmpMsg = sprintf( '[%s] 에 위치한 사물함 [%s] 번이 DB 업데이트 됩니다. 다시한번 확인해 주십시요. 계속진행 하시겠습니까?', global.m_strCurrAreaName, global.m_nLastBoxNo );
	    	openModal( '업데이트안내', tmpMsg, updateLocker );
		}

		function checkAccntPwd() {
			if ( that.state.newMgrPw.length == 0 ) {
				openModal( '로그인 비밀번호 변경', '비밀번호를 입력해 주세요.', null );
				return;
			}

			axios.get('/searchList', {
				params: {
					info: 'searchID',
					userID: global.userPhone,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if (response.data[0].UserPW == that.state.newMgrPw) {
					that.setState({showModalPassCheck: false, showModalPass: true, newMgrPw: '', newMgrPwCheck: ''});
				} else {
					openModal('로그인 비밀번호 변경', '비밀번호가 일치하지 않습니다.', null);
					return;
				}
			})
			.catch((err) => { console.log(err); });
		}

		function changeAccntPwd() {
			if ( that.state.newMgrPw.length == 0 ) {
				openModal( '로그인 비밀번호 변경', '사용할 비밀번호를 입력해 주세요.', null );
				return;
			}
			if ( that.state.newMgrPwCheck.length == 0 ) {
				openModal( '로그인 비밀번호 변경', '비밀번호 확인을 입력해 주세요.', null );
				return;
			}
			if (that.state.newMgrPw != that.state.newMgrPwCheck) {
				openModal( '로그인 비밀번호 변경', '비밀번호와 비밀번호 확인의 값이 다릅니다.', null );
				return;
			}

			axios.get('/changeList', {
				params: {
					info: 'UpdateAccntPassword',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					mgrId: global.userPhone,
					mgrPw: that.state.newMgrPw,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if ( response.data.result == 'success' ) {	
					deleteCookie( 'AL' );
					deleteCookie( 'managerID' );
					that.setState({showModalPass: false, showModalpassLogout:true, newMgrPw: '', newMgrPwCheck: ''});
					
				} else {
					openModal( '로그인 비밀번호 변경1', '로그인 비밀번호 변경에 실패했습니다.', null );
				}
			})
			.catch((err) => {
				openModal( '로그인 비밀번호 변경2', '로그인 비밀번호 변경에 실패했습니다.', null );
			});
		}

		function getReasonInfo() {
			reasonRowData.length = 0;
			axios.get('/api/getSiteInfoList', {
				params: {
					info: 'getReasonInfo',
					fieldCode: global.m_nLastFieldIdx,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				var tempReasonList = [];
				var rType = '';
				response.data.map((item) => {
					if (item.ReasonType == 'M')
						rType = '관리자';
					else if (item.ReasonType == 'U')
						rType = '사용자';

					tempReasonList.push({
						id: item.id, 
						reasonType: rType,
						reasonCode: item.ReasonCode,
						reasonName: item.ReasonName,
						reasonEng: item.ReasonNameEng,
					})
				});
				
				if ( reasonRowData.length == 0 )
					that.reasonGridApi.showNoRowsOverlay();
				else
					that.reasonGridApi.hideOverlay();

				reasonRowData = tempReasonList;
				that.changeState();
			})
			.catch((err) => {
				console.log(err);
			});
		}

		function getReasonInfoBtn() {
			getReasonInfo();
			that.setState({ id: 0, reasonCode: '', reasonName: '', reasonEng: '', showModalReason: true });
		}

		function insertReasonBtn() {
			if (that.state.reasonCode == '') {
				openModal('보관사유 등록 안내', '보관사유 코드를 입력해주세요.', null);
			} else if (that.state.reasonName == '') {
				openModal('보관사유 등록 안내', '보관사유 국문명을 입력해주세요.', null);
			} else if (global.selectValue == '사용자' && that.state.reasonEng == '') {
				openModal('보관사유 등록 안내', '보관사유 영문명을 입력해주세요', null);
			} else {
				axios.get('/api/getSiteInfoList', {
					params: {
						info: 'searchReasonInfo_insert',
						fieldCode: global.m_nLastFieldIdx,
						reasonId: that.state.id,
						reasonCode: that.state.reasonCode,
						// reasonName: that.state.reasonName,
						// reasonEng: that.state.reasonEng,
					}
				})
				.then((response) => {
					appLogout(response.data.result);
					if (response.data.length == 0) {
						openModal('보관사유 등록 안내', `보관사유[${that.state.reasonName}]을(를) 등록하시겠습니까?`, insertReason);
					} else {
						openModal('보관사유 등록 안내', '이미 등록되어있는 보관사유 명칭(코드) 입니다.', null);
					}
				})
				.catch((err) => {
					openModal('보관사유 등록 안내', '보관사유 등록에 실패하였습니다.', null);
					console.log(err);
				});
			}
		}

		function insertReason() {
			var selectType = '';
			if (global.selectValue == '관리자') {
				selectType = 'M';
			} else if (global.selectValue == '사용자') {
				selectType = 'U';
			}

			axios.get('/changeInfo', {
				params: {
					info: 'insertResonInfo',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					reasonCode: that.state.reasonCode,
					reasonName: that.state.reasonName,
					reasonEng: that.state.reasonEng,
					selectType: selectType,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if (response.data.result == 'success') {
					openModal('보관사유 등록 안내', '보관사유 등록에 성공하였습니다.', null);
					that.setState({ id: 0, reasonCode: '', reasonName: '', reasonEng: '' });
					that.changeState();

				} else {
					openModal('보관사유 등록 안내', '보관사유 등록에 실패하였습니다.', null);
				}
				getReasonInfo();
			})
			.catch((err) => {
				openModal('보관사유 등록 안내', '보관사유 등록에 실패하였습니다.', null);
				console.log(err);
			});
		}

		function deleteReasonBtn() {
			openModal('보관사유 삭제 안내', `보관사유[${that.state.reasonName}]을(를) 삭제하시겠습니까?`, deleteReason);
		}

		function deleteReason() {
			axios.get('/changeInfo', {
				params: {
					info: 'deleteResonInfo',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					reasonId: that.state.id,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if (response.data.result == 'success') {
					openModal('보관사유 삭제 안내', '보관사유 삭제에 성공하였습니다.', null);

				} else {
					openModal('보관사유 삭제 안내', '보관사유 삭제에 실패하였습니다.', null);
				}
				getReasonInfo();
			})
			.catch((err) => {
				openModal('보관사유 삭제 안내', '보관사유 삭제에 실패하였습니다.', null);
				console.log(err);
			})
		}

		function updateReasonBtn() {
			if (that.state.id == 0) {
				openModal('보관사유 등록 안내', '수정할 보관사유를 선택해주세요.', null);
			} else if (that.state.reasonCode == '') {
				openModal('보관사유 등록 안내', '보관사유 코드를 입력해주세요.', null);
			} else if (that.state.reasonName == '') {
				openModal('보관사유 등록 안내', '보관사유 국문명을 입력해주세요.', null);
			} else if (global.selectValue == '사용자' && that.state.reasonEng == '') {
				openModal('보관사유 등록 안내', '보관사유 영문명을 입력해주세요', null);
			} else {
				axios.get('/api/getSiteInfoList', {
					params: {
						info: 'searchReasonInfo_update',
						fieldCode: global.m_nLastFieldIdx,
						reasonId: that.state.id,
						reasonCode: that.state.reasonCode,
						// reasonName: that.state.reasonName,
						// reasonEng: that.state.reasonEng,
					}
				})
				.then((response) => {
					appLogout(response.data.result);
					if (response.data.length == 0) {
						openModal('보관사유 수정 안내', `보관사유[${that.state.reasonName}]을(를) 수정하시겠습니까?`, updateReason);
					} else {
						openModal('보관사유 수정 안내', '이미 등록되어있는 보관사유 명칭(코드) 입니다.', null);
					}
				})
				.catch((err) => {
					openModal('보관사유 수정 안내', '보관사유 수정에 실패하였습니다.', null);
					console.log(err);
				})
			}
		}

		function updateReason() {
			var selectType = '';
			var reason_e = '';
			if (global.selectValue == '관리자') {
				selectType = 'M';
				reason_e = '';
			} else if (global.selectValue == '사용자') {
				selectType = 'U';
				reason_e = that.state.reasonEng;
			}

			axios.get('/changeInfo', {
				params: {
					info: 'updateResonInfo',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					reasonId: that.state.id,
					reasonCode: that.state.reasonCode,
					reasonName: that.state.reasonName,
					reasonEng: reason_e,
					selectType: selectType,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if (response.data.result == 'success') {
					openModal('보관사유 수정 안내', '보관사유 수정에 성공하였습니다.', null);
					that.setState({ id: 0, reasonCode: '', reasonName: '', reasonEng: '' });
					that.changeState();

				} else {
					openModal('보관사유 수정 안내', '보관사유 수정에 실패하였습니다.', null);
				}
				getReasonInfo();
			})
			.catch((err) => {
				openModal('보관사유 수정 안내', '보관사유 수정에 실패하였습니다.', null);
				console.log(err);
			});
		}

		function kioskPwChange() {
			axios.get('/changeInfo', {
				params: {
					info: 'changePwd',
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					pwd: that.state.shopPwd,
					areaCode: global.m_strCurrAreaCode,
				}
			})
			.then((response) => {
				appLogout(response.data.result);
				if (response.data.result == 'success') {
					openModal('키오크스 관리자 비밀번호 변경', '비밀번호 변경이 적용되었습니다', null);
				} else {
					openModal('키오크스 관리자 비밀번호 변경', '비밀번호 변경에 실패하였습니다.', null);
				}
			})
			.catch((err) => {
				openModal('키오크스 관리자 비밀번호 변경', '비밀번호 변경에 실패하였습니다.', null);
				console.log(err);
			});
		}

		function kioskPwChangeBtn() {
			if (that.state.shopPwd == '') {
				openModal('키오크스 관리자 비밀번호 변경', '비밀번호를 설정해주세요.', null);
				return;
			}
			openModal('키오크스 관리자 비밀번호 변경', `[${global.m_strCurrAreaName}]구역의 키오크스 관리자 비밀번호를 [${that.state.shopPwd}]로 변경하시겠습니까?`, kioskPwChange);
		}

		function openBoxAll() {
			that.setState({ showModalProgress: true });
			var url = 'test';
		  
			if ( global.m_listBuMode[global.m_nLastAreaIdx] == 'Client' ) {
				var ServerIP = Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerIP;
				var ServerPort = Constants.m_listServerInfo[global.m_nLastFieldIdx].BU_ServerPort;
				var SendMsg = [];
			
				for ( let boxNo = global.m_nBoxMin, cnt = global.m_nBoxMin + global.m_nBoxSum; boxNo < cnt; boxNo++ ) {	// Do not use 'var'
					SendMsg.push( PacketAgentOpenBox.AgentOpenBox( 3, global.m_strCurrAreaCode, boxNo ).toString('hex') );
				}
			
		    	var MsgLen = 22; 

			} else {
				var ServerIP = Constants.m_listServerInfo[global.m_nLastFieldIdx].AGENT_ServerIP;
				var ServerPort = Constants.m_listServerInfo[global.m_nLastFieldIdx].AGENT_ServerPort;

				var SendMsg = [];
			
				for ( let boxNo = global.m_nBoxMin, cnt = global.m_nBoxMin + global.m_nBoxSum; boxNo < cnt; boxNo++ ) {	// Do not use 'var'
					if( global.m_nLastFieldIdx == 3 || global.m_nLastFieldIdx == 4|| global.m_nLastFieldIdx == 5 )
						SendMsg.push( PacketOpenBoxWash.OpenBoxWash( '', false, global.m_strCurrAreaCode, boxNo, 'M', global.userPhone, Constants.OPEN_TYPE_INPUT, '', false, '' ).toString('hex') );
					else if( global.m_nLastFieldIdx == 11 || global.m_nLastFieldIdx == 12 )
						SendMsg.push( PacketOpenBoxWoman.OpenBoxWoman( '', false, global.m_strCurrAreaCode, boxNo, 'M', global.userPhone, Constants.OPEN_TYPE_INPUT, '', false ).toString('hex') );
					else
						SendMsg.push( PacketOpenBox.OpenBox( '', false, global.m_strCurrAreaCode, boxNo, 'M', global.userPhone, Constants.OPEN_TYPE_INPUT, '', false ).toString('hex') );
				}
			
				if( global.m_nLastFieldIdx == 3 || global.m_nLastFieldIdx == 4|| global.m_nLastFieldIdx == 5 )
			    	var MsgLen = 60;
				else if( global.m_nLastFieldIdx == 11 || global.m_nLastFieldIdx == 12 )
			    	var MsgLen = 51;
			 	else   
			    	var MsgLen = 50;
			}
			
			var params = {
				ip : ServerIP,
				port: ServerPort,
				msg: SendMsg,
				len: MsgLen
			}
			var qs = require('qs');
				
      		axios.post( url, qs.stringify( params ) )
	  		.then(response => {
				that.setState({ showModalProgress: false });
				if ( response.data != ' ' ) {
					var count = ( response.data.match(/\u0020/g) || [] ).length - 1;	// response.data 의 마지막에 공백이 하나 더 추가되어 옴.
				    var tmpMsg = sprintf( '열기 실패 리스트 : %s', response.data );
				    openModal( '전체열기안내', tmpMsg, null );
				    
					var resultMsg = sprintf( '%d 개 열기 성공', global.m_nBoxSum - count );
					HistoryLog( Constants.LOG_OPEN_ALLBOX, resultMsg, global.m_strCurrAreaCode, 0, '', tmpMsg );

				}	else {
				    openModal( '전체열기안내', '전체열기가 완료되었습니다.', null );
					var resultMsg = sprintf( '%d 개 열기 성공', global.m_nBoxSum );
					HistoryLog( Constants.LOG_OPEN_ALLBOX, resultMsg, global.m_strCurrAreaCode, 0, '', '' );
				}
				BoxHistory( Constants.LOCKER_MANAGER_OPEN, global.m_nLastFieldIdx, global.m_strCurrDBName, global.m_strCurrAreaCode, 0, null );
    		})
    		.catch(error => {
				that.setState({ showModalProgress: false });
				HistoryLog( Constants.LOG_OPEN_ALLBOX, '전체열기 실패', global.m_strCurrAreaCode, 0, '', '' );
				console.log(error);
			    openModal( '전체열기안내', '내부 서버 에러가 발생했습니다. 네트워크를 확인하시기 바랍니다.', null );
    		});
		}

		function boxOpenAll() {
			var tmpMsg = sprintf( '[%s] 에 위치한 사물함의 전체열기를 진행 하시겠습니까?', global.m_strCurrAreaName );
	    	openModal( '전체열기안내', tmpMsg, openBoxAll );
		};
		
		let check_able;
		if (global.selectValue == '관리자') {
			check_able = <input disabled value={this.state.reasonEng || ''} onChange={ evt => this.setState( { reasonEng: evt.target.value } ) }/>
		} else if (global.selectValue == '사용자') {
			check_able = <input value={this.state.reasonEng || ''} onChange={ evt => this.setState( { reasonEng: evt.target.value } ) }/>
		}
		
		boxBlockWidth = global.m_nCol * 50 * scaleXX * RATE * 1.5;

		return (
			<div>
				{this.state.showModal &&
					<Modal
						size = 'xs' 
						disableOverlay={false}
						onClose={ () => { this.setState({showModal: false}); } }
					>
						{modalTitle &&
							<Modal.Header>
								<Modal.Title>{modalTitle}</Modal.Title>
							</Modal.Header>
						}
						<Modal.Body>
							{modalMsg}
						</Modal.Body>
						<Modal.Footer>
							<Button autoFocus btnStyle="primary" onClick={ () => { this.setState({showModal: false}); } }>확인</Button>
						</Modal.Footer>
					</Modal>
				}

				{this.state.showModalSelect &&
					<Modal
							size = 'xs' 
						disableOverlay={false}
						onClose={ () => { this.setState({showModalSelect: false}); } }
					>
						{modalTitle &&
						<Modal.Header>
							<Modal.Title>{modalTitle}</Modal.Title>
						</Modal.Header>
						}
						<Modal.Body>
							{modalMsg}
						</Modal.Body>
						<Modal.Footer>
							<Button btnStyle="primary" onClick={ () => { this.setState({showModalSelect: false}); modalFunc(); } }>확인</Button>
							<Button autoFocus onClick={ () => { this.setState({showModalSelect: false}); } }>취소</Button>
						</Modal.Footer>
					</Modal>
				}

				{this.state.showModalpassLogout &&
					<Modal
						size = 'xs' 
						disableOverlay={true}
						showCloseButton={false}
					>
						<Modal.Header>
							<Modal.Title>로그인 비밀번호 변경</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							로그인 비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.
						</Modal.Body>
						<Modal.Footer>
							<Button autoFocus btnStyle="primary" onClick={ () => { this.setState({showModalpassLogout: false}); that.props.logout(); } }>확인</Button>
						</Modal.Footer>
					</Modal>
				}

				{this.state.showModalPassCheck &&
					<Modal
						disableOverlay={true}
						onClose={ () => { this.setState({showModalPassCheck: false}); } }
					>
						<Modal.Header>
							<Modal.Title>로그인 비밀번호 변경</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<FlexView column style={{justifyContent: 'space-around'}} height={'300px'} width={'400px'}> 
								<FlexView style={{ flex: 4 }} hAlignContent='center'  vAlignContent='center'>
									<FlexView style={{flex: 1, justifyContent: 'space-around'}}>
										<label className='deptgroup' style={{fontSize:16, width: '30%', height: '30px', textAlign: 'center', justifyContent: 'center', paddingTop: 5, marginBottom: 35}}>비밀번호 확인</label>
										<input type='password' autoFocus style={{fontSize: 16, width: '60%', height: '30px'}} value={this.state.newMgrPw} placeholder='현재 비밀번호' onChange={ evt => this.setState({newMgrPw: evt.target.value}) } onKeyPress={evt => {if (evt.key === 'Enter') { checkAccntPwd() } }}/>
									</FlexView>
								</FlexView>
								
								<FlexView style={{ flex: 0.5 }} hAlignContent='right'>
									<Button btnStyle="primary" onClick={ () => { checkAccntPwd(); } }>확인</Button>
									<Button onClick={ () => { this.setState({showModalPassCheck: false}); } }>취소</Button>
								</FlexView>
							</FlexView>
						</Modal.Body>
					</Modal>
				}
				
				{this.state.showModalPass &&
					<Modal
						disableOverlay={false}
						onClose={ () => { this.setState({showModalPass: false}); } }
					>
						<Modal.Header>
							<Modal.Title>로그인 비밀번호 변경</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<FlexView column style={{justifyContent: 'space-around'}} height={'300px'} width={'400px'}> 
								<FlexView style={{ flex: 2 }} hAlignContent='center' vAlignContent='center'>
									<FlexView style={{flex: 1, justifyContent: 'space-around'}}>
										<label className='deptgroup' style={{fontSize:16, width: '30%', height: '30px', textAlign: 'center', justifyContent: 'center', paddingTop: 5, marginBottom: 35}}>비밀번호</label>
										<input type='password' autoFocus style={{fontSize: 16, width: '60%', height: '30px'}} value={this.state.newMgrPw} placeholder='신규 비밀번호' onChange={ evt => this.setState({newMgrPw: evt.target.value}) } onKeyPress={evt => {if (evt.key === 'Enter') { this.pwInput.focus() } }}/>
									</FlexView>
								</FlexView>
								<FlexView style={{ flex: 2 }} hAlignContent='center' vAlignContent='center'>
									<FlexView style={{flex: 1, justifyContent: 'space-around'}}>
										<label className='deptgroup' style={{fontSize:16, width: '30%', height: '30px', textAlign: 'center', justifyContent: 'center', paddingTop: 5, marginBottom: 35}}>비밀번호 확인</label>
										<input ref={(input) => { this.pwInput = input; }} type='password' autoFocus style={{fontSize: 16, width: '60%', height: '30px'}} value={this.state.newMgrPwCheck} placeholder='신규 비밀번호 확인' onChange={ evt => this.setState({newMgrPwCheck: evt.target.value}) } onKeyPress={evt => {if (evt.key === 'Enter') { changeAccntPwd() } }}/>
									</FlexView>
								</FlexView>
								<FlexView style={{ flex: 0.5 }} hAlignContent='right'>
									<Button btnStyle="primary" onClick={ () => { changeAccntPwd(); } }>변경</Button>
									<Button onClick={ () => { this.setState({showModalPass: false}); } }>취소</Button>
								</FlexView>
							</FlexView>
						</Modal.Body>
					</Modal>
				}

				{this.state.showModalProgress &&
					<Modal disableOverlay={false} showCloseButton={false}>
							<Modal.Header>
								<FlexView hAlignContent='center'>
									<Modal.Title>전체열기중</Modal.Title>
								</FlexView>
							</Modal.Header>
						<Modal.Body>
							<FlexView hAlignContent='center'>
								<CircularProgress color='secondary' />
							</FlexView>
						</Modal.Body>
					</Modal>
				}
				
				{this.state.showModalReason &&
					<Modal
						disableOverlay={false}
						onClose={ () => { this.setState({showModalReason: false}); } }
					>
						<Modal.Header>
							<Modal.Title>보관사유 관리</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<FlexView column style={{ flex: 5, height: 500 * scaleY }} hAlignContent='center' >
								<FlexView style={{ flex: 1 }}/>
								<FlexView style={{ flex: 10, marginRight: 10, marginBottom: 10, height: 300*scaleY, width: 1015*scaleX }} hAlignContent='center'>
									<div
										className="ag-theme-balham"
										style={{
											height: '100%',
											width: '100%'
										}}
									>
										<AgGridReact
											columnDefs={reasonColumnDefs}
											rowSelection='single'
											rowData={reasonRowData}
											// rowData={this.state.reasonRowData}
											defaultColDef={defaultColDef}
											navigateToNextCell={keyNavigation}
											onRowSelected={this.onReasonRowSelected.bind(this)}
											onGridReady={this.onReasonGridReady.bind(this)}
											onGridSizeChanged={this.onReasonGridSizeChanged.bind(this)}
											overlayLoadingTemplate={overlayLoadingTemplate}
											overlayNoRowsTemplate={overlayNoRowsTemplate}
										/>
									</div>
								</FlexView>
								<FlexView style={{ flex: 0.4 }}/>
								<FlexView style={{flex: 2}} hAlignContent='center' vAlignContent='center'>
									<FlexView style={{ margin: '0px 20px', border: '2px solid #abcaff', borderRadius: '15px', padding: '5px' }}>
										{this.state.selectList.map((item) => (
											<FlexView key={item} column hAlignContent='center'>
												<label>{item}</label>
												<input type="radio" name="select_type" value={item} checked={global.selectValue===item} onChange={this.handleChange} style={{ width: '50px' }} />
											</FlexView>
										))}
									</FlexView>
									<FlexView column hAlignContent='center' >
										<label>　</label>
										<Button btnStyle="default" style={{ width: 100*scaleX }} onClick={() => { this.setState({ reasonCode: '', reasonName: '', reasonEng: '' })}}>입력초기화</Button>
									</FlexView>
									<FlexView column hAlignContent='center' >
										<label>보관사유 코드</label>
										<input value={this.state.reasonCode || ''} onChange={ evt => this.setState( { reasonCode: evt.target.value } ) }/>
									</FlexView>
									<FlexView column hAlignContent='center' >
										<label>보관사유 국문</label>
										<input value={this.state.reasonName || ''} onChange={ evt => this.setState( { reasonName: evt.target.value } ) }/>
									</FlexView>
									
									<FlexView column hAlignContent='center' >
										<label>보관사유 영문</label>
										{check_able}
										{/* <input value={this.state.reasonEng || ''} onChange={ evt => this.setState( { reasonEng: evt.target.value } ) }/> */}
									</FlexView>

									<FlexView column hAlignContent='center' >
										<label>　</label>
										<Button btnStyle="danger" onClick={deleteReasonBtn}>삭제</Button>
									</FlexView>
									<FlexView column hAlignContent='center' >
										<label>　</label>
										<Button btnStyle="default" onClick={updateReasonBtn}>수정</Button>
									</FlexView>
									<FlexView column hAlignContent='center' >
										<label>　</label>
										<Button btnStyle="primary" onClick={insertReasonBtn}>등록</Button>
									</FlexView>
								</FlexView>
							</FlexView>
						</Modal.Body>
						<Modal.Footer>
							<Button btnStyle="primary" onClick={ () => { this.setState({ showModalReason: false }); } }>확인</Button>
						</Modal.Footer>
					</Modal>
				}

				<FlexView column height={document.getElementsByTagName('body')[0].clientHeight-56} width={document.getElementsByTagName('body')[0].clientWidth}> 
					<FlexView column id='boxGrid' className='boxgrid' style={{ flex: 3.5}}>
						<FlexView style={{ flex: 1.1 }}>
							<FlexView column style={{ flex: 3 }}/>
							<FlexView style={{ flex: 5.8, backgroundImage: image_title, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain'}}/>
							<FlexView column style={{ flex: 3 }}/>
						</FlexView>

						<FlexView style={{ flex: 0.1 }} hAlignContent='center'>
							<label className='usestate'>[ {global.m_nUsedSum} / {global.m_nBoxSum} 함 사용중 ]</label>
						</FlexView>

						<FlexView style={{ flex: 3, position: 'relative', top: 36 * scaleY, left: ( document.getElementsByTagName('body')[0].clientWidth - boxBlockWidth - 40 ) / 2}}>
							{renderBoxes()}
						</FlexView>
					</FlexView>

					<FlexView style={{ flex: 0.4 }} hAlignContent='center' vAlignContent='center'>
						<FlexView style={{ flex: 3 }}>
							<FlexView hAlignContent='center'>
								<Button btnStyle="danger" onClick={() => { this.props.logout(); }} style={{ width: 72.5*scaleX, marginLeft: 5 }}>로그아웃</Button>
								<Button btnStyle="primary" onClick={() => { this.setState({ showModalPassCheck: true }) }} style={{ width: 150*scaleX, marginLeft: 5 }}>로그인 비밀번호 변경</Button>
								<Button btnStyle="primary" onClick={() => { getReasonInfoBtn(); }} style={{ width: 120*scaleX, marginLeft: 5 }}>보관사유 관리</Button>
							</FlexView>
						</FlexView>
						<SelectArea changeState={selectedArea} scaleX={scaleX}/>
						<FlexView style={{ flex: 3 }} hAlignContent='right' vAlignContent='bottom'>
							<FlexView column hAlignContent='center'>
								<label>키오스크 비밀번호</label>
								<input type="text" inputMode="numeric" pattern="[0-9]*" placeholder='키오스크 비밀번호' value={this.state.shopPwd} onChange={ evt => this.setState({ shopPwd: evt.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') }) } />
							</FlexView>
							<Button btnStyle="primary" style={{ width: 100*scaleX, marginLeft: 5 }} onClick={() => { kioskPwChangeBtn(); }}>변경</Button>
						</FlexView>
					</FlexView>

					<FlexView style={{ flex: 0.05 }}/>

					<FlexView style={{ flex: 0.4 }} hAlignContent='center' vAlignContent='center'>
						<FlexView column hAlignContent='center'>
							<label>함번호</label>
							<input style={{width: 60*scaleX}} disabled value={global.m_nLastBoxNo}/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>사용여부</label>
							<Dropdown className='used'
								arrowClosed={arrowClosed}
								arrowOpen={arrowOpen}
								options={m_listUsedVal} onChange={this.onUsedValChange} value={m_strCurrUsedVal} placeholder={m_strCurrUsedVal} />
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>타입</label>
							<Dropdown className='usetype'
								arrowClosed={arrowClosed}
								arrowOpen={arrowOpen}
								options={m_listDeliveryType} onChange={this.onDeliveryTypeChange} value={m_strCurrDeliveryType || ''} placeholder={m_strCurrDeliveryType} />
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>사원 아이디</label>
							<input value={this.state.userCode} onChange={ evt => this.setState( { userCode: evt.target.value } ) }/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>수령자 정보</label>
							<input disabled value={this.state.userName} onChange={ evt => this.setState( { userName: evt.target.value } ) }/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>자산정보</label>
							<input disabled value={this.state.userPhone} onChange={ evt => this.setState( { userPhone: evt.target.value } ) }/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>대리수령자</label>
							<input disabled value={this.state.transCode} onChange={ evt => this.setState( { transCode: evt.target.value } ) }/>
						</FlexView>
								
						<FlexView column hAlignContent='center'>
							<label>비밀번호</label>
							<input value={this.state.boxPassword} onChange={ evt => this.setState( { boxPassword: evt.target.value } ) }/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>시작시간</label>
							<Flatpickr className='dtInput'
								value={this.state.startTime}
								data-enable-time
								data-date-format='Y-m-d H:i:S'
								data-time_24hr
								onChange={ (selectedDates, dateStr, instance) => { this.setState({startTime: dateStr})  } }
							/>
						</FlexView>

						<FlexView column hAlignContent='center'>
							<label>종료시간</label>
							<Flatpickr className='dtInput'
								value={this.state.endTime}
								data-enable-time
								data-date-format='Y-m-d H:i:S'
								data-time_24hr
								onChange={ (selectedDates, dateStr, instance) => { this.setState({endTime: dateStr})  } }
							/>
						</FlexView>
					</FlexView>

					<FlexView style={{ flex: 0.05 }}/>

					<FlexView style={{ flex: 0.4 }} hAlignContent='center' vAlignContent='center'>
						<FlexView style={{ flex: 1.3 }}/>

						<FlexView vAlignContent='bottom' style={{ alignItems: 'flex-end' }}>
							<Button btnStyle="primary" onClick={() => { boxOpen(); }} style={{ width: 72.5*scaleX }}>열기</Button>
							<Button btnStyle="primary" onClick={boxOpenAll} style={{ width: 120*scaleX }}>전체열기</Button>
							<Button btnStyle="primary" onClick={() => { returnBtnClicked(); }} style={{ width: 72.5*scaleX }}>반납</Button>
							<Button btnStyle="primary" onClick={() => { updateBtnClicked(); }} style={{ width: 72.5*scaleX }}>업데이트</Button>
						</FlexView>

						<FlexView style={{ flex: 1.3 }}/>
					</FlexView>

					<FlexView style={{ flex: 0.1 }}/>

					<FlexView style={{ flex: 1.4 }} hAlignContent='center'>
						<FlexView style={{ flex: 0.8 }}/>

						<FlexView style={{ flex: 10.2, marginRight: 10, marginBottom: 10 }} hAlignContent='right'>
							<div
								className="ag-theme-balham"
								style={{
									height: '100%',
									width: '100%'
								}}
							>
								<AgGridReact
									columnDefs={columnDefs}
		              				rowSelection='single'
									rowData={this.state.rowData}
									defaultColDef={defaultColDef}
									navigateToNextCell={keyNavigation}
									onRowSelected={this.onRowSelected.bind(this)}
									onGridReady={this.onGridReady.bind(this)}
									onGridSizeChanged={this.onGridSizeChanged.bind(this)}
									overlayLoadingTemplate={overlayLoadingTemplate}
									overlayNoRowsTemplate={overlayNoRowsTemplate}
								/>
							</div>
						</FlexView>

						<FlexView column style={{ flex: 1, marginBottom: 10, justifyContent: 'space-between' }} hAlignContent='left'>
							<FlexView column hAlignContent='center'>
								<Dropdown className='searchType'
									arrowClosed={arrowClosed}
									arrowOpen={arrowOpen}
									options={m_listSearchType} onChange={this.onSearchTypeChange} value={m_strCurrSearchType} placeholder={m_strCurrSearchType} />
							</FlexView>

							<SearchInput sendData={getInput} scaleX={scaleX} schTitle='' />

							<ExcelFile filename={ sprintf( '사용현황_%s', moment().format('YYYY-MM-DD HH:mm:ss') ) } element={<Button btnStyle="primary" style={{ width: 150*scaleX }}>저장</Button>}>
								<ExcelSheet data={global.ctlSearchData} name={ sprintf( '사용현황_%s', moment().format('YYYY-MM-DD HH_mm_ss') ) }>
									<ExcelColumn label="구역" value="areaCode"/>
									<ExcelColumn label="함번호" value="boxNo"/>
									<ExcelColumn label="사원 아이디" value="userCode"/>
									<ExcelColumn label="수령자 정보" value="userName"/>
									<ExcelColumn label="자산정보" value="userPhone"/>
									<ExcelColumn label="대리수령자" value="transCode"/>
									<ExcelColumn label="비밀번호" value="boxPassword"/>
									<ExcelColumn label="타입" value="deliveryType"/>
									<ExcelColumn label="시작시간" value="startTime"/>
									<ExcelColumn label="종료시간" value="endTime"/>
								</ExcelSheet>
							</ExcelFile>
						</FlexView>

						<FlexView style={{ flex: 0.5 }}/>
					</FlexView>
				</FlexView>
			</div>
		)
	}
}
