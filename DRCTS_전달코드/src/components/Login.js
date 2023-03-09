import React, { Component } from 'react';
import FlexView from 'react-flexview';
import { setCookie, getCookie, deleteCookie, HistoryLog } from '../Utils';

import App from '../App';

import axios from 'axios';

import * as Constants from '../Constants';

import { Button } from '@trendmicro/react-buttons';
import '@trendmicro/react-buttons/dist/react-buttons.css';
import Modal from '@trendmicro/react-modal';
import '@trendmicro/react-modal/dist/react-modal.css';

var modalTitle = '';
var modalMsg = '';
var modalFunc = null;

var UserInfo = {};

const moment = require('moment');

import PropTypes from 'prop-types';

export default class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirect: false,
			userID: '',
			userPW: '',
			autoLogin: true,
			showModalLogin: true,
			showModal: false,
		};
		this.onAutoLoginChange = this.onAutoLoginChange.bind(this);
	}
 
  	onAutoLoginChange() {
		this.setState({autoLogin: !this.state.autoLogin});
		if( !this.state.autoLogin ) {
			deleteCookie( 'AL' );
			deleteCookie( 'managerID' );
		}
	}

	componentWillMount() { }
	
	componentDidMount() {
		axios.get('/getInfo', {
			params: { }
		})
		.then((response) => {
			if (response.data.result == 'notLogined') {
				// console.log('notLG');
			} else {
				global.userPhone = response.data.result;
				this.setState({ redirect: true });
			}
		})
		.catch((err) => { console.log(err); });
	}
  
	render() {
		const {
			encrypt,
			decrypt,
		} = this.context;

		// private property
		var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

		// public method for encoding
		function base64Encode(input) {
			var output = '';
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = _utf8_encode(input);

			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
			}
			return output;
		}

		// private method for UTF-8 encoding
		function _utf8_encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		}

		function cipher( salt ) {
			let textToChars = text => text.split('').map(c => c.charCodeAt(0));
			let byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
			let applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

			return text => text.split('')
				.map(textToChars)
				.map(applySaltToChar)
				.map(byteHex)
				.join('');
		}

		let myCipher = cipher('wpdlxlqlTldlszmflqtus');

		axios.defaults.paramsSerializer = function(params) { 
			//cipher any text:
			var encrypted = myCipher( base64Encode( JSON.stringify( params ) ) );
			return encrypted;
		};

		let that = this;

		function openModal( title, msg, func ) {
			modalTitle = title;
			modalMsg = msg;
			if ( func == null )
				that.setState({showModal: true});
			
		}			

		function checkUserStatus() {
			switch ( UserInfo.UserStatus ) {
				case Constants.USER_STATUS_OUT:	
					return false;

				case Constants.USER_STATUS_TEMP:
					var date = moment().format('YYYY-MM-DD HH:mm:ss');
					return ( moment( UserInfo.PeriodDate ).diff( date ) >= 0 ) ?  true : false;

				default:
					return true;
			}
		}
		
		function login() {
			if ( that.state.userID == '' ) {
				openModal( '매니저로그인안내', '아이디를 입력해 주세요.', null );
				return;
			}

			if ( that.state.userPW == '' ) {
				openModal( '매니저로그인안내', '비밀번호를 입력해 주세요.', null );
				return;
			}

			that.state.userID = that.state.userID.replace(/(\s*)/g, "");
			that.state.userPW = that.state.userPW.replace(/(\s*)/g, "");

			axios.get('/login', {
				params: {
					// info: 'login',
					userID: that.state.userID,
					// userPW: that.state.userPW,
				}
			})
			.then((response) => {
				if ( response.data.length == 0 ) {
					openModal( '매니저로그인안내', '등록되지 않은 아이디입니다.', null );
					return;
				}

				UserInfo = response.data[0];
			
				if ( !checkUserStatus() ) {
					openModal( '매니저로그인안내', '등록되지 않은 아이디입니다.', null );
					return;
				} else {
					if ( that.state.userPW != UserInfo.UserPW ) {
						openModal( '매니저로그인안내', '비밀번호가 일치하지 않습니다.', null );
						return;
					}
				}

				axios.get('/setInfo', {
					params: {
						userID: that.state.userID,
					}
				})
				.then((response) => {
					if (response.data.result == 'success') {
						global.userPhone = that.state.userID;
						HistoryLog( Constants.LOG_LOGIN, 'Log On', '', 0, '', '' );
						that.setState({ redirect: true });
					}
				})
				.catch((err) => { console.log(err); });
			})
			.catch((err) => { console.log(err); });
		}

		if ( this.state.redirect ) {
			return <App/>;
		}

		return (
			<div>
				{this.state.showModalLogin &&
					<Modal
						disableOverlay={true}
						showCloseButton={false}
					>
						<Modal.Header>
							<Modal.Title>매니저 로그인</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<FlexView column style={{justifyContent: 'space-around'}} height={200} width={350}> 
								<FlexView style={{flex: 1}}/>

								<FlexView style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
									<label style={{fontSize: 16}}>아 이 디</label>
									<input autoFocus style={{width: 173, height: 21}} value={this.state.userID} onChange={ evt => this.setState({userID: evt.target.value}) } onKeyPress={evt => {if (evt.key === 'Enter') { this.pwInput.focus() } }}/>
								</FlexView>

								<FlexView style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
									<label style={{fontSize: 16}}>비밀번호</label>
									<input  ref={(input) => { this.pwInput = input; }} style={{width: 173, height: 21}} type='password' value={this.state.userPW} onChange={ evt => this.setState({userPW: evt.target.value}) } onKeyPress={evt => {if (evt.key === 'Enter') { login() } }}/>
								</FlexView>

								<FlexView style={{flex: 1}}/>
							</FlexView>
						</Modal.Body>

						<Modal.Footer>
							{/* <input type="checkbox" style={{width: 26, height: 26, verticalAlign: 'middle'}} onChange={ this.onAutoLoginChange } defaultChecked={this.state.autoLogin}/>
							<label style={{fontSize: 16, verticalAlign: 'middle', marginLeft: 5, marginRight: 50}}>자동 로그인</label> */}
							<Button btnStyle="primary" onClick={login} >로그인</Button>
							<Button onClick={ () => { this.setState({userID: '', userPW: ''}); } }>초기화</Button>
						</Modal.Footer>
					</Modal>
				}

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
							<Button btnStyle="primary" onClick={ () => { this.setState({showModal: false}); } }>확인</Button>
						</Modal.Footer>
					</Modal>
				}

			</div>
		);
	}
}

Login.contextTypes = {
	encrypt: PropTypes.func.isRequired,
	decrypt: PropTypes.func.isRequired,
}
