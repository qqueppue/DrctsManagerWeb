import cssVars from 'css-vars-ponyfill';
import React from 'react';
import SelectArea from '../SelectArea';

import '../Styles.css';

import axios from 'axios';
import Dropdown from "react-dropdown";
import FlexView from 'react-flexview';

import '../../node_modules/flatpickr/dist/themes/light.css'
import Flatpickr from 'react-flatpickr'
import { Korean } from "flatpickr/dist/l10n/ko"
flatpickr.localize(Korean); // default locale is now Korean

import { Button } from '@trendmicro/react-buttons';
import '@trendmicro/react-buttons/dist/react-buttons.css';
import Modal from '@trendmicro/react-modal';
import '@trendmicro/react-modal/dist/react-modal.css';

var modalTitle = '';
var modalMsg = '';
var modalFunc = null;

const moment = require('moment');

var scaleX = 1;
var scaleY = 1;

const arrowClosed = (
  	<span className="arrow-closed" />
)
const arrowOpen = (
  	<span className="arrow-open" />
)

var m_listSearchType = ['사원 아이디', '수령자 정보'];
var m_strCurrSearchType = '사원 아이디';
var m_nSearchType = 0;

import SearchInput from '../SearchInput';
var searchText = '';

import { AgGridReact } from 'ag-grid-react';
import '../ag-grid.css';
import '../ag-theme-balham.css';

