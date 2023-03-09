import React from 'react';

import FlexView from 'react-flexview';

import { Button } from '@trendmicro/react-buttons';
import '@trendmicro/react-buttons/dist/react-buttons.css';

export default class SearchInput extends React.Component {
	constructor() {
		super();
		this.state = { 
			searchText: '',
			searchAreaCode: '',
			searchBoxNo: '',
			searchUserPhone: '',
			searchHistory: ''
		};
  	}

  	render() {
		if ( this.props.schTitle == '' ) {
	    	return (
				<FlexView column style={{ flex: 2, justifyContent: 'space-around' }}>
					<FlexView/>
					
					<FlexView>
			      		<input style={{ width: 145*this.props.scaleX }} value={this.state.searchText} onChange={ evt => this.setState( { searchText: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( this.state.searchText ) } }}/>
					</FlexView>
			      
					<FlexView>
			      		<Button btnStyle="primary" onClick={() => { this.props.sendData( this.state.searchText ) }} style={{ width: 150*this.props.scaleX }}>검색</Button>
					</FlexView>
		      
					<FlexView/>
				</FlexView>
	    	);
		 
		} else if ( this.props.schTitle == 'area' ) {
			let disableInput = this.props.disabled ? 'disabled' : '';
			let disableButton = this.props.disabled ? true : false;

	    	return (
				<FlexView>
					<FlexView hAlignContent='center'>
			      		<input disabled={disableInput} value={this.state.searchText} onChange={ evt => this.setState( { searchText: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( this.state.searchText ) } }}/>
					</FlexView>

					<FlexView hAlignContent='center'>
          				<Button disabled={disableButton} btnStyle="primary" onClick={() => { this.props.sendData( this.state.searchText ) }} style={{ width: 72.5*this.props.scaleX }}>구역조회</Button>
					</FlexView>
				</FlexView>
	    	);
	    
		} else if ( this.props.schTitle == 'hst' ) {
	    	return (
				<FlexView>
					<FlexView column hAlignContent='center'>
						<label>구역코드</label>
						<input style={{height: 38}} value={this.state.searchAreaCode} onChange={ evt => this.setState( { searchAreaCode: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.boxNoInput.focus() } }}/>
					</FlexView>

					<FlexView column hAlignContent='center'>
						<label>함번호</label>
						<input style={{width: 50*this.props.scaleX, height: 38}} ref={(input) => { this.boxNoInput = input; }} value={this.state.searchBoxNo} onChange={ evt => this.setState( { searchBoxNo: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.userPhoneInput.focus() } }}/>
					</FlexView>

					<FlexView column hAlignContent='center'>
						<label>사용자휴대폰</label>
			      		<input style={{height: 38}} ref={(input) => { this.userPhoneInput = input; }} value={this.state.searchUserPhone} onChange={ evt => this.setState( { searchUserPhone: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( { areaCode: this.state.searchAreaCode, boxNo: this.state.searchBoxNo, userPhone: this.state.searchUserPhone } ) } }}/>
					</FlexView>
			      
					<FlexView vAlignContent='bottom'>
			      		<Button btnStyle="primary" onClick={() => { this.props.sendData( { areaCode: this.state.searchAreaCode, boxNo: this.state.searchBoxNo, userPhone: this.state.searchUserPhone } ) }} style={{ height: 38 }}>검색</Button>
					</FlexView>
				</FlexView>
	    	);
	    
		} else if ( this.props.schTitle == 'user' ) {
	    	return (
				<FlexView>
					<FlexView column hAlignContent='center'>
						<label>구역코드</label>
						<input style={{width: 165*this.props.scaleX, height: 38}} value={this.state.searchAreaCode} onChange={ evt => this.setState( { searchAreaCode: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.historyInput.focus() } }}/>
					</FlexView>

					<FlexView column hAlignContent='center'>
						<label>히스토리</label>
						<input style={{width: 265*this.props.scaleX, height: 38}} ref={(input) => { this.historyInput = input; }} value={this.state.searchHistory} onChange={ evt => this.setState( { searchHistory: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( { areaCode: this.state.searchAreaCode, history: this.state.searchHistory } ) } }}/>
					</FlexView>

					<FlexView vAlignContent='bottom'>
			      		<Button btnStyle="primary" onClick={() => { this.props.sendData( { areaCode: this.state.searchAreaCode, history: this.state.searchHistory } ) }} style={{ height: 38 }}>검색</Button>
					</FlexView>
				</FlexView>
	    	);
	    
		} else if ( this.props.schTitle == 'tag' ) {
	    	return (
				<FlexView>
					<FlexView hAlignContent='center' vAlignContent='center'>
			      		<input style={{ width: 145*this.props.scaleX }} value={this.state.searchText} onChange={ evt => this.setState( { searchText: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( this.state.searchText ) } }}/>
					</FlexView>
			      
					<FlexView>
			      		<Button btnStyle="primary" onClick={() => { this.props.sendData( this.state.searchText ) }} style={{ width: 150*this.props.scaleX }}>검색</Button>
					</FlexView>
				</FlexView>
	    	);
	    
		} else {
	    	return (
				<FlexView>
					<FlexView column hAlignContent='center'>
						<label>{this.props.schTitle}</label>
			      		<input style={{ width: 145*this.props.scaleX }} value={this.state.searchText} onChange={ evt => this.setState( { searchText: evt.target.value } ) } onKeyPress={evt => {if (evt.key === 'Enter') { this.props.sendData( this.state.searchText ) } }}/>
					</FlexView>
			      
					<FlexView style={{ alignItems: 'flex-end' }}>
						<Button btnStyle="primary" onClick={() => { this.props.sendData( this.state.searchText ) }} style={{ width: 72.5*this.props.scaleX }}>검색</Button>
					</FlexView>
				</FlexView>
			);
		}
	}
}
