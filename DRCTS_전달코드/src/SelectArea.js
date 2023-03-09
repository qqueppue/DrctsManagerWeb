import React from 'react';

import './Styles.css';

import axios from 'axios';
import Dropdown from "react-dropdown";
import FlexView from 'react-flexview';

import * as Constants from './Constants';

const arrowClosed = (
  	<span className="arrow-closed" />
)
const arrowOpen = (
  	<span className="arrow-open" />
)

export default class SelectArea extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataLoaded: false,
		};
		this.setArea = this.setArea.bind(this)
		this.onFieldChange = this.onFieldChange.bind(this)
		this.onSiteChange = this.onSiteChange.bind(this)
		this.onGroupChange = this.onGroupChange.bind(this)
		this.onAreaChange = this.onAreaChange.bind(this)
	}

	changeState() {
	    this.setState({
	        dataLoaded: !this.state.dataLoaded
	    });
	    this.props.changeState();
	}

	setArea( siteName, groupName, groupCode, areaName ) {
		global.m_nLastBoxNo = 0;
		global.m_strCurrSiteName = siteName;
		for ( var i = 0, cnt = global.m_listSiteName.length; i < cnt; i++ ) {
			if ( global.m_listSiteName[i] === global.m_strCurrSiteName ) {
				global.m_nLastSiteIdx = i;
				global.m_strCurrSiteCode = global.m_listSiteCode[i];
				break;
			}
		}

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

			if ( groupName == '' ) {
				for ( var i = 0, cnt = global.m_listGroupCode.length; i < cnt; i++ ) {
					if ( global.m_listGroupCode[i] == groupCode ) {
						global.m_strCurrGroupName = global.m_listGroupName[i];
						global.m_nLastGroupIdx = i;
						global.m_strCurrGroupCode = global.m_listGroupCode[i];
						break;
					}
				}

			} else {
				global.m_strCurrGroupName = groupName;
				for ( var i = 0, cnt = global.m_listGroupName.length; i < cnt; i++ ) {
					if ( global.m_listGroupName[i] === global.m_strCurrGroupName ) {
						global.m_nLastGroupIdx = i;
						global.m_strCurrGroupCode = global.m_listGroupCode[i];
						break;
					}
				}
			}

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

				if ( areaName == '' ) {
					global.m_nLastAreaIdx = 0;
					global.m_strCurrAreaCode = global.m_listAreaCode[global.m_nLastAreaIdx];
					global.m_strCurrAreaName = global.m_listAreaName[global.m_nLastAreaIdx];
					global.m_strCurrDBName = global.m_listDBName[global.m_nLastAreaIdx];

				} else {
					global.m_strCurrAreaName = areaName;
					for ( var i = 0, cnt = global.m_listAreaName.length; i < cnt; i++ ) {
						if ( global.m_listAreaName[i] === global.m_strCurrAreaName ) {
							global.m_nLastAreaIdx = i;
							global.m_strCurrAreaCode = global.m_listAreaCode[i];
							global.m_strCurrDBName = global.m_listDBName[i];
							break;
						}
					}
				}

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
						this.changeState();
					})
					.catch((err) => { console.log(err); });
				})
				.catch((err) => { console.log(err); });
			})
			.catch((err) => { console.log(err); });
		})
		.catch((err) => { console.log(err); });
	}
	
	onFieldChange( option ) {
		global.m_nLastBoxNo = 0;
		global.m_listSearchResult = ['조회 결과 없음'];
		global.m_strCurrSearchResult = '조회 결과 없음';
		global.m_nLastResultIdx = 0;
		global.m_strCurrFieldName = option.value;
		
		for ( var i = 0, cnt = global.m_listFieldName.length; i < cnt; i++ ) {
			if ( global.m_listFieldName[i] === global.m_strCurrFieldName ) {
				global.m_nLastFieldIdx = i;
				break;
			}
		}

		while (global.m_listSiteCode.length) {
			global.m_listSiteCode.pop();
			global.m_listSiteName.pop();
		}

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
							this.changeState();
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
	
	onSiteChange( option ) {
		global.m_nLastBoxNo = 0;
		global.m_strCurrSiteName = option.value;
		for ( var i = 0, cnt = global.m_listSiteName.length; i < cnt; i++ ) {
			if ( global.m_listSiteName[i] === global.m_strCurrSiteName ) {
				global.m_nLastSiteIdx = i;
				global.m_strCurrSiteCode = global.m_listSiteCode[i];
				break;
			}
		}

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
						this.changeState();

					})
					.catch((err) => { console.log(err); });
				})
				.catch((err) => { console.log(err); });
			})
			.catch((err) => { console.log(err); });
		})
		.catch((err) => { console.log(err); });
	}
	
	onGroupChange( option ) {
		global.m_nLastBoxNo = 0;
		global.m_strCurrGroupName = option.value;
		
		for ( var i = 0, cnt = global.m_listGroupName.length; i < cnt; i++ ) {
			if ( global.m_listGroupName[i] === global.m_strCurrGroupName ) {
				global.m_nLastGroupIdx = i;
				global.m_strCurrGroupCode = global.m_listGroupCode[i];
				break;
			}
		}

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
					this.changeState();
				})
				.catch((err) => { console.log(err); });
			})
			.catch((err) => { console.log(err); });
	    })
	    .catch((err) => { console.log(err); });
	}
	
	onAreaChange( option ) {
		global.m_nLastBoxNo = 0;
		global.m_strCurrAreaName = option.value;
		
		for ( var i = 0, cnt = global.m_listAreaName.length; i < cnt; i++ ) {
			if ( global.m_listAreaName[i] === global.m_strCurrAreaName ) {
				global.m_nLastAreaIdx = i;
				global.m_strCurrAreaCode = global.m_listAreaCode[i];
				break;
			}
		}

    	global.m_strCurrDBName = global.m_listDBName[global.m_nLastAreaIdx];

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
				this.changeState();
			})
			.catch((err) => { console.log(err); });
	    })
	    .catch((err) => { console.log(err); });
	}
	
  	render() {
		let disableDropdown = this.props.disabled ? 'disabled' : '';

    	return (
			<FlexView style={{ flex: 4 }} hAlignContent='center' vAlignContent='center'>
				<FlexView hAlignContent='center'>
					<Dropdown disabled={disableDropdown} className='selarea'
						arrowClosed={arrowClosed}
						arrowOpen={arrowOpen}
						options={global.m_listAreaName} onChange={this.onAreaChange} value={global.m_strCurrAreaName} placeholder={global.m_strCurrAreaName} />
				</FlexView>
			</FlexView>
		)
  	}
}