import ReactExport from "react-data-export";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export default class History extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataLoaded: false,
			allArea: global.hstAllArea,
			startTime: global.hstStartTime,
			endTime: global.hstEndTime,
			rowData: null,
			showModal: false,
			showModalSelect: false
		}
		this.onSearchTypeChange = this.onSearchTypeChange.bind(this)
		this.updateDimensions = this.updateDimensions.bind(this)
	}
  
	onSearchTypeChange( option ) {
		m_strCurrSearchType = option.value;
		for ( var i = 0, cnt = m_listSearchType.length; i < cnt; i++ ) {
			if ( m_listSearchType[i] === m_strCurrSearchType ) {
				m_nSearchType = i;
				break;
			}
		}
	}
	
	changeState() {
	    this.setState({
	        dataLoaded: !this.state.dataLoaded
	    });
	}

  	updateDimensions() {
		cssVars({
			variables: {
			'--scaleX': scaleX,
			'--scaleY': scaleY
			}
		});
		var declaration = document.styleSheets[0].rules[0].style;
		declaration.setProperty( '--scaleX', scaleX );
		declaration.setProperty( '--scaleY', scaleY );
		this.changeState();
	}
  
	componentWillMount() {
		this.updateDimensions();
	}
	
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentDidMount() {
		window.addEventListener("resize", this.updateDimensions);
	}
	
	onRowSelected(event) {
		if ( event.node.isSelected() ) {
			global.hstNodeId = event.node.id;
		}
	}

	onGridReady(params) {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
		this.gridApi.setRowData( global.hstSearchData );
		if ( this.gridApi.getRowNode(global.hstNodeId) == undefined )
			return;
		this.gridApi.getRowNode(global.hstNodeId).setSelected(true);
		this.gridApi.ensureIndexVisible(global.hstNodeId-1, 'top')
	}
  
	onGridSizeChanged() {
		this.gridApi.sizeColumnsToFit();
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
	
		function selectedArea() { }
	
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
			{headerName: '이벤트타입', field: 'eventType', width: 230*scaleX},
			{headerName: '생성시간', field: 'createDate', width: 250*scaleX},
			{headerName: '구역', field: 'areaCode', width: 230*scaleX},
			{headerName: '함번호', field: 'boxNo', width: 100*scaleX},
			{headerName: '사원 아이디', field: 'userCode', width: 200*scaleX},
			{headerName: '수령자 정보', field: 'userName', width: 200*scaleX},
			{headerName: '자산정보', field: 'userPhone', width: 200*scaleX},
			{headerName: '대리수령자', field: 'transCode', width: 200*scaleX},
			{headerName: '시작시간', field: 'startTime', width: 250*scaleX},
			{headerName: '종료시간', field: 'endTime', width: 250*scaleX},
		];

		const defaultColDef = {
			sortable: true,
			resizable: true,
			cellStyle: {textAlign: 'center'}
		};

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

		function searchBtnClicked() {
			that.gridApi.showLoadingOverlay();
			global.hstNodeId = -1;

			axios.get('/searchHistory', {
			    params: {
					fieldCode: global.m_nLastFieldIdx,
					dbName: global.m_strCurrDBName,
					areaCodeList: global.m_listAreaCode,
					allArea: that.state.allArea,
					area: global.m_strCurrAreaCode,
					searchType: m_nSearchType,
					searchText: searchText,
					startTime: that.state.startTime,
					endTime: that.state.endTime
			    }
			})
		    .then((response) => {
				appLogout(response.data.result);
				var hstSearchData = [];
				var eventType = '';
				var areaCode = '';
								
	        	response.data.map( (item) => {
					switch( item.eventType ){
						case 0:
							eventType = '사물함신규 ';
							break;
						case 1:
							eventType = '사물함열기';
							break;
						case 2:
							eventType = '사물함연장';
							break;
						case 3:
							eventType = '사물함반납';
							break;
						case 4:
							eventType = '사물함연체반납';
							break;
						case 5:
							eventType = '사용자 자산입고/반납';
							break;
						case 6:
							eventType = '사용자 자산수령';
							break;
						case 7:
							eventType = '관리자 자산입고/반납';
							break;
						case 8:
							eventType = '관리자 자산수령';
							break;
						case 9:
							eventType = '물품전달';
							break;
						case 10:
							eventType = '택배발송';
							break;
						case 11:
							eventType = '택배수거';
							break;
						case 12:
							eventType = '물품찾기';
							break;
						case 13:
							eventType = '관리자반납';
							break;
						case 14:
							eventType = '관리자디비수정';
							break;
						case 15:
							eventType = '관리자열기';
							break;
						case 16:
							eventType = '관리자자리이동';
							break;
						case 19:
							eventType = '택배기사 전화번호 수정';
							break;
						case 20:
							eventType = '세탁의뢰';
							break;
						case 21:
							eventType = '세탁시작';
							break;
						case 22:
							eventType = '세탁완료';
							break;
						case 23:
							eventType = '세탁수령';
							break;
						case 26:
							eventType = '한진택배발송완료';
							break;
						case 27:
							eventType = '한진택배기사집하';
							break;
						case 28:
							eventType = '한진택배기사집하거부';
							break;
						case 29:
							eventType = '한진택배발송예약';
							break;
						case 30:
							eventType = '한진택배발송예약취소';
							break;
						case 32:
							eventType = '관리자열기';
							break;
						default:
							eventType = '없음';
							break;
					}

					for ( var i = 0, cnt = global.m_listAreaCode.length; i < cnt; i++ ) {
						if ( global.m_listAreaCode[i] === item.areaCode ) {
							areaCode = global.m_listAreaName[i];
							break;
						}
					}

					hstSearchData.push({
						eventType: eventType,
						createDate: item.createDate,
						areaCode: areaCode,
						boxNo: item.boxNo,
						userCode: item.userCode,
						userName: item.userName,
						userPhone: item.userPhone,
						transCode: item.transCode,
						startTime: item.startTime,
						endTime: item.endTime,
					});
				});

			    global.hstSearchData = hstSearchData;

				if ( hstSearchData.length == 0 )
					that.gridApi.showNoRowsOverlay();
				else
					that.gridApi.hideOverlay();

				that.setState({rowData: hstSearchData});
		    })
		    .catch((err) => { console.log(err); });
		};

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

				<FlexView column height={document.getElementsByTagName('body')[0].clientHeight-56} width={document.getElementsByTagName('body')[0].clientWidth}> 
					<FlexView column id='boxGrid' className='boxgrid' style={{ flex: 3.5}}>
						<FlexView style={{ flex: 9.2 }} hAlignContent='left'>
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
					</FlexView>

					<FlexView style={{ flex: 0.4 }} hAlignContent='center' vAlignContent='center'>
						<FlexView style={{ flex: 3 }}>
							<FlexView hAlignContent='center'>
								<Button btnStyle="danger" onClick={() => { this.props.logout(); }} style={{ width: 72.5*scaleX, marginLeft: 5 }}>로그아웃</Button>
							</FlexView>
						</FlexView>

						<SelectArea changeState={selectedArea} scaleX={scaleX}/>
						<FlexView style={{ flex: 3 }} />
					</FlexView>

					<FlexView style={{ flex: 0.2 }}/>

					<FlexView style={{ flex: 0.4 }} hAlignContent='center' vAlignContent='center'>
						<FlexView style={{ flex: 1.3 }}/>

						<FlexView style={{ flex: 10.2, marginRight: 5, alignItems: 'flex-end' }} hAlignContent='center'>
							<FlexView column hAlignContent='center'>
								<label>구역 전체</label>
								<input type="checkbox" onChange={ () => { global.hstAllArea = !this.state.allArea; this.setState({allArea: !this.state.allArea}) } } defaultChecked={this.state.allArea}/>
		  					</FlexView>

							<FlexView column hAlignContent='center'>
								<label>시작시간</label>
								<Flatpickr
									className='dtInput'
									value={this.state.startTime}
									data-enable-time
									data-date-format='Y-m-d H:i:S'
									data-time_24hr
									onChange={ (selectedDates, dateStr, instance) => { global.hstStartTime = dateStr; this.setState({startTime: dateStr})  } }
								/>
		  					</FlexView>

							<FlexView column hAlignContent='center'>
								<label>종료시간</label>
								<Flatpickr
									className='dtInput'
									value={this.state.endTime}
									data-enable-time
									data-date-format='Y-m-d H:i:S'
									data-time_24hr
									onChange={ (selectedDates, dateStr, instance) => { global.hstEndTime = dateStr; this.setState({endTime: dateStr})  } }
								/>
							</FlexView>

							<FlexView column hAlignContent='center'>
								<label>검색종류</label>
								<Dropdown className='searchkind'
									arrowClosed={arrowClosed}
									arrowOpen={arrowOpen}
									options={m_listSearchType} onChange={this.onSearchTypeChange} value={m_strCurrSearchType} placeholder={m_strCurrSearchType} />
							</FlexView>

				      		<SearchInput sendData={getInput}  scaleX={scaleX} schTitle='검색어' />

							<FlexView>
								<ExcelFile filename={ sprintf( '사용내역_%s', moment().format('YYYY-MM-DD HH:mm:ss') ) } element={<Button btnStyle="primary" style={{ width: 150*scaleX }}>저장</Button>}>
									<ExcelSheet data={global.hstSearchData} name={ sprintf( '사용내역_%s', moment().format('YYYY-MM-DD HH_mm_ss') ) }>
										<ExcelColumn label="이벤트타입" value="eventType"/>
										<ExcelColumn label="생성시간" value="createDate"/>
										<ExcelColumn label="구역" value="areaCode"/>
										<ExcelColumn label="함번호" value="boxNo"/>
										<ExcelColumn label="사원 아이디" value="userCode"/>
										<ExcelColumn label="수령자 정보" value="userName"/>
										<ExcelColumn label="자산정보" value="userPhone"/>
										<ExcelColumn label="대리수령자" value="transCode"/>
										<ExcelColumn label="시작시간" value="startTime"/>
										<ExcelColumn label="종료시간" value="endTime"/>
									</ExcelSheet>
								</ExcelFile>
							</FlexView>
						</FlexView>

						<FlexView style={{ flex: 1.3 }}/>
					</FlexView>

					<FlexView style={{ flex: 1.8 }}/>
				</FlexView>
			</div>
    	)
	}
}
